"""Seitenreihenfolge und Sichtbarkeit (Kitchen 0.6.1): Deploy.page_order_moves rechnet die
Verschiebungen, die `pbir pages move` ausführen soll."""
import json
import shutil
import sys
import tempfile
import types
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "agent"))
import live_runner as LR  # noqa: E402


def apply_moves(order, moves):
    cur = list(order)
    for pid, pos in moves:
        cur.remove(pid)
        cur.insert(pos - 1, pid)
    return cur


class PageOrder(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="mk-order-"))
        (self.tmp / "definition" / "pages").mkdir(parents=True)
        self.fake = types.SimpleNamespace(p=types.SimpleNamespace(report=self.tmp))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def order(self, ids):
        (self.tmp / "definition" / "pages" / "pages.json").write_text(
            json.dumps({"pageOrder": ids}), encoding="utf-8")

    def moves(self, kitchen):
        plan = [{"pageId": pid, "name": pid} for pid in kitchen]
        return LR.Deploy.page_order_moves(self.fake, plan)

    def test_same_order_no_moves(self):
        self.order(["a", "b", "c"])
        self.assertEqual(self.moves(["a", "b", "c"]), [])

    def test_reorder_reaches_kitchen_order(self):
        self.order(["a", "b", "c", "d"])
        mv = self.moves(["d", "a", "c", "b"])
        self.assertTrue(mv)
        self.assertEqual(apply_moves(["a", "b", "c", "d"], mv), ["d", "a", "c", "b"])

    def test_foreign_pages_keep_their_slot(self):
        # QuickInfo-Seite t steht an Platz 2 und kommt im Kitchen nicht vor
        self.order(["a", "t", "b", "c"])
        mv = self.moves(["c", "a", "b"])
        self.assertEqual(apply_moves(["a", "t", "b", "c"], mv), ["c", "t", "a", "b"])

    def test_new_page_without_id_is_ignored(self):
        self.order(["a", "b"])
        plan = [{"pageId": None, "name": "neu"}, {"pageId": "b", "name": "b"},
                {"pageId": "a", "name": "a"}]
        mv = LR.Deploy.page_order_moves(self.fake, plan)
        self.assertEqual(apply_moves(["a", "b"], mv), ["b", "a"])


if __name__ == "__main__":
    unittest.main()
