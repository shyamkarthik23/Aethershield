from database import SessionLocal
import models

db = SessionLocal()

new_events = [
    # --- Acme Corp ---
    {
        "id": "chaos-s3-exfil", "org_id": "org-acme",
        "title": "Mass S3 Data Exfiltration", "provider": "AWS",
        "description": "An unfamiliar IAM role began downloading large volumes of objects from prod-billing-invoices within a short window, consistent with automated exfiltration.",
        "finding_id": "res-aws-s3-01",
        "finding_patch": {"status": "DANGER", "severity": "Critical",
                           "details": "Unusual bulk download activity detected from unrecognized role"},
        "feed_message": "Mass object download detected on prod-billing-invoices",
    },
    {
        "id": "chaos-iam-privesc", "org_id": "org-acme",
        "title": "IAM Privilege Escalation Attempt", "provider": "AWS",
        "description": "deployer-svc-account attempted to attach an AdministratorAccess policy to itself, a known privilege escalation pattern.",
        "finding_id": "res-aws-iam-03",
        "finding_patch": {"status": "DANGER", "severity": "Critical",
                           "details": "Self-privilege escalation attempt detected (policy self-attach)"},
        "feed_message": "Privilege escalation attempt flagged on deployer-svc-account",
    },

    # --- Globex Industries ---
    {
        "id": "chaos-sa-key-leak", "org_id": "org-globex",
        "title": "Exposed Service Account Key", "provider": "GCP",
        "description": "A key for temp-consultant-sa was found published in a public code repository, granting anyone Owner-level access.",
        "finding_id": "res-gcp-iam-07",
        "finding_patch": {"status": "DANGER", "severity": "Critical",
                           "details": "Service account key found exposed in public repository"},
        "feed_message": "Leaked credential detected for temp-consultant-sa",
    },
    {
        "id": "chaos-sql-public-brute", "org_id": "org-globex",
        "title": "Brute Force Attempts on Public DB", "provider": "GCP",
        "description": "orders-cloudsql's public IP is receiving repeated failed login attempts from a rotating set of external addresses.",
        "finding_id": "res-gcp-sql-09",
        "finding_patch": {"status": "DANGER", "severity": "Critical",
                           "details": "Repeated brute-force login attempts detected from external IPs"},
        "feed_message": "Brute-force login activity detected on orders-cloudsql",
    },
]

added = 0
for e in new_events:
    exists = db.query(models.ChaosEvent).filter(models.ChaosEvent.id == e["id"]).first()
    if exists:
        print(f"Skipping {e['id']} — already exists")
        continue
    db.add(models.ChaosEvent(**e))
    added += 1

db.commit()
db.close()
print(f"Added {added} new chaos event(s) ✅")