#!/usr/bin/env python3
"""Überschlag „Menschen statt Regionen“ für die Story „Zwei Heimaten“ → data/person_model.json.

Die Story vergleicht Regionsdurchschnitte. Dieses Skript verteilt jede Einheit der feinsten
Atlas-Ebene (FINE = 2) um ihren Mittelwert (lognormal bzw. log-logistisch, Ungleichheit aus dem
Gini des Landes), baut daraus eine Weltverteilung über Personen und ordnet darin die Menschen aus
Oberspreewald-Lausitz (DE40B), Köln (DEA23) und Deutschland ein. Gerechnet werden mehrere Varianten
(Basisgröße, Gini-Ansatz, Verteilungsform); robust ist nur, was in allen Varianten gleich ausgeht.

Nur Standardbibliothek. Aufruf:

    python3 -I wohlstand-story/scripts/person_model.py

Einzige Datenquelle: wohlstandsatlas/atlas-data.js (Ladecode wie in build_story_data.py).
"""
import json
import math
import time
from collections import defaultdict
from pathlib import Path
from statistics import NormalDist

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
SRC = REPO / "wohlstandsatlas" / "atlas-data.js"
OUT = ROOT / "data" / "person_model.json"

KOELN, OSL = "DEA23", "DE40B"
FINE = 2
K_POINTS = 100          # Stützstellen je Einheit für Welt-Gini / Anteil der ärmeren Hälfte
K_CAL = 40              # Stützstellen je Einheit bei der Kalibrierung des Gini innerhalb der Regionen
GINI_SHIFT = 5.0        # ± Gini-Punkte
GINI_MIN, GINI_MAX = 15.0, 70.0   # Kappung nach Verschiebung (Punkte)
GINI_W_FLOOR = 10.0     # Untergrenze für den Gini innerhalb einer Region
STADT_LAND = 5.0        # Variante: Köln +5, OSL −5 Gini-Punkte gegenüber der Kalibrierung
N = NormalDist()
SQRT2 = math.sqrt(2.0)


def load_atlas():
    s = SRC.read_text(encoding="utf-8")
    j = s.index(",\ndata:")
    k = s.index(",\nts:")
    return json.loads(s[j + len(",\ndata:"):k])


data = load_atlas()
U = data["units"]
by = {u["id"]: u for u in U}
lvl = lambda l: [u for u in U if l in u["lv"] and u.get("pop")]
COUNTRIES = lvl(0)
WORLD = sum(u["pop"] for u in COUNTRIES)                      # Nenner wie in der Story
FINE_ALL = lvl(FINE)
FINE_POP = sum(u["pop"] for u in FINE_ALL)
FINE_DATA = [u for u in FINE_ALL if u.get("gdp_pc_ppp")]       # dieselbe Menge wie in der Story
DATA_POP = sum(u["pop"] for u in FINE_DATA)
NODATA_POP = WORLD - DATA_POP


def wmedian(pairs):
    """Bevölkerungsgewichteter Median aus (Wert, Gewicht)."""
    pairs = sorted(pairs)
    tot, acc = sum(w for _, w in pairs), 0.0
    for v, w in pairs:
        acc += w
        if acc >= tot / 2:
            return v
    return None


# ---------------------------------------------------------------------------
# Ungleichheit: Gini je Land, Ersatz für Länder ohne Gini
# ---------------------------------------------------------------------------
cont_gini = defaultdict(list)
for c in COUNTRIES:
    if c.get("gini"):
        cont_gini[c.get("ct")].append((c["gini"], c["pop"]))
CONT_GINI = {ct: wmedian(v) for ct, v in cont_gini.items()}
GINI = {}
GINI_IMPUTED = []
for c in COUNTRIES:
    if c.get("gini"):
        GINI[c["id"]] = c["gini"]
    else:
        GINI[c["id"]] = CONT_GINI[c.get("ct")]
        GINI_IMPUTED.append(c["id"])
gini_imp_pop = sum(by[c]["pop"] for c in GINI_IMPUTED)

# ---------------------------------------------------------------------------
# Basisgrößen je Einheit
# ---------------------------------------------------------------------------
# Elastizität des regionalen Haushaltseinkommens gegenüber dem regionalen BIP, geschätzt aus den
# Ländern, die echte regionale Einkommensdaten haben (Ebene 1, ohne Ersatzwerte): Steigung von
# ln(hh_r/hh_Land) auf ln(BIP_r/BIP_Land), gewichtet mit der Bevölkerung; Median über die Länder.
slopes = []
for cid in sorted({u["country"] for u in lvl(1)}):
    C = by[cid]
    us = [u for u in lvl(1) if u["country"] == cid and u.get("hh_note") is None
          and u.get("hh_pc_ppp") and u.get("gdp_pc_ppp") and C.get("hh_pc_ppp")]
    if len(us) < 4:
        continue
    xs = [math.log(u["gdp_pc_ppp"] / C["gdp_pc_ppp"]) for u in us]
    ys = [math.log(u["hh_pc_ppp"] / C["hh_pc_ppp"]) for u in us]
    ws = [u["pop"] for u in us]
    W = sum(ws)
    mx, my = sum(w * x for w, x in zip(ws, xs)) / W, sum(w * y for w, y in zip(ws, ys)) / W
    vx = sum(w * (x - mx) ** 2 for w, x in zip(ws, xs))
    if vx > 0:
        slopes.append((cid, sum(w * (x - mx) * (y - my) for w, x, y in zip(ws, xs, ys)) / vx))
