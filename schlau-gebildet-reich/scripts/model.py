#!/usr/bin/env python3
"""Rechenmodell der Story „Die Treppe und die Wolke“.

Es gibt für Deutschland keinen frei verfügbaren Datensatz, der Intelligenz, Abschluss und
Verdienst je Person enthält. Die Story zeigt deshalb an einzelnen Stellen eine
Modellbevölkerung. Sie ist so gebaut, dass sie die veröffentlichten Eckwerte trifft
(Verdienstverteilung, Anteile und Mediane der Abschlussgruppen) und die Korrelationen
aus der Literatur als offen benannte Annahme übernimmt.

Aufbau (Gauß-Kopula mit drei Größen je Person):

    g  Testleistung (IQ = 100 + 15·g), standardnormal
    e  Bildungsneigung, standardnormal, Korrelation mit g = R_GE
    y  Rang im Verdienst als Normalwert, Korrelation mit g = r, mit e = rho

    Abschlussgruppe  = e, geschnitten nach den Anteilen der Beschäftigten
    Verdienst        = Q(Phi(y)), Q = Quantilfunktion der amtlichen Verteilung

Nur Standardbibliothek, fester Startwert, gleiche Eingabe ergibt gleiche Ausgabe.
"""
import math
import random
from statistics import NormalDist

ND = NormalDist()
PHI = ND.cdf
PHI_INV = ND.inv_cdf


# ---------------------------------------------------------------------------
# Verdienstverteilung
# ---------------------------------------------------------------------------
class Earnings:
    """Quantilfunktion des Bruttojahresverdienstes, gestützt auf veröffentlichte Perzentile.

    Zwischen den Stützstellen wird der Logarithmus des Verdienstes linear im Normalwert
    interpoliert (stückweise Lognormalverteilung). Unterhalb der ersten Stützstelle gilt die
    Steigung des ersten Abschnitts, begrenzt durch eine Untergrenze. Oberhalb der letzten
    Stützstelle folgt ein Pareto-Ausläufer; sein Exponent wird so bestimmt, dass der
    Mittelwert der ganzen Verteilung dem veröffentlichten Mittelwert entspricht.
    """

    def __init__(self, anchors, mean, floor):
        self.anchors = sorted(anchors)                      # [(p, Euro)]
        self.z = [PHI_INV(p) for p, _ in self.anchors]
        self.ln = [math.log(v) for _, v in self.anchors]
        self.floor = floor
        self.p_top, self.v_top = self.anchors[-1]
        self.mean_target = mean
        self.alpha = self._fit_alpha()

    def body(self, z):
        zs, ln = self.z, self.ln
        if z <= zs[0]:
            slope = (ln[1] - ln[0]) / (zs[1] - zs[0])
            return max(self.floor, math.exp(ln[0] + slope * (z - zs[0])))
        for i in range(1, len(zs)):
            if z <= zs[i]:
                t = (z - zs[i - 1]) / (zs[i] - zs[i - 1])
                return math.exp(ln[i - 1] + t * (ln[i] - ln[i - 1]))
        return self.v_top

    def q(self, p, alpha=None):
        if p <= self.p_top:
            return self.body(PHI_INV(min(max(p, 1e-9), 1 - 1e-12)))
        a = alpha or self.alpha
        return self.v_top * ((1 - p) / (1 - self.p_top)) ** (-1 / a)

    def from_z(self, z):
        return self.q(PHI(z))

    def _body_mass(self, n=20000):
        # Integral von Q über [0, p_top], Mittelpunktregel
        h = self.p_top / n
        return sum(self.body(PHI_INV((i + 0.5) * h)) for i in range(n)) * h

    def _fit_alpha(self):
        body = self._body_mass()
        tail_p = 1 - self.p_top
        need = (self.mean_target - body) / tail_p            # nötiger Mittelwert im Ausläufer
        if need <= self.v_top:
            raise ValueError("Mittelwert liegt unter dem, was die Stützstellen allein ergeben")
        # Mittelwert Pareto ab v_top = v_top * a / (a - 1)
        return need / (need - self.v_top)

    def mean(self):
        return self._body_mass() + (1 - self.p_top) * self.v_top * self.alpha / (self.alpha - 1)

    def share_above(self, p):
        """Anteil der Verdienstsumme, der auf die Personen oberhalb des Perzentils p entfällt."""
        if p >= self.p_top:
            a = self.alpha
            top = (1 - p) * self.q(p) * a / (a - 1)
        else:
            n = 4000
            h = (self.p_top - p) / n
            top = sum(self.body(PHI_INV(p + (i + 0.5) * h)) for i in range(n)) * h
            top += (1 - self.p_top) * self.v_top * self.alpha / (self.alpha - 1)
        return top / self.mean()

    def percentile_of(self, value):
        """Anteil der Personen mit einem Verdienst unter value."""
        lo, hi = 0.0, 1 - 1e-9
        for _ in range(80):
            mid = (lo + hi) / 2
            if self.q(mid) < value:
                lo = mid
            else:
                hi = mid
        return (lo + hi) / 2


