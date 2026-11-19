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


class FakeAdmin:
    """Fabric-Admin-API für den ganzen Tenant: zentrales Eventhouse im Workspace Zentrale."""

    def __init__(self, mons, dbs, readable=None):
        self.mons, self.dbs, self.calls = mons, dbs, []
        self.readable = readable                      # None = alle Datenbanken lesbar

    def __call__(self, method, url, token, body=None):
        self.calls.append(url)
        if url == f"{F}/admin/items?type=Monitoring":
            return 200, {"itemEntities": self.mons, "continuationToken": "n1"}
        if url == f"{F}/admin/items?type=Monitoring&continuationToken=n1":
            return 200, {"itemEntities": []}
        if url == f"{F}/admin/items?type=KQLDatabase":
            return 200, {"itemEntities": self.dbs}
        for d in self.dbs:
            if url == f"{F}/workspaces/{d['workspaceId']}/kqlDatabases/{d['id']}":
                if self.readable is not None and d["id"] not in self.readable:
                    return 403, {"error": "InsufficientPrivileges"}
                return 200, db(d["name"], d["id"])
        return 404, {"error": f"unerwartet: {url}"}


def admin_fetcher(fake, names):
    f = fetch.Fetcher(TokenStub(), request=fake, log=lambda *a: None, sleep=lambda s: None, admin=True)
    f.ws_names.update(names)          # kommen im Admin-Modus aus dem Scan-Ergebnis
    return f


class FindMonitoringTenant(unittest.TestCase):
    NAMES = {"w1": "Finance", "w2": "Vertrieb", "w3": "Alt", "w4": "Ohne", "wz": "Zentrale"}
    MONS = [{"id": "m1", "type": "Monitoring", "name": "Monitoring", "workspaceId": "w1"},
            {"id": "m2", "type": "Monitoring", "name": "Monitoring", "workspaceId": "w2"},
            {"id": "mz", "type": "Monitoring", "name": "Zentral", "workspaceId": "wz"}]
    DBS = [{"id": "d1", "type": "KQLDatabase", "name": "Finance_Monitoring_Database", "workspaceId": "wz"},
           {"id": "d2", "type": "KQLDatabase", "name": "Vertrieb_Monitoring_Database", "workspaceId": "wz"},
           {"id": "dz", "type": "KQLDatabase", "name": "Zentrale_Zentral_Database", "workspaceId": "wz"},
           {"id": "d3", "type": "KQLDatabase", "name": "Monitoring KQL database", "workspaceId": "w3"}]

    def test_whole_tenant_from_admin_lists(self):
        fake = FakeAdmin(self.MONS, self.DBS)
        f = admin_fetcher(fake, self.NAMES)
        found = f.find_monitoring(["w1", "w2", "w3", "w4"])
        self.assertEqual([d for _, d in found], ["Finance_Monitoring_Database", "Vertrieb_Monitoring_Database",
                                                 "Monitoring KQL database"])
        self.assertNotIn(f"{F}/workspaces/w1/monitoringItems", fake.calls)    # keine Abfrage je Workspace
        self.assertTrue(any("1 von 4 geprüften Workspaces ohne Workspace Monitoring" in n and "Ohne" in n
                            for n in f.notes))

    def test_central_database_without_access(self):
        fake = FakeAdmin(self.MONS, self.DBS, readable={"d3"})
        f = admin_fetcher(fake, self.NAMES)
        found = f.find_monitoring(["w1", "w2", "w3"])
        self.assertEqual([d for _, d in found], ["Monitoring KQL database"])
        self.assertTrue(any("2 Monitoring-Datenbank(en) in „Zentrale“ ohne Lesezugriff" in n for n in f.notes))

    def test_admin_list_denied_falls_back_to_workspaces(self):
        fake = FakeMon(items={WS: [mon_item()]}, kql={WS: [db("Finance_Telemetrie_Database")]})
        f = fetch.Fetcher(TokenStub(), request=fake, log=lambda *a: None, admin=True)
        self.assertEqual(f.find_monitoring([WS]), [(CLUSTER, "Finance_Telemetrie_Database")])


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

    def test_union_source_escapes_names(self):
        self.assertEqual(querylog.union_source(['A "B"', "C"]),
                         'union isfuzzy=true database("A \\"B\\"").SemanticModelLogs, database("C").SemanticModelLogs')

    def test_many_databases_on_one_eventhouse_in_one_query(self):
        f, calls = self.kusto(lambda url, body: (200, ROWS))
        mons = [(CLUSTER, f"WS{i}_Monitoring_Database") for i in range(30)] + [("https://other", "Einzeln")]
        rows, report = f.logs_all(mons, 7, False)
        self.assertEqual(len(calls), 3)                     # 25 + 5 per union, dazu die einzelne Datenbank
        self.assertTrue(calls[0][2].startswith('union isfuzzy=true database("WS0_Monitoring_Database")'))
        self.assertEqual(calls[0][2].count("database("), 25)
        self.assertEqual([r[0] for r in report], ["trd-mon.z3.kusto.fabric.microsoft.com: 25 Datenbanken",
                                                  "trd-mon.z3.kusto.fabric.microsoft.com: 5 Datenbanken", "Einzeln"])
        self.assertEqual(len(rows), 3)

    def test_union_failure_falls_back_and_skips_unreadable(self):
        def handler(url, body):
            if body["csl"].startswith("union"):
                return 400, {"error": "union nicht erlaubt"}
            return (403, {"error": "Forbidden"}) if body["db"] == "B" else (200, ROWS)
        f, calls = self.kusto(handler)
        rows, report = f.logs_all([(CLUSTER, "A"), (CLUSTER, "B"), (CLUSTER, "C")], 7, False)
        self.assertEqual([r[0] for r in report], ["A", "C"])
        self.assertEqual(len(rows), 2)
        self.assertTrue(any("B nicht lesbar: 403" in n for n in f.notes))

    def test_single_database_error_still_aborts(self):
        f, _ = self.kusto(lambda url, body: (403, {"error": "Forbidden"}))
        with self.assertRaises(fetch.FetchError):
            f.logs_all([(CLUSTER, "A")], 7, False)

    def test_forbidden_stops_with_readable_error(self):
        f, calls = self.kusto(lambda url, body: (403, {"error": "Forbidden"}))
        with self.assertRaises(fetch.FetchError) as cm:
            f.logs(CLUSTER, "X", 7, False)
        self.assertIn("nicht lesbar: 403", str(cm.exception))
        self.assertEqual(len(calls), 2)          # Cluster-Token und kusto.windows.net, dann Schluss


if __name__ == "__main__":
    unittest.main()