BETA = sorted(b for _, b in slopes)[len(slopes) // 2]

# Haushaltswert eines Landes, wo die Weltbank keinen hat: BIP pro Kopf × gewichteter Median des
# Verhältnisses Haushaltskonsum/BIP auf dem Kontinent.
cont_ratio = defaultdict(list)
for c in COUNTRIES:
    if c.get("hh_pc_ppp") and c.get("gdp_pc_ppp"):
        cont_ratio[c.get("ct")].append((c["hh_pc_ppp"] / c["gdp_pc_ppp"], c["pop"]))
CONT_RATIO = {ct: wmedian(v) for ct, v in cont_ratio.items()}


def country_hh(cid):
    c = by[cid]
    return c["hh_pc_ppp"] if c.get("hh_pc_ppp") else c["gdp_pc_ppp"] * CONT_RATIO[c.get("ct")]


FLAT = "nur Landeswert (keine regionalen Einkommensdaten)"


def hh_values(beta):
    """Haushaltskonsum pro Kopf je Einheit. Atlaswert, wo er regionale Information trägt; sonst
    Landeswert × (BIP_r/BIP_Land)^beta, je Land auf den Landeswert normiert."""
    val, imp = {}, defaultdict(list)
    for u in FINE_DATA:
        if u.get("hh_pc_ppp") and u.get("hh_note") != FLAT:
            val[u["id"]] = u["hh_pc_ppp"]
        else:
            imp[u["country"]].append(u)
    stats = {"units": 0, "pop": 0.0, "countries_no_hh": set()}
    for cid, us in imp.items():
        hc, gc = country_hh(cid), by[cid]["gdp_pc_ppp"]
        if not by[cid].get("hh_pc_ppp"):
            stats["countries_no_hh"].add(cid)
        raw = {u["id"]: hc * (u["gdp_pc_ppp"] / gc) ** beta for u in us}
        target = sum(u["pop"] * (u["hh_pc_ppp"] if u.get("hh_pc_ppp") else hc) for u in us)
        f = target / sum(u["pop"] * raw[u["id"]] for u in us)
        for u in us:
            val[u["id"]] = raw[u["id"]] * f
            if not u.get("hh_pc_ppp"):
                stats["units"] += 1
                stats["pop"] += u["pop"]
    return val, stats


BASES = {"gdp": {u["id"]: u["gdp_pc_ppp"] for u in FINE_DATA}}
BASES["hh"], HH_STATS = hh_values(BETA)
BASES["hh_b0"], _ = hh_values(0.0)
BASES["hh_b1"], _ = hh_values(1.0)

# ---------------------------------------------------------------------------
# Verteilungsformen (beide log-Lage-Skala-Familien: ln X = loc + s·Z)
# ---------------------------------------------------------------------------
class LogNormal:
    name = "lognormal"

    @staticmethod
    def s_from_gini(g):
        return SQRT2 * N.inv_cdf((g + 1) / 2)

    @staticmethod
    def loc(mean, s):
        return math.log(mean) - s * s / 2

    @staticmethod
    def cdf_z(z):
        return N.cdf(z)

    @staticmethod
    def q_z(p):
        return N.inv_cdf(p)

    @staticmethod
    def points(mean, s, k):
        """k gleich wahrscheinliche Klassen mit exaktem Klassenmittel (Gesamtmittel bleibt exakt)."""
        zs = [-math.inf] + [N.inv_cdf(i / k) for i in range(1, k)] + [math.inf]
        cd = [0.0] + [N.cdf(z - s) for z in zs[1:-1]] + [1.0]
        return [mean * k * (cd[i + 1] - cd[i]) for i in range(k)]


class LogLogistic:
    """Fisk-Verteilung: Gini = s (= 1/Formparameter), schwerer oberer Rand als lognormal."""
    name = "loglogistisch"

    @staticmethod
    def s_from_gini(g):
        return g

    @staticmethod
    def loc(mean, s):
        f = 1.0 if s < 1e-9 else (math.pi * s) / math.sin(math.pi * s)
        return math.log(mean / f)

    @staticmethod
    def cdf_z(z):
        if z < -700:
            return 0.0
        if z > 700:
            return 1.0
        return 1.0 / (1.0 + math.exp(-z))

    @staticmethod
    def q_z(p):
        return math.log(p / (1 - p))

    @staticmethod
    def points(mean, s, k):
        """Mittlere Quantile je Klasse, auf das exakte Mittel normiert."""
        loc = LogLogistic.loc(mean, s)
        pts = [math.exp(loc + s * math.log((i + 0.5) / (k - i - 0.5))) for i in range(k)]
        f = mean * k / sum(pts)
        return [p * f for p in pts]


FORMS = {"lognormal": LogNormal, "fisk": LogLogistic}


def gini_points(pts):
    """pts: Liste (Wert, Gewicht). Gibt (Gini, Anteil der ärmeren Hälfte am Gesamt) zurück."""
    pts.sort()
    W = sum(w for _, w in pts)
    T = sum(v * w for v, w in pts)
    L_prev, area, acc_w, acc_v = 0.0, 0.0, 0.0, 0.0
    for v, w in pts:
        acc_w += w
        acc_v += v * w
        L = acc_v / T
        area += (w / W) * (L_prev + L)
        L_prev = L
    return 1 - area


def bottom_share(pts, half):
    """Anteil der ärmsten `half` Personen am Gesamt; pts sortiert."""
    T = sum(v * w for v, w in pts)
    acc_w, acc_v = 0.0, 0.0
    for v, w in pts:
        if acc_w + w <= half:
            acc_w += w
            acc_v += v * w
        else:
            acc_v += v * (half - acc_w)
            break
    return acc_v / T


# ---------------------------------------------------------------------------
# Kalibrierung: Gini innerhalb der Regionen so, dass die Mischung das Landes-Gini trifft
# ---------------------------------------------------------------------------
BY_COUNTRY = defaultdict(list)
for u in FINE_DATA:
    BY_COUNTRY[u["country"]].append(u)


def mixture_gini(units, vals, s, form, k):
    pts = []
    for u in units:
        w = u["pop"] / k
        pts.extend((p, w) for p in form.points(vals[u["id"]], s, k))
    return gini_points(pts)


def calibrate(base, form, k=K_CAL):
    """Gini innerhalb der Regionen (0–1) je Land; Bisektion auf dem Gini der Mischung."""
    vals = BASES[base]
    out, between, floored = {}, {}, []
    for cid, units in BY_COUNTRY.items():
        g = GINI[cid] / 100
        if len(units) == 1:
            out[cid] = g
            continue
        gb = mixture_gini(units, vals, form.s_from_gini(1e-6), form, 1)
        between[cid] = gb
        lo, hi = GINI_W_FLOOR / 100, g
        if mixture_gini(units, vals, form.s_from_gini(lo), form, k) >= g:
            out[cid] = lo
            floored.append(cid)
            continue
        for _ in range(22):
            mid = (lo + hi) / 2
            if mixture_gini(units, vals, form.s_from_gini(mid), form, k) < g:
                lo = mid
            else:
                hi = mid
        out[cid] = (lo + hi) / 2
    return out, between, floored


# ---------------------------------------------------------------------------
# Ein Modelllauf
# ---------------------------------------------------------------------------
class Model:
    def __init__(self, base, gini_mode, form_key, k=K_POINTS, calib=None, override=None):
        self.form = FORMS[form_key]
        vals = BASES[base]
        self.units = []           # (id, country, pop, mean, loc, s)
        self.gw = {}
        for u in FINE_DATA:
            cid = u["country"]
            if gini_mode == "nat":
                g = GINI[cid]
            elif gini_mode in ("nat-5", "nat+5"):
                g = min(GINI_MAX, max(GINI_MIN, GINI[cid] + (GINI_SHIFT if gini_mode == "nat+5" else -GINI_SHIFT)))
            elif gini_mode in ("within", "within_stadtland"):
                g = calib[cid] * 100
            elif gini_mode == "zero":
                g = 1e-4
            else:
                raise ValueError(gini_mode)
            if gini_mode == "within_stadtland":
                if u["id"] == KOELN:
                    g += STADT_LAND
                elif u["id"] == OSL:
                    g -= STADT_LAND
            if override and u["id"] in override:
                g = override[u["id"]]
            s = self.form.s_from_gini(g / 100)
            m = vals[u["id"]]
            self.gw[u["id"]] = g
            self.units.append((u["id"], cid, u["pop"], m, self.form.loc(m, s), s))
        self.idx = {t[0]: t for t in self.units}
        self.k = k

    # Anteil der Weltbevölkerung (Nenner: ganze Welt wie in der Story) mit Wert unter x
    def world_below(self, x, subset=None):
        lx = math.log(x)
        cdf = self.form.cdf_z
        tot = 0.0
        for _, cid, pop, _, loc, s in (subset or self.units):
            tot += pop * (cdf((lx - loc) / s) if s > 0 else (1.0 if lx > loc else 0.0))
        return tot / WORLD

    def unit_q(self, uid, p):
        _, _, _, _, loc, s = self.idx[uid]
        return math.exp(loc + s * self.form.q_z(p))

    def unit_cdf(self, uid, x):
        _, _, _, _, loc, s = self.idx[uid]
        return self.form.cdf_z((math.log(x) - loc) / s)

    def mix_q(self, units, p):
        """Quantil einer Mischung (z. B. alle Personen in Deutschland), Bisektion in ln x."""
        P = sum(t[2] for t in units)
        lo, hi = math.log(10.0), math.log(1e7)
        for _ in range(60):
            mid = (lo + hi) / 2
            if self.world_below(math.exp(mid), units) * WORLD / P < p:
                lo = mid
            else:
                hi = mid
        return math.exp((lo + hi) / 2)

    def points(self):
        pts = []
        for _, _, pop, m, _, s in self.units:
            w = pop / self.k
            pts.extend((p, w) for p in self.form.points(m, s, self.k))
        return pts

    def results(self, plaus=True):
        R = {}
        for key, uid in (("osl", OSL), ("koeln", KOELN)):
            for p in (10, 25, 50, 75, 90):
                R[f"{key}_p{p}"] = self.world_below(self.unit_q(uid, p / 100)) * 100
            R[f"{key}_mean_world_below"] = self.world_below(self.idx[uid][3]) * 100
        R["between_means"] = R["koeln_mean_world_below"] - R["osl_mean_world_below"]
        osl_med, kol_med = self.unit_q(OSL, 0.5), self.unit_q(KOELN, 0.5)
        R["koeln_below_osl_median"] = self.unit_cdf(KOELN, osl_med) * 100
        R["osl_above_koeln_median"] = (1 - self.unit_cdf(OSL, kol_med)) * 100
        R["koeln_p10_minus_osl_p50"] = R["koeln_p10"] - R["osl_p50"]
        R["median_gap"] = R["koeln_p50"] - R["osl_p50"]
        R["osl_spread_p10_p90"] = R["osl_p90"] - R["osl_p10"]
        R["koeln_spread_p10_p90"] = R["koeln_p90"] - R["koeln_p10"]
        R["koeln_p10_to_osl_median_ratio"] = self.unit_q(KOELN, 0.1) / osl_med
        de = [t for t in self.units if t[1] == "DEU"]
        for p in (10, 50, 90):
            R[f"deu_p{p}"] = self.world_below(self.mix_q(de, p / 100)) * 100
        # Weltmedian: Wert, unter dem die Hälfte der Weltbevölkerung (Nenner wie Story) liegt
        lo, hi = math.log(10.0), math.log(1e7)
        for _ in range(60):
            mid = (lo + hi) / 2
            if self.world_below(math.exp(mid)) < 0.5:
                lo = mid
            else:
                hi = mid
        wmed = math.exp((lo + hi) / 2)
        R["world_median_value"] = wmed
        de_pop = sum(t[2] for t in de)
        R["deu_above_world_median"] = (1 - self.world_below(wmed, de) * WORLD / de_pop) * 100
        R["osl_above_world_median"] = (1 - self.unit_cdf(OSL, wmed)) * 100
        R["koeln_above_world_median"] = (1 - self.unit_cdf(KOELN, wmed)) * 100
        R["gini_w_osl"], R["gini_w_koeln"] = self.gw[OSL], self.gw[KOELN]
        if plaus:
            pts = self.points()
            R["world_gini"] = gini_points(pts)
            R["poor_half_share"] = bottom_share(pts, WORLD / 2) * 100
            # Gini Deutschlands im Modell (Kontrolle der Kalibrierung)
            dpts = []
            for _, cid, pop, m, _, s in de:
                dpts.extend((p, pop / self.k) for p in self.form.points(m, s, self.k))
            R["deu_model_gini"] = gini_points(dpts)
        return R


# ---------------------------------------------------------------------------
# Varianten rechnen
# ---------------------------------------------------------------------------
t0 = time.time()
CAL = {}
CAL_INFO = {}
for base in ("gdp", "hh", "hh_b0", "hh_b1"):
    for fk in ("lognormal", "fisk"):
        if base.startswith("hh_b") and fk == "fisk":
            continue
        g, between, floored = calibrate(base, FORMS[fk])
        CAL[(base, fk)] = g
        CAL_INFO[(base, fk)] = {
            "deu_gini_innen": round(g["DEU"] * 100, 1),
            "deu_gini_zwischen_regionen": round(between.get("DEU", 0) * 100, 1),
            "auf_untergrenze": floored,
            "gini_innen_bevgew_mittel": round(sum(u["pop"] * g[u["country"]] for u in FINE_DATA) / DATA_POP * 100, 1),
            "gini_land_bevgew_mittel": round(sum(u["pop"] * GINI[u["country"]] for u in FINE_DATA) / DATA_POP, 1),
        }

BASE_LABEL = {"gdp": "BIP pro Kopf (KKP)", "hh": "Konsum der Haushalte pro Kopf (KKP)",
              "hh_b0": "Konsum, fehlende Regionen = Landeswert", "hh_b1": "Konsum, fehlende Regionen ∝ BIP"}
GINI_LABEL = {"nat": "Landes-Gini", "nat-5": "Landes-Gini − 5", "nat+5": "Landes-Gini + 5",
              "within": "Gini innerhalb der Region kalibriert", "within_stadtland": "kalibriert, Köln +5 / OSL −5"}

VARIANTS = []
for base in ("gdp", "hh"):
    for gm in ("nat", "nat-5", "nat+5", "within"):
        for fk in ("lognormal", "fisk"):
            VARIANTS.append((base, gm, fk))
    VARIANTS.append((base, "within_stadtland", "lognormal"))
VARIANTS += [("hh_b0", "within", "lognormal"), ("hh_b1", "within", "lognormal")]

MAIN = ("hh", "within", "lognormal")


def vid(v):
    return "|".join(v)


RES = {}
for v in VARIANTS:
    base, gm, fk = v
    m = Model(base, gm, fk, calib=CAL.get((base, fk)))
    RES[vid(v)] = m.results()

# ---------------------------------------------------------------------------
# Selbstprüfungen
# ---------------------------------------------------------------------------
checks = {}
checks["bevoelkerung"] = {
    "welt_nenner": WORLD, "feinste_ebene": FINE_POP, "mit_daten": DATA_POP, "ohne_daten": NODATA_POP,
    "ohne_daten_einheiten": sorted(u["id"] for u in FINE_ALL if not u.get("gdp_pc_ppp")),
    "regel": "Wie in der Story: Nenner ist die ganze Weltbevölkerung, Menschen ohne Daten zählen nie als ‚darunter‘. "
             "Alle Anteile könnten dadurch um höchstens %.1f Prozentpunkte zu niedrig sein." % (NODATA_POP / WORLD * 100),
}
# Massenerhaltung: Summe der Gewichte der Stützstellen = Bevölkerung mit Daten; Gesamtwert exakt
mm = Model(*MAIN, calib=CAL[(MAIN[0], MAIN[2])])
pts = mm.points()
checks["bevoelkerung"]["summe_stuetzstellen"] = sum(w for _, w in pts)
checks["bevoelkerung"]["welt_cdf_oben"] = mm.world_below(1e8) * WORLD
checks["bevoelkerung"]["summe_wert_rel_fehler"] = abs(sum(p * w for p, w in pts) / sum(t[2] * t[3] for t in mm.units) - 1)

# Grenzfall Gini → 0 (BIP): muss die Regionswerte der Story liefern
z = Model("gdp", "zero", "lognormal")
zres = z.results()
checks["gini_null"] = {
    "osl_world_below": zres["osl_mean_world_below"], "koeln_world_below": zres["koeln_mean_world_below"],
    "between": zres["between_means"], "poor_half_share": zres["poor_half_share"], "world_gini": zres["world_gini"],
    "story": {"osl": 85.6, "koeln": 98.3, "between": 12.7, "poor_half_share": 15.8},
}
zf = Model("gdp", "zero", "fisk")
checks["gini_null"]["fisk_osl"] = zf.world_below(zf.idx[OSL][3]) * 100
checks["gini_null"]["fisk_koeln"] = zf.world_below(zf.idx[KOELN][3]) * 100

# Auflösung: Stützstellen verdoppeln (Kalibrierung und Weltverteilung)
cal2 = calibrate(MAIN[0], FORMS[MAIN[2]], k=2 * K_CAL)[0]
r2 = Model(*MAIN, k=2 * K_POINTS, calib=cal2).results()
r1 = RES[vid(MAIN)]
checks["aufloesung"] = {
    "k_points": [K_POINTS, 2 * K_POINTS], "k_cal": [K_CAL, 2 * K_CAL],
    "max_abw_prozentpunkte": max(abs(r2[k] - r1[k]) for k in r1 if k.startswith(("osl_", "koeln_", "deu_", "between"))
                                 and not k.startswith(("koeln_p10_to",))),
    "world_gini": [r1["world_gini"], r2["world_gini"]],
    "poor_half_share": [r1["poor_half_share"], r2["poor_half_share"]],
}
rg = Model("gdp", "nat", "lognormal", k=2 * K_POINTS).results()
checks["aufloesung"]["gdp_nat_world_gini"] = [RES["gdp|nat|lognormal"]["world_gini"], rg["world_gini"]]

# ---------------------------------------------------------------------------
# Zusammenfassen
# ---------------------------------------------------------------------------
LABELS = {
    "osl_p10": "Weltperzentil: ärmstes Zehntel in OSL (P10)",
    "osl_p25": "Weltperzentil: OSL P25",
    "osl_p50": "Weltperzentil: mittlerer Mensch in OSL (Median)",
    "osl_p75": "Weltperzentil: OSL P75",
    "osl_p90": "Weltperzentil: reichstes Zehntel in OSL (P90)",
    "koeln_p10": "Weltperzentil: ärmstes Zehntel in Köln (P10)",
    "koeln_p25": "Weltperzentil: Köln P25",
    "koeln_p50": "Weltperzentil: mittlerer Mensch in Köln (Median)",
    "koeln_p75": "Weltperzentil: Köln P75",
    "koeln_p90": "Weltperzentil: reichstes Zehntel in Köln (P90)",
    "osl_mean_world_below": "Anteil der Menschheit (Personen) unter dem OSL-Mittelwert",
    "koeln_mean_world_below": "Anteil der Menschheit (Personen) unter dem Kölner Mittelwert",
    "between_means": "Anteil der Menschheit zwischen OSL- und Kölner Mittelwert",
    "koeln_below_osl_median": "Anteil der Kölner unter dem mittleren (Median-)Einwohner von OSL",
    "osl_above_koeln_median": "Anteil der OSL-Einwohner über dem mittleren (Median-)Kölner",
    "koeln_p10_minus_osl_p50": "Weltperzentil Köln-P10 minus Weltperzentil OSL-Median (Prozentpunkte)",
    "median_gap": "Abstand der Weltperzentile: mittlerer Kölner minus mittlerer OSL-Einwohner (Prozentpunkte)",
    "osl_spread_p10_p90": "Spannweite innerhalb OSL: Weltperzentil P90 minus P10 (Prozentpunkte)",
    "koeln_spread_p10_p90": "Spannweite innerhalb Kölns: Weltperzentil P90 minus P10 (Prozentpunkte)",
    "deu_p10": "Weltperzentil: ärmstes Zehntel in Deutschland (P10)",
    "deu_p50": "Weltperzentil: mittlerer Mensch in Deutschland",
    "deu_p90": "Weltperzentil: reichstes Zehntel in Deutschland (P90)",
    "deu_above_world_median": "Anteil der Menschen in Deutschland über dem Weltmedian",
    "osl_above_world_median": "Anteil der OSL-Einwohner über dem Weltmedian",
    "koeln_above_world_median": "Anteil der Kölner über dem Weltmedian",
    "world_gini": "Globaler Gini des Modells (0–1)",
    "poor_half_share": "Anteil der ärmeren Weltbevölkerungshälfte am Welt-Gesamt (%)",
}


def span(key, ids=None):
    vals = [(RES[i][key], i) for i in (ids or RES)]
    lo, hi = min(vals), max(vals)
    return lo, hi


ergebnisse = {}
for key, label in LABELS.items():
    v = RES[vid(MAIN)][key]
    (lo, loid), (hi, hiid) = span(key)
    d = 3 if key == "world_gini" else 0
    ergebnisse[key] = {"label": label, "wert": round(v, 4), "gerundet": round(v, d) if d else round(v),
                       "min": round(lo, 4), "max": round(hi, 4), "min_variante": loid, "max_variante": hiid}
    # Spanne getrennt nach Basisgröße: zeigt, woran die Unsicherheit hängt
    for b in ("gdp", "hh"):
        ids = [i for i in RES if i.startswith(b + "|")]
        (l2, _), (h2, _) = span(key, ids)
        ergebnisse[key][f"spanne_{b}"] = [round(l2, 2), round(h2, 2)]

grafik = {}
for key in ("osl", "koeln"):
    grafik[key] = {f"P{p}": round(RES[vid(MAIN)][f"{key}_p{p}"], 1) for p in (10, 25, 50, 75, 90)}
    grafik[key]["P10_spanne"] = [round(ergebnisse[f"{key}_p10"]["min"], 1), round(ergebnisse[f"{key}_p10"]["max"], 1)]
    grafik[key]["P90_spanne"] = [round(ergebnisse[f"{key}_p90"]["min"], 1), round(ergebnisse[f"{key}_p90"]["max"], 1)]
    grafik[key]["Mittelwert_als_Region_Story"] = None
grafik["osl"]["Mittelwert_als_Region_Story"] = 85.6
grafik["koeln"]["Mittelwert_als_Region_Story"] = 98.3
grafik["deu"] = {f"P{p}": round(RES[vid(MAIN)][f"deu_p{p}"], 1) for p in (10, 50, 90)}
grafik["hinweis"] = "Werte = Anteil der Weltbevölkerung (in %), der weniger hat als die Person an diesem Perzentil des Ortes; Hauptvariante; Spannen über alle Varianten."

out = {
    "meta": {
        "titel": "Personenmodell (Überschlag) zur Story „Zwei Heimaten“",
        "quelle": "wohlstandsatlas/atlas-data.js, feinste Ebene (FINE = 2)",
        "skript": "wohlstand-story/scripts/person_model.py",
        "kennzeichnung": "Modellrechnung, kein Messwert. Verteilung innerhalb der Regionen angenommen (Form und Gini), nicht beobachtet.",
        "stuetzstellen": {"welt": K_POINTS, "kalibrierung": K_CAL},
        "rechenzeit_s": None,
    },
    "hauptvariante": {
        "id": vid(MAIN), "basis": BASE_LABEL[MAIN[0]], "gini": GINI_LABEL[MAIN[1]], "form": MAIN[2],
        "begruendung": (
            "Konsum der Haushalte statt BIP, weil das BIP am Arbeitsort zählt (Pendler, Konzernsitze: Köln 114.600 "
            "gegenüber 38.700 Int.$ Haushaltskonsum) und keine Größe ist, die bei Personen ankommt; die Gini-Werte "
            "der Länder beschreiben Einkommen bzw. Konsum, nicht BIP-Anteile. Gini innerhalb der Regionen kalibriert, "
            "damit die Mischung aller Regionen eines Landes genau dessen Gini ergibt – sonst würde die Ungleichheit "
            "zwischen den Regionen doppelt gezählt. Lognormal als übliche Standardannahme; die log-logistische "
            "Form ist Gegenprobe. Nachteil: Für Köln und OSL liegen Haushaltswerte nur für Regierungsbezirk Köln "
            "bzw. Brandenburg vor (NUTS-2)."),
    },
    "methode": (
        "Überschlag, kein Messwert: Für jede der rund 5.900 Regionen der feinsten Atlas-Ebene nehmen wir an, dass "
        "das Haushaltseinkommen (gemessen als Konsum der Haushalte pro Kopf, KKP) der Einwohner lognormal um den "
        "Regionswert streut. Wie stark, folgt aus dem Gini des Landes (Weltbank); weil ein Teil der Ungleichheit "
        "eines Landes zwischen seinen Regionen liegt, wird die Streuung innerhalb der Regionen so gewählt, dass "
        "alle Regionen zusammen wieder genau den Landes-Gini ergeben. Aus allen Regionen entsteht eine "
        "Weltverteilung über 8,1 Mrd. Menschen, in die wir die Einwohner von OSL, Köln und Deutschland einordnen. "
        "Gegenproben mit BIP statt Konsum, Gini ±5 Punkte und einer zweiten Verteilungsform ergeben die "
        "angegebenen Spannen; nur Aussagen, die in allen Varianten gleich ausgehen, stehen im Text."),
    "annahmen": {
        "verteilungsform": "lognormal (Hauptvariante); log-logistisch (Fisk) als Gegenprobe",
        "gini_ersatz": {
            "regel": "Länder ohne Gini: bevölkerungsgewichteter Median der Länder-Gini des Kontinents (Feld ct)",
            "laender": len(GINI_IMPUTED), "bevoelkerung": gini_imp_pop,
            "anteil_welt_prozent": round(gini_imp_pop / WORLD * 100, 2),
            "kontinentwerte": {k: round(v, 1) for k, v in CONT_GINI.items()},
        },
        "gini_verschiebung": f"±{GINI_SHIFT:g} Punkte, gekappt auf {GINI_MIN:g}–{GINI_MAX:g}",
        "gini_innen": (
            "Je Land per Bisektion so gewählt, dass die Mischung der Regionsverteilungen den Landes-Gini trifft; "
            f"Untergrenze {GINI_W_FLOOR:g} Punkte; Länder mit nur einer Einheit behalten den Landes-Gini."),
        "kalibrierung": {"|".join(k): v for k, v in CAL_INFO.items()},
        "haushaltskonsum": {
            "atlas_einheiten_mit_wert": sum(1 for u in FINE_DATA if u.get("hh_pc_ppp")),
            "atlas_bev_mit_wert": sum(u["pop"] for u in FINE_DATA if u.get("hh_pc_ppp")),
            "atlas_einheiten_nur_landeswert": sum(1 for u in FINE_DATA if u.get("hh_note") == FLAT),
            "atlas_bev_nur_landeswert": sum(u["pop"] for u in FINE_DATA if u.get("hh_note") == FLAT),
            "ersetzt_einheiten": HH_STATS["units"], "ersetzt_bev": HH_STATS["pop"],
            "laender_ohne_weltbank_konsum": sorted(HH_STATS["countries_no_hh"]),
            "regel": (
                "Atlaswert, wo er regionale Information trägt (auch NUTS-2- oder Provinzwert). Wo der Atlas nur den "
                "Landeswert hat oder gar keinen: Landeswert × (BIP pro Kopf der Region / des Landes)^β, je Land auf den "
                "Landeswert normiert. Land ohne Weltbank-Konsum: BIP pro Kopf × Median-Verhältnis Konsum/BIP des Kontinents."),
            "beta": round(BETA, 3),
            "beta_herleitung": "Median der bevölkerungsgewichteten Steigungen ln(hh_r/hh_Land) ~ ln(BIP_r/BIP_Land) über Länder mit echten Regionaldaten (Ebene 1)",
            "beta_je_land": {c: round(b, 2) for c, b in slopes},
            "verhaeltnis_konsum_bip_kontinent": {k: round(v, 3) for k, v in CONT_RATIO.items()},
            "gegenproben": "β = 0 (Landeswert) und β = 1 (proportional zum BIP)",
        },
        "mittlerer_einwohner": "Median der Personen eines Ortes (nicht der Mittelwert)",
        "nicht_modelliert": [
            "Ungleichheit innerhalb von Köln bzw. OSL selbst (nur über die Variante Köln +5 / OSL −5 abgetastet)",
            "regionale Preisunterschiede in Deutschland (Story-Variante ‚regionale Kaufkraft‘)",
            "Unterschiede zwischen Einkommens- und Konsum-Gini der Weltbank-Erhebungen",
            "Haushaltskonsum aus Volkswirtschaftlicher Gesamtrechnung liegt über Haushaltsbefragungen",
        ],
    },
    "ergebnisse_hauptvariante": ergebnisse,
    "plausibilitaet": {
        "welt_gini_hauptvariante": round(RES[vid(MAIN)]["world_gini"], 3),
        "welt_gini_spanne": [round(span("world_gini")[0][0], 3), round(span("world_gini")[1][0], 3)],
        "aermere_haelfte_hauptvariante": round(RES[vid(MAIN)]["poor_half_share"], 1),
        "aermere_haelfte_spanne": [round(span("poor_half_share")[0][0], 1), round(span("poor_half_share")[1][0], 1)],
        "nur_regionen_gini_null": {"aermere_haelfte": round(zres["poor_half_share"], 1), "welt_gini": round(zres["world_gini"], 3)},
        "literatur": {"welt_gini_einkommen": "rund 0,6–0,7", "aermere_haelfte_einkommen": "rund 8–9 %"},
        "deu_gini_modell_hauptvariante": round(RES[vid(MAIN)]["deu_model_gini"], 3),
        "deu_gini_weltbank": GINI["DEU"] / 100,
    },
    "pruefungen": checks,
    "grafik": grafik,
    "varianten": {i: {"basis": BASE_LABEL[i.split("|")[0]], "gini": GINI_LABEL[i.split("|")[1]], "form": i.split("|")[2],
                      **{k: round(v, 3) for k, v in r.items()}} for i, r in RES.items()},
}

# ---------------------------------------------------------------------------
# Robustheit: Aussagen prüfen und Sätze erzeugen
# ---------------------------------------------------------------------------
def rng(key):
    e = ergebnisse[key]
    return e["min"], e["max"]


R0 = lambda k: (round(rng(k)[0]), round(rng(k)[1]))
robust = []


def claim(satz, keys, ok, note=""):
    robust.append({"satz": satz, "spanne": {k: R0(k) for k in keys}, "robust": bool(ok), "hinweis": note})


lo, hi = rng("osl_p10")
claim("Auch das ärmste Zehntel in OSL hat noch mehr als 60 % der Menschheit hinter sich.", ["osl_p10"], lo >= 60)
claim("Auch das ärmste Zehntel in OSL steht noch vor rund zwei Dritteln der Menschheit.", ["osl_p10"],
      lo >= 62 and hi <= 72, "Spanne reicht über ‚rund zwei Drittel‘ hinaus; nur als ‚mehr als 60 %‘ haltbar.")
claim("Der mittlere Mensch in OSL wie in Köln steht in der Welt vor mehr als 80 % der Menschheit.",
      ["osl_p50", "koeln_p50"], min(rng("osl_p50")[0], rng("koeln_p50")[0]) >= 80)
claim("Schon innerhalb von OSL liegen ärmstes und reichstes Zehntel in der Welt weiter auseinander als der mittlere Mensch in OSL und der in Köln.",
      ["median_gap", "osl_spread_p10_p90"], rng("median_gap")[1] < rng("osl_spread_p10_p90")[0],
      "Für Köln allein nicht haltbar (Kölner Spannweite mit BIP nur rund 11 Punkte, weil oben in der Welt wenig Platz ist).")
claim("Das ärmste Zehntel in Köln steht in der Welt höchstens dort, wo der mittlere Mensch in OSL steht.",
      ["koeln_p10_minus_osl_p50"], rng("koeln_p10_minus_osl_p50")[1] <= 4,
      "Mit BIP etwa gleichauf, mit Haushaltskonsum deutlich darunter.")
claim("Das ärmste Zehntel in Köln steht in der Welt etwa dort, wo der mittlere Mensch in OSL steht.",
      ["koeln_p10_minus_osl_p50"], max(abs(x) for x in rng("koeln_p10_minus_osl_p50")) <= 4,
      "Gilt nur mit BIP als Basis; mit Haushaltskonsum liegt das Kölner Zehntel 15–23 Punkte tiefer.")
claim("Rund ein Drittel der Kölner liegt unter dem mittleren Einwohner von OSL.", ["koeln_below_osl_median"],
      rng("koeln_below_osl_median")[0] >= 25 and rng("koeln_below_osl_median")[1] <= 40,
      "Spanne zu breit: BIP rund 5–14 %, Haushaltskonsum rund 44–53 %.")
claim("Fast alle Menschen in Deutschland haben mehr als der mittlere Mensch der Welt.", ["deu_above_world_median"],
      rng("deu_above_world_median")[0] >= 97)
claim("Der mittlere Mensch in Deutschland steht vor rund 90 % der Menschheit.", ["deu_p50"],
      rng("deu_p50")[0] >= 87 and rng("deu_p50")[1] <= 92)
out["aussagen_geprueft"] = robust

out["meta"]["rechenzeit_s"] = round(time.time() - t0, 1)
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

# ---------------------------------------------------------------------------
# Übersicht
# ---------------------------------------------------------------------------
print(f"Personenmodell → {OUT.relative_to(REPO)}  ({out['meta']['rechenzeit_s']} s)")
print(f"Welt {WORLD/1e9:.3f} Mrd., feinste Ebene {FINE_POP/1e9:.3f}, mit Daten {DATA_POP/1e9:.3f}, ohne Daten {NODATA_POP/1e6:.1f} Mio.")
print(f"Stützstellen-Gewichte {checks['bevoelkerung']['summe_stuetzstellen']/1e9:.6f} Mrd.; Welt-CDF oben {checks['bevoelkerung']['welt_cdf_oben']/1e9:.6f} Mrd.")
print(f"β = {BETA:.2f}; Gini ersetzt für {len(GINI_IMPUTED)} Länder ({gini_imp_pop/1e6:.0f} Mio.)")
for k, v in CAL_INFO.items():
    print(f"  Kalibrierung {k}: DEU innen {v['deu_gini_innen']} (zwischen Kreisen {v['deu_gini_zwischen_regionen']}), "
          f"Untergrenze: {len(v['auf_untergrenze'])} Länder {v['auf_untergrenze'][:6]}")
g0 = checks["gini_null"]
print(f"Gini→0: OSL {g0['osl_world_below']:.2f} % (Story 85,6), Köln {g0['koeln_world_below']:.2f} % (98,3), "
      f"dazwischen {g0['between']:.2f} (12,7), ärmere Hälfte {g0['poor_half_share']:.2f} % (15,8); Fisk {g0['fisk_osl']:.2f}/{g0['fisk_koeln']:.2f}")
a = checks["aufloesung"]
print(f"Auflösung ×2: max. Abweichung {a['max_abw_prozentpunkte']:.3f} pp; Welt-Gini {a['world_gini'][0]:.4f}→{a['world_gini'][1]:.4f}; "
      f"ärmere Hälfte {a['poor_half_share'][0]:.3f}→{a['poor_half_share'][1]:.3f}")
cols = ["osl_p10", "osl_p50", "osl_p90", "koeln_p10", "koeln_p50", "koeln_p90", "osl_mean_world_below",
        "koeln_mean_world_below", "between_means", "koeln_below_osl_median", "osl_above_koeln_median",
        "deu_p10", "deu_p50", "deu_p90", "deu_above_world_median", "world_gini", "poor_half_share"]
short = ["O10", "O50", "O90", "K10", "K50", "K90", "<Om", "<Km", "zw", "K<O50", "O>K50", "D10", "D50", "D90", "D>Wm", "Gini", "H50"]
print(f"{'Variante':34s}" + "".join(f"{s:>7s}" for s in short))
for i, r in RES.items():
    print(f"{i:34s}" + "".join(f"{r[c]:7.3f}" if c == "world_gini" else f"{r[c]:7.1f}" for c in cols)
          + ("   ← Haupt" if i == vid(MAIN) else ""))
for s in robust:
    print(("ROBUST   " if s["robust"] else "NICHT    ") + s["satz"] + "  " + json.dumps(s["spanne"]))
