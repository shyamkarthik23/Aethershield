# scoring.py
CRITICAL_PENALTY = 11
WARNING_PENALTY = 4

def compute_score(org_assets: list) -> int:
    critical = sum(1 for a in org_assets if a["severity"] == "Critical")
    warning = sum(1 for a in org_assets if a["severity"] == "Warning")
    raw = 100 - critical * CRITICAL_PENALTY - warning * WARNING_PENALTY
    return max(0, min(100, raw))

def count_critical(org_assets: list) -> int:
    return sum(1 for a in org_assets if a["severity"] == "Critical")

def count_active_threats(org_assets: list) -> int:
    return sum(1 for a in org_assets if a["status"] == "DANGER")

def count_auto_remediations(org_policy_rules: list, remediated_count: int) -> int:
    active_auto = sum(1 for r in org_policy_rules if r["active"] and r["auto_remediate"])
    return active_auto * 6 + remediated_count
