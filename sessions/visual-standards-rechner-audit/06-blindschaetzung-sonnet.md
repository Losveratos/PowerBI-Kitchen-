# Blindschätzung — IBCS-Visual-Standards in Power BI (Claude / Sonnet 5)

Unabhängige Dreipunkt-Schätzung [min, wahrscheinlich, max], ohne Kenntnis bestehender
Referenzwerte. Grundlage: eigenes Fachwissen (Power-BI-Architektur, Controlling DACH)
plus punktuelle Websuche zu aktuellen Listenpreisen (Zebra BI, Inforiver, graphomate,
Stand September 2026). Ansätze: **paid** (3rd-Party wie Zebra BI/Inforiver/graphomate),
**oss** (fertiges Open-Source-Visual ohne MS-Zertifizierung), **deneb** (Deneb/Vega-Lite-
Templates), **core** (nur native Visuals + SVG-Measures/DAX).

---

## 1. Globale Parameter (ansatzunabhängig)

| Parameter | Min | Wahrsch. | Max | Begründung |
|---|---|---|---|---|
| Stundensatz intern, Vollkosten Controller/BI-Team (€/h) | 65 | 90 | 130 | Typischer DACH-Vollkostensatz (Bruttogehalt + Lohnnebenkosten + Gemeinkosten-Umlage) für BI-/Controlling-Fachkräfte, je nach Region und Senioritätsmix. |
| Stundensatz extern, Freelancer/Beratung Power BI DACH (€/h) | 90 | 130 | 190 | Marktübliche Tagessätze von ca. 700–1.500 € umgerechnet; Spanne durch Senioritäts- und Standortunterschiede (z. B. Schweiz teurer als Ostdeutschland). |
| Fluktuation der Ersteller (%/Jahr) | 8 | 15 | 25 | Analytics-/BI-Teams haben in DACH-Mittelstand/Konzern überdurchschnittliche Fluktuation ggü. Controlling im engeren Sinn, stark unternehmensabhängig. |
| Viewer-Wachstum (%/Jahr) im Self-Service-Rollout | 15 | 35 | 80 | Frühe Rollout-Phasen zeigen oft sprunghaftes Wachstum (virale Verbreitung), reife Organisationen wachsen moderater — sehr projektabhängig, keine belastbare Benchmark bekannt. |
| Lohnsteigerung (%/Jahr) | 2,5 | 3,5 | 5,0 | Tarif-/Marktdurchschnitt DACH nach der Inflationsspitze 2022–2023, Rückkehr zu moderateren Steigerungsraten. |
| Kalkulationszins WACC (%) Mittelstand | 6 | 8 | 11 | Typischer Mittelstands-WACC in Deutschland/Österreich/Schweiz, abhängig von Verschuldungsgrad und Branche. |
| Anteil des Aufbaus, der bei Abkündigung neu entsteht (%) | 40 | 70 | 100 | Je nachdem, ob nur die Visual-Konfiguration oder auch Datenmapping/Measures/Theme neu gebaut werden müssen; bei komplett anderem Rendering-Modell (z. B. OSS-Visual → Core) tendenziell nahe 100 %. |

---

## 2. Parameter je Ansatz

### 2.1 Lizenz je Nutzer und Jahr (nur `paid`, in €)

| Parameter | Min | Wahrsch. | Max | Begründung |
|---|---|---|---|---|
| Listenpreis Creator-Lizenz | 250 | 400 | 700 | Zebra BI Personal ~280 €/Jahr, Inforiver Enterprise bis ~1.050 €/Jahr (95 $/Monat), graphomate-Einzellizenzen im ähnlichen Korridor — Creator-Tier meist am oberen Ende. |
| Listenpreis Viewer-Lizenz (falls separat) | 0 | 80 | 200 | Viele Vendoren bündeln Viewer in Power-BI-Pro/PPU oder verlangen deutlich reduzierte Viewer-Preise; teils kostenlos bei Embedding in bestehende Kapazität. |
| Realistisch verhandelter Mischpreis (Enterprise-Deal, viele Viewer/wenige Creator) | 60 | 130 | 250 | Volumenrabatte bei 100+ Lizenzen und Jahresverträgen typischerweise 30–60 % unter Liste; Mischkalkulation über alle Nutzer drückt den Wert weiter. |

### 2.2 Setup, Aufbau, Rollout (Stunden, sofern nicht anders angegeben)

