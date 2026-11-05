# Fabric-Workspace-Backup · `scripts/fabric_extract.py`

Sichert die Metadaten und Item-Definitionen eines Microsoft-Fabric-Workspace
über die [Fabric REST API](https://learn.microsoft.com/rest/api/fabric/) —
Notebooks als `.ipynb`, Semantic Models als TMDL, Reports als PBIR,
Data Pipelines, Eventstreams usw. als deren native Definition-Dateien.

```
fabric_backup/
└── MeinWorkspace_20260813_101500/
    ├── workspace.json          ← Workspace-Metadaten
    ├── items.json              ← alle Items (roh, wie von der API)
    ├── manifest.json           ← Übersicht: was wurde wie gesichert
    ├── Notebook/
    │   └── Mein Notebook/
    │       ├── item.json
    │       └── definition/
    │           └── notebook-content.ipynb
    ├── SemanticModel/
    │   └── Verkäufe/
    │       ├── item.json
    │       └── definition/     ← TMDL-Dateien (model.tmdl, tables/…)
    └── Report/ …
```

## Voraussetzungen

- Python 3.10+ mit `requests` (`pip install requests`)
- Ein Entra-ID-Zugang mit **Viewer-Rolle oder höher** auf dem Workspace

## Authentifizierung — eine von vier Möglichkeiten

Das Skript probiert die Reihenfolge 1 → 2 → 3 automatisch; 4 muss explizit
angefordert werden.

### 1. Fertiges Token (`FABRIC_TOKEN`)

Schnellster Weg zum Ausprobieren. Token z. B. holen via:

```bash
az login
az account get-access-token --resource https://api.fabric.microsoft.com --query accessToken -o tsv
```

```bash
export FABRIC_TOKEN="eyJ0…"
python3 scripts/fabric_extract.py --list-workspaces
```

Achtung: Tokens laufen nach ~1 h ab.

### 2. Service Principal (empfohlen für Automatisierung)

1. Entra ID → App-Registrierung anlegen, Client Secret erzeugen.
   Es sind **keine API-Permissions** auf der App nötig — Fabric nutzt
   Workspace-Rollen.
2. Fabric Admin-Portal → Tenant-Einstellungen →
   **„Service principals can use Fabric APIs"** aktivieren
   (ggf. auf eine Security Group mit dem SP beschränkt).
3. Den Service Principal im Ziel-Workspace als **Viewer/Member** hinzufügen
   (Workspace → Manage access).

```bash
export FABRIC_TENANT_ID="…"
export FABRIC_CLIENT_ID="…"
export FABRIC_CLIENT_SECRET="…"
python3 scripts/fabric_extract.py --workspace "Mein Workspace"
```

### 3. Azure CLI

Ist `az` installiert und eingeloggt (`az login`), holt sich das Skript das
Token selbst — keine Env-Vars nötig.

### 4. Device-Code-Flow (interaktiv, ohne az cli)

```bash
python3 scripts/fabric_extract.py --auth device --list-workspaces
```

Zeigt einen Code an, den man unter <https://microsoft.com/devicelogin> auf
einem beliebigen Gerät eingibt. Praktisch auf Servern/Containern ohne Browser.

## Benutzung

```bash
# Welche Workspaces sehe ich?
python3 scripts/fabric_extract.py --list-workspaces

# Kompletten Workspace sichern (Name oder GUID)
python3 scripts/fabric_extract.py --workspace "Mein Workspace"
python3 scripts/fabric_extract.py --workspace 11111111-2222-3333-4444-555555555555

# Nur bestimmte Item-Typen
python3 scripts/fabric_extract.py -w "Mein Workspace" --types Notebook,SemanticModel,Report

# Nur Metadaten (schnell, keine Definition-Exports)
python3 scripts/fabric_extract.py -w "Mein Workspace" --no-definitions

# Anderes Zielverzeichnis
python3 scripts/fabric_extract.py -w "Mein Workspace" --out /pfad/zum/backup
```

Jeder Lauf erzeugt einen neuen Ordner mit UTC-Zeitstempel — Läufe
überschreiben sich also nie gegenseitig. Die Backup-Ordner sind bewusst
per `.gitignore` vom Repo ausgeschlossen (können interne Daten enthalten);
wer sie versionieren will, legt sie besser in ein eigenes, privates Repo.

## Was wird gesichert?

| Item-Typ           | Definition-Export | Format                     |
| ------------------ | ----------------- | -------------------------- |
| Notebook           | ✓                 | `.ipynb`                   |
| SemanticModel      | ✓                 | TMDL                       |
| Report             | ✓                 | PBIR                       |
| DataPipeline       | ✓                 | API-Default (JSON)         |
| SparkJobDefinition | ✓                 | API-Default                |
| Eventstream u. a.  | ✓ (sofern von der API unterstützt) | API-Default |
| Lakehouse, Warehouse, SQL-Endpoint, Environment … | nur Metadaten (`item.json`) — diese Typen haben keine exportierbare Definition |

Nicht enthalten sind **Daten** (Lakehouse-Tabellen, Warehouse-Inhalte) —
das ist ein Metadaten-/Definitions-Backup, kein Daten-Backup.

## Typische Fehler

| Symptom | Ursache / Fix |
| --- | --- |
| `401 Unauthorized` | Token abgelaufen oder für falsche Ressource ausgestellt (Scope muss `https://api.fabric.microsoft.com/.default` sein). |
| `403 Forbidden` | Konto/SP hat keine Rolle im Workspace, oder Tenant-Setting „Service principals can use Fabric APIs" ist aus. |
| Workspace nicht gefunden | Nur Workspaces sichtbar, in denen das Konto Mitglied ist — `--list-workspaces` zeigt die erreichbaren. |
| `429` / langsam | Fabric throttelt — das Skript wartet automatisch (Retry-After) und macht weiter. |
| Definition „nicht verfügbar" | Item-Typ unterstützt `getDefinition` (noch) nicht — Metadaten sind trotzdem gesichert. |
