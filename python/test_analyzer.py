import unittest
from analyzer import analyze


class AnalyzerTests(unittest.TestCase):
    def test_weak_common_password(self):
        result = analyze("123456")
        self.assertEqual(result["strength"], "Weak")
        self.assertIn("This password is commonly used.", result["warnings"])

    def test_medium(self):
        self.assertEqual(analyze("Hello123")["strength"], "Medium")

    def test_strong_and_checks(self):
        result = analyze("Hello@World123!")
        self.assertEqual(result["strength"], "Strong")
        self.assertTrue(all(result["checks"].values()))

    def test_length_and_each_character_class(self):
        result = analyze("Ab3!")
        self.assertFalse(result["checks"]["length"])
        for key in ("uppercase", "lowercase", "number", "special"):
            self.assertTrue(result["checks"][key])
        self.assertGreater(analyze("Abcdef12")["score"], analyze("Ab3!")["score"])


if __name__ == "__main__":
    unittest.main()