| Parameter | paid | oss | deneb | core | Begründung (kurz je Ansatz) |
|---|---|---|---|---|---|
| Einmaliger Setup (Eval., Freigabe, Theme, Template-Bibliothek) | [16, 32, 60] | [24, 48, 90] | [24, 50, 90] | [12, 24, 40] | paid: Tool ist fertig, Aufwand v. a. Procurement/Security-Review/Theming. oss: zusätzliche Code-Prüfung, kein Vendor-Support. deneb: eigene Template-Architektur/Namenskonventionen/Theme-JSON von Grund auf. core: kein Tool-Setup, nur DAX-/SVG-Pattern-Grundgerüst. |
| Stunden je Chart-Typ beim ersten sauberen Bau (Ø über Abweichung/Wasserfall/Small Multiples/Szenario) | [1, 3, 6] | [3, 8, 16] | [6, 14, 28] | [10, 24, 45] | paid: Formatierung über Properties-Pane, IBCS-Logik oft vorkonfiguriert. oss: weniger Doku, mehr Trial-and-Error, ggf. Bugfixing. deneb: Vega-Lite-Spec inkl. Szenario-Encoding komplett selbst entwickeln. core: SVG-Measures/DAX-Tricks sind fehleranfällig und für Wasserfall/Szenario-Notation sehr aufwendig. |
| Stunden je Chart bei Wiederverwendung im Rollout | [0,25, 0,5, 1] | [0,5, 1, 2] | [0,5, 1,5, 3] | [1, 2, 4] | paid: reine Feldbindung im UI. oss: ähnlich, aber weniger robuste Vorlagen. deneb: Datasets/Feldnamen im JSON anpassen, ggf. Signale. core: Measures/SVG-Strings sind nie „copy-paste rein", jede Anpassung erfordert DAX-Verständnis. |

### 2.3 Enablement (Stunden bzw. € wie angegeben)

| Parameter | paid | oss | deneb | core | Begründung |
|---|---|---|---|---|---|
| Schulung je Vorlagen-Bauer (tief), h | [4, 8, 16] | [8, 16, 24] | [16, 24, 40] | [8, 16, 30] | Vega-Lite-Grammatik hat die steilste Lernkurve; DAX/SVG-Pattern-Bibliothek erfordert soliden DAX-Hintergrund; paid-Tools haben geführte UI + Doku/Webinare. |
| Schulung je Vorlagen-Nutzer (flach), h | [1, 2, 3] | [1, 2, 4] | [1,5, 3, 5] | [1, 2, 4] | Bei deneb müssen Nutzer das Vega-Dataset-Konzept minimal verstehen, sonst überall ähnlich (nur Felder binden). |
| Einarbeitung neuer Ersteller bis produktiv, h (zusätzl. zur Schulung) | [4, 10, 20] | [10, 20, 35] | [20, 40, 70] | [15, 30, 55] | Reflektiert Werkzeugkomplexität: UI-Tool < OSS-Visual < DAX-Pattern-Bibliothek < Vega-Lite-Vollsprache. |
| Kurskosten je Ersteller extern, € | [300, 800, 1500] | [0, 300, 800] | [500, 1200, 2500] | [300, 800, 1800] | Vendor-Trainings (paid) oft im Lizenzpaket/vergünstigt; OSS meist nur Community-Doku; Deneb/Vega-Lite und fortgeschrittenes DAX erfordern spezialisierte (teurere) Kurse. |

### 2.4 Freigabe, Governance, Revision (Stunden)

| Parameter | paid | oss | deneb | core | Begründung |
|---|---|---|---|---|---|
| Freigabe je Chart-Variante einmalig (Security/Architekturboard) | [2, 4, 8] | [4, 8, 16] | [2, 4, 8] | [1, 2, 4] | Zertifizierte AppSource-Visuals (paid, Deneb) durchlaufen den MS-Zertifizierungsprozess bereits, senkt internen Prüfaufwand; OSS ohne Zertifikat erfordert eigenes Code-/Security-Audit; core braucht kaum Extra-Freigabe. |
| Laufende Governance pro Jahr (Org-Store, Versions-Reviews, Tenant-Settings) | [8, 16, 30] | [12, 24, 40] | [10, 20, 35] | [4, 10, 20] | paid: Lizenzmanagement + Versions-Updates. oss: Update-Tracking ohne Vendor-Roadmap, mehr Eigenaufwand. deneb: Template-Bibliothek/Spec-Versionierung pflegen. core: kein externes Visual zu verwalten. |
| Prüfnachweis für Revision pro Jahr, h | [2, 5, 10] | [3, 6, 12] | [2, 5, 10] | [2, 4, 8] | Revisionsaufwand betrifft primär Berechnungslogik/Freigabeprozess, nicht das Visual selbst — daher über Ansätze relativ ähnlich, mit leichtem Mehraufwand bei OSS wegen fehlendem Herstellernachweis. |

### 2.5 Wartung & Risiko

