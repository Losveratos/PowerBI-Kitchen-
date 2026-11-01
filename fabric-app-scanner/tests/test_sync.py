"""Die erzeugten Kopien im Repo (Skill-Ordner, Downloads) müssen zum Quellcode passen."""
import filecmp
import os
import sys
import unittest
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
PKG = os.path.join(HERE, "..", "fabscan")
SKILL = os.path.join(ROOT, ".claude", "skills", "fabscan")
ZIP = os.path.join(ROOT, "downloads", "fabscan-skill.zip")
HINT = "Neu erzeugen: siehe README, Abschnitt Entwicklung"


@unittest.skipUnless(os.path.isdir(SKILL), "nur im Kitchen-Repo")
class Sync(unittest.TestCase):
    def test_skill_folder(self):
        for fn in os.listdir(PKG):
            if fn.endswith(".py"):
                self.assertTrue(filecmp.cmp(os.path.join(PKG, fn), os.path.join(SKILL, "scripts", "fabscan", fn), shallow=False),
                                f"{fn} im Skill-Ordner veraltet. {HINT}")
        self.assertTrue(filecmp.cmp(os.path.join(PKG, "skilldata", "SKILL.md"), os.path.join(SKILL, "SKILL.md"), shallow=False))

    def test_zip(self):
        z = zipfile.ZipFile(ZIP)
        for fn in os.listdir(PKG):
            if fn.endswith(".py"):
                with open(os.path.join(PKG, fn), "rb") as fh:
                    self.assertEqual(z.read(f"fabscan/scripts/fabscan/{fn}"), fh.read(), f"{fn} im ZIP veraltet. {HINT}")


if __name__ == "__main__":
    unittest.main()
