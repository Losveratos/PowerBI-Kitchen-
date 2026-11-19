"""Suche nach dem Workspace Monitoring (Monitoring-Item, altes Monitoring-Eventhouse) und Abfrage der Log-Tabelle."""
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))

from fabscan import fetch, querylog  # noqa: E402

F = fetch.FABRIC
WS, CENTRAL = "ws-finance", "ws-zentrale"
CLUSTER = "https://trd-mon.z3.kusto.fabric.microsoft.com"


def db(name, item_id="db-1", uri=CLUSTER):
    return {"id": item_id, "displayName": name, "type": "KQLDatabase",
            "properties": {"queryServiceUri": uri, "parentEventhouseItemId": "eh-1"}}


class FakeMon:
    """Normale Fabric-API mit Monitoring-Items; was nicht hinterlegt ist, antwortet 404."""

    def __init__(self, items=None, kql=None, monitoring_endpoint=True):
        self.items = items or {}
        self.kql = kql or {}
        self.monitoring_endpoint = monitoring_endpoint
        self.calls = []

    def __call__(self, method, url, token, body=None):
        self.calls.append(url)
        if url == f"{F}/workspaces":
            return 200, {"value": [{"id": WS, "displayName": "Finance", "type": "Workspace"},
                                   {"id": CENTRAL, "displayName": "Zentrale", "type": "Workspace"}]}
        if url == f"{F}/workspaces/{WS}":
            return 200, {"id": WS, "displayName": "Finance"}
        for wid in (WS, CENTRAL):
            if url == f"{F}/workspaces/{wid}/monitoringItems" and self.monitoring_endpoint:
                return 200, {"value": self.items.get(wid, [])}
            if url == f"{F}/workspaces/{wid}/items?type=Monitoring":
                return 200, {"value": [{k: v for k, v in i.items() if k != "properties"} for i in self.items.get(wid, [])]}
            if url == f"{F}/workspaces/{wid}/kqlDatabases":
                return 200, {"value": self.kql.get(wid, [])}
        return 404, {"error": f"unerwartet: {url}"}


class TokenStub:
    method = "Test"

    def token(self, resource):
        return "t"


def fetcher(fake):
    return fetch.Fetcher(TokenStub(), request=fake, log=lambda *a: None, sleep=lambda s: None, admin=False)


def mon_item(name="Telemetrie", state="Enabled"):
    return {"id": "mon-1", "displayName": name, "type": "Monitoring", "properties": {"dataCollectionState": state}}


class FindMonitoring(unittest.TestCase):
    def test_item_with_own_database(self):
        fake = FakeMon(items={WS: [mon_item()]},
                       kql={WS: [db("Monitoring KQL database", "old"), db("Finance_Telemetrie_Database", "db-new")]})
        f = fetcher(fake)
        self.assertEqual(f.find_monitoring([WS]), [(CLUSTER, "Finance_Telemetrie_Database")])
        self.assertEqual(f.db_ids["Finance_Telemetrie_Database"], "db-new")
        self.assertFalse(f.notes)
        self.assertNotIn(f"{F}/workspaces/{CENTRAL}/kqlDatabases", fake.calls)   # nicht weiter gesucht

    def test_name_with_space_and_special_characters(self):
        """Fabric ersetzt Sonderzeichen durch „_“; Leerzeichen bleiben. Beide Schreibweisen müssen passen."""
        self.assertEqual(fetch.monitoring_db_key("AfterCon DatenWG", "Monitoring"),
                         fetch._kql_key("AfterCon DatenWG_Monitoring_Database"))
        self.assertEqual(fetch.monitoring_db_key("AfterCon DatenWG", "Monitoring"),
                         fetch._kql_key("AfterCon_DatenWG Monitoring_Database"))
        self.assertEqual(fetch.monitoring_db_key("[DEMO] Köln & Co", "Logs"), fetch._kql_key("_DEMO_ Köln _ Co_Logs_Database"))

    def test_linked_to_central_eventhouse(self):
        """Weiterleitung an das Eventhouse eines anderen Monitoring-Items: Datenbank liegt im zentralen Workspace."""
        fake = FakeMon(items={WS: [mon_item()]},
                       kql={WS: [], CENTRAL: [db("Zentrale_Monitoring_Database", "z"), db("Finance_Telemetrie_Database", "f")]})
        f = fetcher(fake)
        self.assertEqual(f.find_monitoring([WS]), [(CLUSTER, "Finance_Telemetrie_Database")])

    def test_collection_disabled_is_reported(self):
        fake = FakeMon(items={WS: [mon_item(state="Disabled")]}, kql={WS: [db("Finance_Telemetrie_Database")]})
        f = fetcher(fake)
        self.assertEqual(len(f.find_monitoring([WS])), 1)
        self.assertTrue(any("sammelt keine Daten" in n and "Disabled" in n for n in f.notes))

    def test_items_endpoint_as_fallback(self):
        fake = FakeMon(items={WS: [mon_item()]}, kql={WS: [db("Finance_Telemetrie_Database")]}, monitoring_endpoint=False)
        f = fetcher(fake)
        self.assertEqual(f.find_monitoring([WS]), [(CLUSTER, "Finance_Telemetrie_Database")])
        self.assertIn(f"{F}/workspaces/{WS}/items?type=Monitoring", fake.calls)

    def test_item_without_reachable_database(self):
        fake = FakeMon(items={WS: [mon_item()]}, kql={WS: [db("Sensoren")]})
        f = fetcher(fake)
        self.assertEqual(f.find_monitoring([WS]), [])
        self.assertTrue(any("Finance_Telemetrie_Database" in n and "--monitoring" in n for n in f.notes))

    def test_legacy_monitoring_eventhouse(self):
        fake = FakeMon(kql={WS: [db("Monitoring KQL database"), db("Sensoren", "s", "https://other")]})
        self.assertEqual(fetcher(fake).find_monitoring([WS]), [(CLUSTER, "Monitoring KQL database")])

    def test_nothing_found(self):
        f = fetcher(FakeMon())
        self.assertEqual(f.find_monitoring([WS]), [])
        self.assertTrue(any("Kein Workspace Monitoring gefunden" in n for n in f.notes))


