> Stand 01.10.2026 · Arbeitspaket C aus [PLAN-V2.md](PLAN-V2.md) · Code: `agent/model_ops.py`, Tests: `tests/test_model_ops.py` (Attrappe `tests/fake_te.py`).

# Modelländerungen über `te` (Paket C)

Das Kitchen notiert Wünsche ans Modell (neue Kennzahlen, Formate, Beschreibungen, Umbenennungen). `model_ops.py` macht daraus Ops, führt die freigegebenen über die Tabular-Editor-CLI `te` aus und prüft danach mit `te validate --errors-only`. TMDL wird nie von Hand gelesen oder geschrieben.

## Ablauf

1. `te_available()` prüft `te --version`. Abgelaufene Preview wird erkannt („te abgelaufen …, bitte aktualisieren").
2. `plan(spec, model_dir)` liest die **Roh-Spec** (vor `upgrade()`, sonst fehlen `formatWish`, `daxComment`) und liefert Ops. Mit laufendem `te` liest es die aktuellen Werte über `te ls --type measure|column` und lässt Ops ohne Wirkung weg. Schreibt nichts.
3. Der Runner zeigt die Ops, der Mensch gibt im Chat frei (Op-IDs, optional korrigiertes DAX).
4. `apply(ops, model_dir, approved_ids, overrides=…)` sichert den Ordner `definition/`, führt aus, validiert. Neue Validierungsfehler: Sicherung zurückspielen.
5. Erfolgreich: Rückgabe `reloadModel: True`, der Runner ruft `pbir desktop reload --model`. Bei Umbenennungen zusätzlich `followUps` (`pbir fields replace`, `pbir validate --fields`).

## Ops und Freigabe

| Op (`kind`) | Kitchen-Quelle | `te`-Befehl | Freigabe |
|---|---|---|---|
| `addMeasure` | `newFields[]` mit `kind: measure` | `te add "T/N" -t Measure -p expression=… -p formatString=… -p description=… --if-not-exists --save` | **ja** (DAX) |
| `changeDax` | `fields[].daxComment` (+ DAX aus dem Chat) | `te set "T/N" -p expression=… --save` | **ja** (DAX) |
| `setFormat` | `fields[].formatWishString`, sonst `formatWish` (Kürzel wie `FORMAT_WISH` in `app.js`) | `te set "T/N" -p formatString=… --save` | nein (ja bei dynamischem Formatausdruck) |
| `setDescription` | `fields[].descriptionWish`, sonst Steckbrief (Notiz, Einheit, Ziel, Quelle, Owner), nur wenn das Modell noch keine Beschreibung hat | `te set "T/N" -p description=… --save` | nein |
| `setDisplayFolder` | `fields[].displayFolderWish`, `newFields[].displayFolder` | `te set "T/N" -p displayFolder=… --save` | nein |
| `rename` | `fields[].renameInModel` + `alias` | `te mv "T/N" "T/Alias" --save`, danach im Bericht `pbir fields replace … --from T.N --to T.Alias` und `pbir validate --fields` | **ja** |
| `todoColumn` | `newFields[]` mit `kind: column` | keiner (gehört in Quelle bzw. Power Query) | nicht ausführbar |

Blockiert (`executable: false`, Grund in `blockedReason`): Tabelle fehlt im Modell, Kennzahl existiert schon, Alias existiert schon, DAX-Vorschlag mit Platzhaltern (`<Zähler>`, `TODO`). Ein im Chat geliefertes DAX (`overrides={id: {"dax": …}}`) hebt die DAX-Blockade auf, die Freigabe braucht es trotzdem.

Format neuer Kennzahlen: Formatwunsch des Feldes, sonst Einheit (`%` → `0.0 %`, `€` → `#,0 "€"`, `T€` → `#,0, "T€"`), sonst `#,0`.

Reihenfolge: anlegen, DAX, Format, Beschreibung, Ordner, Umbenennung (Umbenennungen zuletzt, weil die anderen Ops noch den alten Namen ansprechen).

## API

```python
import model_ops as MO
ok, version, msg = MO.te_available(te=None)
ops = MO.plan(spec_roh, "X.SemanticModel", te=None, probe=True, report_dir="X.Report")
res = MO.apply(ops, "X.SemanticModel", approved_ids=["addMeasure:_Measures.Marge %"],
               overrides={"addMeasure:_Measures.Marge %": {"dax": "DIVIDE([Marge], [Umsatz])"}},
               backup_root=state_dir / "model-backups", atomic=False)
chk = MO.fields_exist("X.SemanticModel", ["_Measures.Umsatz", ("DimDate", "Year")])
```

- Op: `id` (`<kind>:<Tabelle.Feld>`, stabil), `kind`, `ref`, `target` (te-Pfad), `commands` (argv-Listen), `commandLines` (Anzeige), `needsApproval`, `executable`, `blockedReason`, `summary` (deutsch), `before`/`after`, bei `rename` `newRef` und `followUp`.
- `apply` liefert `status`: `applied` | `partial` | `failed` | `reverted` | `teUnavailable` | `nothing`, dazu `results` je Op (`applied`, `failed`, `awaitingApproval`, `blocked`, `reverted`, `skipped`), `validation` (`before`, `after`, `newErrors`, ggf. `afterRevert`), `backup`, `reloadModel`, `followUps`, `message`.
- `fields_exist` liefert `ok` (te lief), `exists` je Ref, `missing`. Grundlage sind zwei `te ls`-Aufrufe, kein TMDL-Lesen.
- `te` kommt aus dem Argument, sonst `$MK_TE`, sonst `PATH`.

## Sicherheitsnetz

- `te` selbst verweigert das Speichern, wenn eine Änderung neue DAX-Fehler bringt (Save-Gate, ohne `--force`). `model_ops` setzt nie `--force`.
- Zusätzlich vergleicht `apply` `te validate` vorher und nachher. Nur **neue** Fehler lösen das Zurücksetzen aus, Altlasten nicht.
- Zurückgesetzt wird per Dateikopie des Ordners `definition/` (te kennt außerhalb von `te interactive` kein Revert). Die Sicherung bleibt bei Fehlern liegen.
- Werte gehen als Argumente an `te`, nicht über stdin (die .NET-Konsole liest stdin in der Codepage, Umlaute gingen verloren).
- Desktop hält das Modell im Speicher: vor `apply` nichts Ungespeichertes in Desktop lassen, danach `pbir desktop reload --model`.

## Befehlsform

Die Doku zur neuen Preview (bis 31.10.2026) setzt Eigenschaften mit `-p Name=Wert`. Die abgelaufene Preview kannte `-q <Eigenschaft> -i <Wert>`. `te_dialect()` liest `te set --help` und wählt die passende Form. Beides ist getestet.

## Offen bis zur neuen `te`-Version

- `te set --help`, `te add --help`, `te mv --help`, `te ls --help`, `te validate --help` gegen `render()` prüfen (Flags, `--if-not-exists`, `--non-interactive`).
- JSON von `te ls --type measure --output-format json`: enthält `properties` `formatString`, `description`, `displayFolder`? Fehlen sie, plant `plan()` mit den Werten aus der Spec.
- Form von `objectPath` (Slash- oder DAX-Form, Container-Segment `Measures`?). `split_path()` nimmt erstes und letztes Segment.
- Benennt `te mv` DAX-Verweise mit um? Die Doku-Quellen widersprechen sich. Falls nein, verweigert das Save-Gate die Umbenennung bei abhängigen Kennzahlen, Rücksetzen greift.
- Greift ein BPA-Gate (`bpa.onMutation`) beim `--save` von `te add`/`te set`? Dann scheitern Ops mit BPA-Meldung, ggf. `te config set bpa.onMutation false` für den Runner.
- Echter Durchlauf an der Testkopie von PBI-IBCS-Testbed (Paket E).
