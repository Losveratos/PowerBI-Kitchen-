# Auftrag: Was kostet die Microsoft-Zertifizierung eines Power-BI-Custom-Visuals?

Ein Kostenrechner („Visual-Standards-Rechner") vergleicht vier Wege für IBCS-nahe Standard-Charts in Power BI:
gekauftes Visual (Paid, zertifiziert), Open-Source-Visual, Deneb (zertifiziert) und Core Visuals. Ein **nicht zertifiziertes**
Custom Visual kann im Power-BI-Service nicht als PDF/PPT exportiert und nicht abonniert werden und lädt nicht in Tenants mit
„nur zertifizierte Visuals“ (außer über den Organizational Store). Wir wollen die Zertifizierung für den Open-Source-Weg als
**wählbare Option mit Kosten** einbauen. Deine Aufgabe: realistische Kosten schätzen, aus Sicht der Organisation, die den
Standard einführt (interne Stunden werden mit Vollkosten ~82 €/h bewertet).

Zwei Fälle:

- **Fall A, Eigenbau:** Die Organisation hat ein eigenes Visual gebaut (KI-gestützt ~200 h oder klassisch ~2.000 h) und will es
  selbst zertifizieren lassen. Prüfe die Anforderungen von Microsoft (Veröffentlichung im Partner Center/AppSource, Quellcode-Review,
  keine externen Aufrufe, Lint-/Sicherheitsanforderungen, Rezertifizierung bei jedem Update, Bearbeitungszeiten). Gibt es Gründe,
  warum ein internes Visual gar nicht zertifiziert werden kann oder soll (z. B. Pflicht zur öffentlichen AppSource-Listung)?
- **Fall B, fertiges Open-Source-Visual eines Maintainers:** Ein externer Maintainer zertifiziert das Visual. Die Organisation zahlt
  dafür nichts direkt, aber jemand trägt den Aufwand. Schätze einen fairen jährlichen Beitrag (Sponsoring/Mitgliedschaft) je
  nutzender Organisation, falls sich der Maintainer über Beiträge finanziert, sowie Nebenwirkungen (langsamere Updates, Versionen
  hinken hinterher).

Du darfst bis zu ~8 Websuchen machen (Microsoft Learn: certified Power BI visuals, Partner Center, Zeiten, Anforderungen;
Erfahrungsberichte von Visual-Entwicklern). Wo keine Quelle: begründete Schätzung, markiert.

## Ausgabe

Genau eine JSON-Datei (Pfad aus deinem Auftrag):
```json
{
  "estimator": "<Modell>",
  "selfInitH": [lo, mode, hi],        // Fall A: einmaliger interner Aufwand bis zur ersten Zertifizierung (h), inkl. Nacharbeit nach Ablehnung
  "selfReleasesPerYear": [lo, mode, hi], // Fall A: Releases je Jahr, die neu zertifiziert werden müssen
  "selfRecertH": [lo, mode, hi],      // Fall A: interner Aufwand je Rezertifizierung (h)
  "selfLeadWeeks": [lo, mode, hi],    // Fall A: Wochen bis zur ersten Zertifizierung
  "selfFeasible": 0.0,                // Anteil der Organisationen, für die eine öffentliche AppSource-Listung ihres Eigenbaus akzeptabel ist (0..1)
  "maintFeePerOrgYear": [lo, mode, hi], // Fall B: fairer Beitrag je Organisation und Jahr (€)
  "maintLagWeeks": [lo, mode, hi],    // Fall B: zusätzliche Verzögerung neuer Versionen durch Rezertifizierung (Wochen)
  "rationale": {"<Feld>": "1–2 Sätze, Quelle oder 'Schätzung'"},
  "sources": [{"title": "...", "url": "...", "used_for": "..."}],
  "biggest_uncertainties": ["..."]
}
```
Prüfe die Datei mit Python auf gültiges JSON und aufsteigende Dreipunkte. Antworte danach mit 5–8 Sätzen.
