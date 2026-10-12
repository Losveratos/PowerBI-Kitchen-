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

## Echter Durchlauf mit `te` 0.7.1.2 (12.10.2026)

An einer Kopie von `sample/MockupLive-Sample` (ohne Desktop): Format, Beschreibung und Anzeigeordner
setzen, Kennzahl umbenennen (`BU` → `Budget`), neue Kennzahl mit DAX anlegen, danach `te validate`.
Alle fünf Ops gespeichert, keine neuen Fehler.

- **Flags:** `te add … -p Name=Wert --if-not-exists --save`, `te set … -p … --save`, `te mv alt neu --save` und
  `te validate --errors-only` laufen wie in `render()`; der Dialekt `p` wird erkannt.
- **`te ls Measures --output-format json`:** `formatString`, `description`, `displayFolder` und `expression` stehen
  direkt am Objekt, `objectPath` in Slash-Form (`_Measures/AC`). `plan()` liest die aktuellen Werte und blockiert
  vorhandene Ziele („existiert bereits im Modell").
- **`te mv` zieht DAX-Verweise mit** („1 cascading change(s)": `[AC] - [BU]` wird `[AC] - [Budget]`).
- **Kein BPA-Gate** bei `add`/`set` mit `--save` in der Standardkonfiguration.
- **Save-Gate:** Bringt eine Änderung neue DAX-Fehler, verweigert `te` das Speichern (`Error: Save blocked …`,
  Exit 1). Befund: Neue Kennzahlen liefen vor dem Umbenennen und scheiterten, wenn sie den neuen Namen nutzten.
  Seit 12.10. laufen Änderungen an Bestehendem zuerst, neue Kennzahlen zuletzt; Verweise auf den alten Namen einer
  im selben Lauf umbenannten Kennzahl werden im DAX mitgezogen (`'Tabelle'[Spalte]` bleibt unberührt).
- **Fehlertext:** `te` schreibt die Ablaufwarnung der Preview auf stderr. `te_message()` lässt sie weg und zeigt
  `Error:`- und DAX-Zeilen; vorher stand im Kitchen nur die Warnung.
- **Bericht:** Nach dem Umbenennen ruft der Runner `pbir fields replace <Bericht> --from alt --to neu` mit dem
  echten Berichtspfad auf (Platzhalter nur im statischen Plan).

Noch offen: derselbe Durchlauf mit offenem Desktop (Reload des Modells über die Bridge) und mit einem Bericht, der
die umbenannte Kennzahl bindet.
