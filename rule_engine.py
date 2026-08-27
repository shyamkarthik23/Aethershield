# rule_engine.py
def check_public_storage(asset):
    if asset["service_type"] == "S3 Bucket" and "Public" in asset["details"]:
        return {"rule": "Block Public Storage Buckets", "severity": "Critical"}
    return None

def check_open_ssh(asset):
    if asset["service_type"] == "Security Group" and "0.0.0.0/0" in asset["details"]:
        return {"rule": "Restrict Public SSH/RDP", "severity": "Critical"}
    return None

def check_stale_access_key(asset):
    if asset["service_type"] == "IAM User" and "90 days" in asset["details"]:
        return {"rule": "Require MFA for IAM Consoles", "severity": "Warning"}
    return None

def check_wildcard_iam_role(asset):
    if asset["service_type"] == "Service Account" and "Owner" in asset["details"]:
        return {"rule": "Restrict Wildcard IAM Roles", "severity": "Critical"}
    return None

RULES = [check_public_storage, check_open_ssh, check_stale_access_key, check_wildcard_iam_role]

def evaluate_assets(org_assets: list) -> list:
    violations = []
    for asset in org_assets:
        for rule_fn in RULES:
            result = rule_fn(asset)
            if result:
                violations.append({"asset_id": asset["id"], "asset_name": asset["name"], **result})
    return violations
