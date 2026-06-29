# Deploy-Plan · Säulen-Varianz (IBCS) → Power BI / Deneb

> Modus **„vorbereiten + Plan"**. Diese Datei beschreibt das Feld-Mapping und die
> exakten Einfüge-Schritte. Es wird **nichts** automatisch in den Report
> geschrieben — das letzte Einsetzen bestätigst/erledigst du in Power BI.

**Template:** [`saeulen-varianz.deneb.json`](./saeulen-varianz.deneb.json)
(verifizierter Export aus dem Business Chart Builder · `provider: vegaLite` ·
`baked = 0`, also voll dynamisch — Power BI rechnet die Werte selbst).

**Voraussetzung:** Deneb-Custom-Visual installiert (AppSource → „Deneb").

---

## 1 · Feld-Mapping (Platzhalter → Modellfeld)

Das Template trägt vier Platzhalter in `usermeta.dataset`. Beim Deneb-Import
fragt Deneb genau diese ab — ordne sie in **dieser Reihenfolge** zu:

| Platzhalter | Name      | Typ / Kind        | Rolle                                   | → Dein Modellfeld           |
| ----------- | --------- | ----------------- | --------------------------------------- | --------------------------- |
| `__0__`     | Kategorie | text · column     | X-Achse (Periode/Monat)                 | **‹Dimensionsspalte›** ⚠    |
| `__1__`     | AC        | numeric · measure | Ist-/Forecast-Wert (durchgehende Säule) | **`[AC]`** / `[Value]` ⚠    |
| `__2__`     | PY        | numeric · measure | Referenz (Vorjahr) – dünne Linie/Marker | **`[PY]`** ⚠                |
| `__3__`     | FC        | numeric · column  | Forecast-Flag **als Zahl 1/0**          | **‹FC-Flag-Spalte (1/0)›** ⚠ |

> Hinweis: Der Export wurde mit Referenz **PY** erzeugt. Willst du gegen **Plan
> (PL)** statt Vorjahr abweichen, im Builder Referenz auf `PL` stellen und neu
> exportieren — dann heißt `__2__` entsprechend `PL` und mappt auf `[PL]`.

---

## 2 · Offene Entscheidungen (bitte bestätigen — nicht geraten)

1. **Dimension für `__0__`** — welche Spalte ist die X-Achse? (z. B.
   `Datum[Monat]`, `Kalender[Monatskürzel]`). Sollte sortierbar/periodisch sein.
2. **AC-Kennzahl `__1__`** — Name deiner Ist-Kennzahl (`[AC]`, `[Umsatz Ist]`, …).
3. **PY-Kennzahl `__2__`** — Vorjahres-Kennzahl, **oder** Wechsel auf PL (s. o.).
4. **FC-Flag `__3__`** — gibt es im Modell ein **numerisches** Flag (1 = Forecast,
   0/leer = Ist) auf Zeilenebene? **Wenn nicht:** entweder eine berechnete
   Spalte anlegen (`FC = IF(Datum[Datum] > [Heute]; 1; 0)`) **oder** das Feld
   beim Import leer lassen (dann keine durchbrochene Forecast-Darstellung).
5. **Zielseite & Position/Größe** des Visuals im Report.

---

## 3 · Berichtsfilter (häufige Fehlerquelle — aktiv setzen)

- **Auf genau EIN Berichtsjahr filtern.** Ohne Jahresfilter summieren sich
  AC/PY/FC über mehrere Jahre und die Säulen werden falsch.
  → Visual- oder Seitenfilter z. B. `Datum[Jahr] = 2025`.
- FC-Flag muss **numerisch** sein (1/0), **kein** Boolean — sonst greift die
  Forecast-Logik des Templates nicht.

---

## 4 · Einfüge-Schritte in Power BI

1. PBIP öffnen, Zielseite wählen, **Deneb-Visual** einfügen.
2. Die vier Felder aus der Tabelle (Schritt 1) in **„Values"** ziehen — genau in
   der dokumentierten Reihenfolge (Kategorie, AC, PY, FC).
3. In Deneb: **„Neue Spezifikation → Aus Vorlage erstellen → Importieren"** und
   `saeulen-varianz.deneb.json` wählen. Beim Import die Felder den Platzhaltern
   zuordnen (Deneb fragt danach). _Alternativ:_ Deneb **„Edit"** öffnen und den
   JSON-Inhalt direkt einfügen.
4. **Berichtsfilter** aus Schritt 3 setzen (ein Jahr).
5. Prüfen: Säulen vollständig, Forecast-Monate als FC erkennbar, PY-Referenz
   sichtbar, keine NaN/leeren Achsen.

> Provider, Tooltips und Δ-Logik sind im Template bereits gesetzt — nichts
> weiter zu konfigurieren.

---

## 5 · Direkt ins PBIR schreiben?

Standardmäßig **nein** (das PBIR-Visual-Format für Deneb ist versionsabhängig
und nicht offiziell dokumentiert; fehlerhaftes Schreiben kann den Report
beschädigen). Wenn du es ausdrücklich willst: vorher **Commit/Backup**, nur in
eine **Kopie** der Seite schreiben und in Power BI verifizieren.