| Parameter | paid | oss | deneb | core | Begründung |
|---|---|---|---|---|---|
| Wartungsquote pro Jahr (% von Aufbau+Rollout) | [5, 10, 20] | [10, 20, 35] | [15, 25, 40] | [10, 20, 35] | paid: Vendor trägt einen Teil der Pflege (Updates, Bugfixes). oss/core/deneb: Pflege liegt vollständig intern, deneb zusätzlich durch häufige Power-BI-/Vega-Renderer-Änderungen belastet. |
| Breaking-Updates pro Jahr (Anzahl) | [0, 1, 2] | [1, 2, 4] | [0,5, 1,5, 3] | [0, 1, 2] | paid: Vendor testet gegen neue Power-BI-Releases vor. oss: geringere Testabdeckung, häufiger Brüche. deneb: Power-BI-Sandbox-/Renderer-Updates können Vega-Specs beeinflussen. core: native Visuals sehr stabil, DAX-Engine-Änderungen selten kritisch. |
| Stunden je Breaking-Update | [2, 6, 15] | [4, 10, 24] | [4, 12, 30] | [2, 6, 16] | Analog zur Komplexität der zugrunde liegenden Technik; Vega-Lite-Specs und individuelle DAX/SVG-Konstrukte sind aufwendiger zu debuggen als UI-Formatierung. |
| Abkündigungsrisiko (%/Jahr) | [1, 3, 8] | [5, 15, 35] | [1, 3, 6] | [0, 1, 2] | Etablierte Vendoren (Zebra BI, Inforiver, graphomate) sind seit Jahren am Markt, aber Konsolidierungsrisiko besteht; OSS-Visuals sind oft Einzelmaintainer-Projekte; Deneb ist stark etabliert/breit genutzt; native Visuals werden von Microsoft selbst gepflegt. |
| Anteil extern beauftragter Stunden (%) | [10, 25, 50] | [15, 35, 60] | [20, 40, 65] | [10, 25, 45] | Je spezialisierter das nötige Know-how (Vega-Lite, OSS-Codebasis), desto eher wird initial extern zugekauft; Rollout-Phase i. d. R. stärker intern. |

---

## Wo ich am unsichersten bin

- **Viewer-Wachstum %/Jahr**: extrem stark von Unternehmenskultur, Change-Management und Reifegrad des Self-Service-Rollouts abhängig — ich kenne keine belastbare branchenübergreifende Benchmark, nur Erfahrungswerte aus Einzelprojekten.
- **Realistisch verhandelter Mischpreis der Lizenzen**: Enterprise-Rabatte sind meist vertraulich (NDA), meine Spanne basiert auf Marktgerüchten/Analogieschlüssen, nicht auf belastbaren Vertragsdaten.
- **Abkündigungsrisiko OSS-Visuals**: es gibt keine mir bekannte systematische Statistik über die Lebensdauer/Maintenance-Aktivität von Custom Visuals auf AppSource oder GitHub — meine Zahl ist eine grobe Plausibilitätsschätzung.
- **Breaking-Updates deneb/Vega**: hängt stark von der Kadenz und Art der Power-BI-Plattform-Updates (Sandbox, Rendering-Engine) ab, die ich nicht systematisch quantifizieren kann.
- **Fluktuation der Ersteller**: sehr branchen- und arbeitsmarktabhängig (IT-Hub vs. ländliche Region, Konzern vs. Mittelstand); meine Spanne ist eine grobe Heuristik.
- **Stunden je Chart-Typ bei `core`**: extreme Varianz je nach Komplexitätsanspruch — ein einfacher SVG-Bullet-Chart kann 5 h dauern, ein voll interaktiver Wasserfall mit dynamischer Szenario-Logik auch 60+ h; mein Mittelwert glättet das stark.

## Welche Parameter fehlen aus meiner Sicht

- **Staffelpreise/Rabattkurven nach Lizenzanzahl** (paid) — die Frage nach „Preis je Nutzer" verschleiert, dass sich der Preis bei 10 vs. 500 Lizenzen um Faktor 3–5 unterscheiden kann.
- **Zusätzliche Power-BI-Premium/Fabric-Kapazitätskosten**, falls Custom Visuals (v. a. Deneb/OSS) mehr Rendering-Last erzeugen und eine höhere SKU nötig wird.
- **Mobile-Rendering-Kompatibilität** (Power BI Mobile App) — manche Custom Visuals/Deneb-Specs rendern dort eingeschränkt oder gar nicht; das erzeugt Zusatzaufwand oder Akzeptanzverlust.
- **Barrierefreiheits-/Accessibility-Testaufwand** je Ansatz (Screenreader-Kompatibilität, Kontrastprüfung) — bei IBCS/Custom Visuals oft ein Lücke.
- **Lokalisierungsaufwand** (DE/EN/FR/IT, z. B. für Schweizer Konzerne) bei Zahlenformaten, Szenario-Labels, Kapitel-Texten in Templates.
- **Migrations-/Exit-Kosten zwischen Ansätzen** (z. B. Wechsel von OSS auf paid nach Abkündigung) — im Datenmodell separat, aber für eine TCO-Betrachtung relevant.
- **Time-to-Value / Opportunitätskosten** eines verzögerten Rollouts (z. B. durch langsamere Freigabeprozesse bei OSS) — schwer in €/h zu fassen, aber strategisch relevant.
- **Datenvolumen-/Performance-Grenzen** von Custom Visuals (Zeilenlimits, Rendering-Timeout bei großen Kleine-Multiples-Grids) und der daraus resultierende Nacharbeitsaufwand.