ROWS = {"Tables": [{"Columns": [{"ColumnName": "EventText"}, {"ColumnName": "OperationName"}],
                    "Rows": [["EVALUATE x", "QueryEnd"]]}]}


class LogQuery(unittest.TestCase):
    def kusto(self, handler):
        calls = []

        def fake(method, url, token, body=None):
            calls.append((url.rsplit("/", 1)[-1], body["db"], body["csl"]))
            return handler(url, body)
        f = fetch.Fetcher(TokenStub(), request=fake, log=lambda *a: None)
        return f, calls

    def test_kql_needs_only_four_columns(self):
        csl = querylog.kql(7)
        for col in ("ApplicationName", "ExecutingUser", "WorkspaceName", "ItemName", "DurationMs", "ApplicationContext"):
            self.assertIn(f'column_ifexists("{col}"', csl)
        for col in querylog.REQUIRED_COLUMNS:
            self.assertNotIn(f'column_ifexists("{col}"', csl)
        self.assertTrue(csl.startswith("SemanticModelLogs\n"))

    def test_other_table_name_is_resolved(self):
        def handler(url, body):
            if url.endswith("/mgmt"):
                return 200, {"Tables": [{"Columns": [{"ColumnName": "TableName"}],
                                         "Rows": [["ItemJobEventLogs"], ["SemanticModelLog"]]}]}
            if body["csl"].startswith("SemanticModelLogs"):
                return 400, {"error": "Semantic error: 'where' operator: Failed to resolve table or column expression named 'SemanticModelLogs'"}
            return 200, ROWS
        f, calls = self.kusto(handler)
        rows = f.logs(CLUSTER, "Finance_Telemetrie_Database", 7, False)
        self.assertEqual(rows, [{"EventText": "EVALUATE x", "OperationName": "QueryEnd"}])
        self.assertTrue(calls[-1][2].startswith("SemanticModelLog\n"))
        self.assertTrue(any("„SemanticModelLog“" in n for n in f.notes))

    def test_database_by_item_id_when_name_fails(self):
        def handler(url, body):
            if body["db"] == "db-new":
                return 200, ROWS
            return 400, {"error": "Database 'Finance_Telemetrie_Database' was not found"}
        f, calls = self.kusto(handler)
        f.db_ids["Finance_Telemetrie_Database"] = "db-new"
        self.assertEqual(len(f.logs(CLUSTER, "Finance_Telemetrie_Database", 7, False)), 1)
        self.assertEqual(calls[-1][1], "db-new")

    def test_forbidden_stops_with_readable_error(self):
        f, calls = self.kusto(lambda url, body: (403, {"error": "Forbidden"}))
        with self.assertRaises(fetch.FetchError) as cm:
            f.logs(CLUSTER, "X", 7, False)
        self.assertIn("nicht lesbar: 403", str(cm.exception))
        self.assertEqual(len(calls), 2)          # Cluster-Token und kusto.windows.net, dann Schluss


if __name__ == "__main__":
    unittest.main()
