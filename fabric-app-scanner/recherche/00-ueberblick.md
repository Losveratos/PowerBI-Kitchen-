# Recherche · Was Governance- und Security-Fachleute für Power BI und Fabric brauchen

Stand 19.11.2026. Drei Recherche-Agents (Microsoft Learn, Praxis und Community, Clients außerhalb von Berichten),
danach eine unabhängige Bewertung mit Fable gegen den Stand von fabscan 0.5.1.

| Datei | Inhalt |
| --- | --- |
| `fabscan-faehigkeiten.md` | Ausgangslage: was fabscan 0.5.1 kann und was nicht |
| `01-mslearn.md` | Offizielle Microsoft-Empfehlungen: Bedarf je Rolle, Auswertungen mit Datenquelle und Recht, 35 Prüfpunkte, Learn-Quellen |
| `02-praxis.md` | Praxis: Standard-Kennzahlen, Lücken der Werkzeuge, Darstellung, Fehlalarme |
| `03-clients.md` | Apps, executeQueries, XMLA, Notebooks, Excel, Embedded, Data Agents: Risiken, Log-Merkmale, Schalter, rund 30 Regelvorschläge |
| `04-bewertung.md` | Bewertung: Faktencheck, Bedarf je Zielgruppe, 30 Vorschläge bewertet, Positionierung, Roadmap, Darstellung, Messpunkte |

## Kurzfassung

**Alleinstellung von fabscan:** die inhaltliche Prüfung der DAX-Abfragen von Clients außerhalb von Berichten gegen
das Modell (rechnet der Client selbst, überschreibt er Measures, hebt er Filter auf). Dass Clients sichtbar werden,
leisten auch die Workspace-Monitoring-Vorlagen der fabric-toolbox.

**Nachgeprüfte Fakten:** RLS greift nicht bei Write-Recht am Modell (Admin, Member, Contributor), auch nicht für
Service Principals. Data Agents brauchen nur Read, Read ohne Build ist laut Microsoft aber ohnehin kein Schutz.
`ApplicationName` liefert der Client selbst. Offen: ob executeQueries ein eigenes Activity-Ereignis schreibt, und
ob eine geteilte Fabric App Build automatisch vergibt (belegt ist nur, dass alle App-Nutzer Build brauchen).

**Roadmap laut Bewertung:** 1 Fehlalarme senken (SP allein nur info, Sortierspalten bei SEC-HIDDEN ausnehmen),
2 Ausnahmen mit Begründung und stabile Befund-ID, 3 Abdeckung ausweisen, 4 Log-Fingerabdrücke je Client messen
und Clients mit Vertrauensstufe klassifizieren, 5 KQL um User, Identity, Status, Ergebniszeilen erweitern,
6 RLS-Wirksamkeit für beobachtete Modelle (Scanner mit getArtifactUsers), 7 Bericht mit Ampel je Thema,
Maßnahmenliste, Trend und Pseudonymisierung, 8 Rayfin-Regeln, 9 Kontextspalten und Schaltermatrix,
10 Embedding im Repo-Modus, danach Excel.

**Bewusst nicht:** kein Tenant-Inventar oder Activity-Log-Archiv (FUAM, Govern-Bericht), keine Modell-BPA und
keine Gesamtnote, keine Angriffserkennung versprechen.

**Übersehen in allen drei Recherchen:** Mitbestimmung (Auswertung je Person braucht Pseudonymisierung und
Zweckbindung), Excel/MDX bleibt ungeprüft, Abdeckung muss im Bericht stehen, Produktiv und Entwicklung trennen.
