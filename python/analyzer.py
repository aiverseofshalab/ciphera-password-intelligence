
"""Local, dependency-free password analysis engine. Reads and writes one JSON object."""
import json
import re
import sys

COMMON_PASSWORDS = {
    "password", "123456", "12345678", "qwerty", "admin", "welcome",
    "password123", "letmein", "abc123",
}
SEQUENCES = ("123456", "abcdef", "qwerty", "password")


def analyze(password: str) -> dict:
    checks = {
        "length": len(password) >= 8,
        "uppercase": any(c.isupper() for c in password),
        "lowercase": any(c.islower() for c in password),
        "number": any(c.isdigit() for c in password),
        "special": any(not c.isalnum() for c in password),
    }
 
    score = min(len(password), 8) * 3
    if len(password) < 8:
        score -= 10
    if len(password) >= 12:
        score += 10
    if len(password) >= 16:
        score += 10
    score += sum(checks[k] for k in ("uppercase", "lowercase", "number", "special")) * 12
    warnings = []
    lower = password.lower()
    if lower in COMMON_PASSWORDS:
        warnings.append("This password is commonly used.")
        score -= 35
    if len(set(password)) <= 2 and password:
        warnings.append("Repeated characters make this password easy to guess.")
        score -= 20
    if lower in SEQUENCES:
        warnings.append("This password contains a predictable sequence.")
        score -= 15
    if password.isalpha() and password:
        warnings.append("Using only letters makes this password easier to guess.")
        score -= 10
    elif password.isdigit() and password:
        warnings.append("Using only numbers makes this password easier to guess.")
        score -= 10
    score = max(0, min(100, score))
    strength = "Weak" if score < 40 else "Medium" if score < 70 else "Strong"
    return {"score": score, "strength": strength, "length": len(password), "checks": checks, "warnings": warnings}


def main() -> None:
    try:
        request = json.load(sys.stdin)
        password = request.get("password") if isinstance(request, dict) else None
        if not isinstance(password, str):
            raise ValueError("password must be a string")
        json.dump(analyze(password), sys.stdout)
        sys.stdout.write("\n")
    except (ValueError, json.JSONDecodeError) as error:
        print(json.dumps({"error": str(error)}), file=sys.stderr)
        raise SystemExit(2)


if __name__ == "__main__":
    main()