# ---------------------------------------------------------------------------
# Kopula
# ---------------------------------------------------------------------------
def weights(r, rho, r_ge):
    """y = a·g + b·e + c·z3 mit corr(y,g) = r und corr(y,e) = rho."""
    b = (rho - r_ge * r) / (1 - r_ge ** 2)
    a = r - r_ge * b
    c2 = 1 - (a * a + b * b + 2 * a * b * r_ge)
    if c2 <= 0:
        raise ValueError("Korrelationen nicht miteinander vereinbar")
    return a, b, math.sqrt(c2)


def partial_r(r, rho, r_ge):
    """Korrelation von g und y bei festgehaltenem e."""
    return (r - r_ge * rho) / math.sqrt((1 - r_ge ** 2) * (1 - rho ** 2))


def draw(n, seed, r_ge):
    """n Personen: (g, e, z3). g und e hängen nicht von r ab, damit jede Person beim
    Umschalten von r ihre Testleistung und ihre Gruppe behält."""
    rnd = random.Random(seed)
    s = math.sqrt(1 - r_ge ** 2)
    out = []
    for _ in range(n):
        z1, z2, z3 = rnd.gauss(0, 1), rnd.gauss(0, 1), rnd.gauss(0, 1)
        out.append((z1, r_ge * z1 + s * z2, z3))
    return out


def cuts(shares):
    """Schwellen im Normalwert für geordnete Gruppen mit den gegebenen Anteilen."""
    acc, out = 0.0, []
    for s in shares[:-1]:
        acc += s
        out.append(PHI_INV(acc))
    return out


def group_of(e, thresholds):
    k = 0
    for t in thresholds:
        if e > t:
            k += 1
    return k


def median(xs):
    xs = sorted(xs)
    n = len(xs)
    return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2


def quantile(xs_sorted, p):
    i = p * (len(xs_sorted) - 1)
    lo = int(math.floor(i))
    hi = min(lo + 1, len(xs_sorted) - 1)
    return xs_sorted[lo] + (i - lo) * (xs_sorted[hi] - xs_sorted[lo])


def group_medians_z(rho, thresholds, n=4000):
    """Median des Verdienst-Normalwerts je Gruppe, numerisch (ohne Zufall).

    Bedingt auf e ist y normalverteilt mit Mittel rho·e und Streuung sqrt(1-rho²). Die
    Verteilung von y in einer Gruppe ist die Mischung über die e der Gruppe."""
    edges = [-8.0] + list(thresholds) + [8.0]
    sd = math.sqrt(1 - rho * rho)
    meds = []
    for k in range(len(edges) - 1):
        lo, hi = PHI(edges[k]), PHI(edges[k + 1])
        es = [PHI_INV(lo + (i + 0.5) * (hi - lo) / n) for i in range(n)]

        def cdf(y):
            return sum(PHI((y - rho * e) / sd) for e in es) / n

        a, b = -6.0, 6.0
        for _ in range(50):
            m = (a + b) / 2
            if cdf(m) < 0.5:
                a = m
            else:
                b = m
        meds.append((a + b) / 2)
    return meds


def fit_rho(earn, thresholds, target_ratio, lo=0.05, hi=0.9):
    """rho so, dass die Gruppenmediane relativ zum Gesamtmedian am besten zu den
    veröffentlichten Verhältnissen passen (kleinste Quadrate der Log-Abweichung)."""
    med_all = earn.from_z(0.0)

    def loss(rho):
        meds = group_medians_z(rho, thresholds, n=600)
        return sum((math.log(earn.from_z(m) / med_all) - math.log(t)) ** 2 for m, t in zip(meds, target_ratio))

    # goldener Schnitt
    gr = (math.sqrt(5) - 1) / 2
    a, b = lo, hi
    c, d = b - gr * (b - a), a + gr * (b - a)
    fc, fd = loss(c), loss(d)
    for _ in range(40):
        if fc < fd:
            b, d, fd = d, c, fc
            c = b - gr * (b - a)
            fc = loss(c)
        else:
            a, c, fc = c, d, fd
            d = a + gr * (b - a)
            fd = loss(d)
    return (a + b) / 2
