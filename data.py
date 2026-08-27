# data.py
# Mock multi-cloud, multi-organization dataset.
# Every resource, rule, and finding now carries an org_id so the API can
# demonstrate tenant isolation: Acme's admin never sees Globex's findings,
# and vice versa, even though both hit the same endpoints.

assets = [
    # --- Org: Acme Corp ---
    {"id": "res-aws-s3-01", "org_id": "org-acme", "name": "prod-billing-invoices", "provider": "AWS",
     "service_type": "S3 Bucket", "status": "DANGER",
     "details": "Public Read Access enabled on bucket ACL", "severity": "Critical"},
    {"id": "res-aws-sg-02", "org_id": "org-acme", "name": "web-server-secgroup", "provider": "AWS",
     "service_type": "Security Group", "status": "DANGER",
     "details": "Port 22 (SSH) open to public internet (0.0.0.0/0)", "severity": "Critical"},
    {"id": "res-aws-iam-03", "org_id": "org-acme", "name": "deployer-svc-account", "provider": "AWS",
     "service_type": "IAM User", "status": "WARNING",
     "details": "Access key older than 90 days", "severity": "Warning"},
    {"id": "res-azure-sql-04", "org_id": "org-acme", "name": "sql-user-data", "provider": "Azure",
     "service_type": "SQL Database", "status": "HEALTHY",
     "details": "TDE enabled, private endpoint only", "severity": "Healthy"},
    {"id": "res-aws-rds-08", "org_id": "org-acme", "name": "analytics-rds-prod", "provider": "AWS",
     "service_type": "RDS Instance", "status": "HEALTHY",
     "details": "Storage encryption enabled with KMS CMK", "severity": "Healthy"},

    # --- Org: Globex Industries ---
    {"id": "res-azure-vnet-05", "org_id": "org-globex", "name": "prod-vnet-eastus", "provider": "Azure",
     "service_type": "Virtual Network", "status": "HEALTHY",
     "details": "No open port 3389 rules detected", "severity": "Healthy"},
    {"id": "res-gcp-gke-06", "org_id": "org-globex", "name": "checkout-cluster", "provider": "GCP",
     "service_type": "GKE Cluster", "status": "WARNING",
     "details": "Workload identity not enforced on 2 node pools", "severity": "Warning"},
    {"id": "res-gcp-iam-07", "org_id": "org-globex", "name": "temp-consultant-sa", "provider": "GCP",
     "service_type": "Service Account", "status": "DANGER",
     "details": "Owner role granted, no expiry set", "severity": "Critical"},
    {"id": "res-gcp-sql-09", "org_id": "org-globex", "name": "orders-cloudsql", "provider": "GCP",
     "service_type": "Cloud SQL", "status": "WARNING",
     "details": "Public IP enabled, no authorized networks restriction", "severity": "Warning"},
]

policy_rules = [
    {"id": "rule-01", "org_id": "org-acme", "name": "Enforce KMS Storage Encryption", "category": "Data Protection",
     "provider": "ALL", "severity": "High", "active": True, "auto_remediate": False},
    {"id": "rule-02", "org_id": "org-acme", "name": "Block Public Storage Buckets", "category": "Data Protection",
     "provider": "AWS", "severity": "Critical", "active": True, "auto_remediate": True},
    {"id": "rule-03", "org_id": "org-acme", "name": "Restrict Public SSH/RDP", "category": "Network Security",
     "provider": "ALL", "severity": "Critical", "active": True, "auto_remediate": True},
    {"id": "rule-04", "org_id": "org-acme", "name": "Require MFA for IAM Consoles", "category": "Identity & Access",
     "provider": "AWS", "severity": "High", "active": True, "auto_remediate": False},

    {"id": "rule-05", "org_id": "org-globex", "name": "Restrict Wildcard IAM Roles", "category": "Identity & Access",
     "provider": "GCP", "severity": "Critical", "active": True, "auto_remediate": False},
    {"id": "rule-06", "org_id": "org-globex", "name": "Flag Idle Cryptomining Signatures", "category": "Threat Detection",
     "provider": "ALL", "severity": "High", "active": True, "auto_remediate": False},
    {"id": "rule-07", "org_id": "org-globex", "name": "Restrict Public Database IPs", "category": "Network Security",
     "provider": "GCP", "severity": "High", "active": True, "auto_remediate": False},
]

compliance_frameworks = [
    {"id": "cis", "org_id": "org-acme", "name": "CIS Benchmarks v1.4",
     "description": "Consensus-based cloud security best practices.", "pass": 12, "fail": 3},
    {"id": "soc2", "org_id": "org-acme", "name": "SOC 2 Type II (Security)",
     "description": "Trust Services Criteria for cloud workloads.", "pass": 28, "fail": 6},
    {"id": "hipaa", "org_id": "org-globex", "name": "HIPAA Security Rule",
     "description": "Protection of Electronic Protected Health Information.", "pass": 18, "fail": 6},
    {"id": "gdpr", "org_id": "org-globex", "name": "GDPR Privacy Shield",
     "description": "General Data Protection Regulation for EU data.", "pass": 15, "fail": 6},
]

failed_controls = {
    "cis": [
        {"id": "2.1.1", "desc": "Ensure S3 buckets employ encryption-at-rest", "resource": "prod-billing-invoices"},
        {"id": "4.1", "desc": "Ensure no security groups allow ingress from 0.0.0.0/0 to port 22", "resource": "web-server-secgroup"},
    ],
    "soc2": [
        {"id": "CC6.6", "desc": "System boundaries protected against unauthorized access", "resource": "web-server-secgroup"},
    ],
    "hipaa": [
        {"id": "1.16", "desc": "Ensure IAM policies are attached only to groups or roles", "resource": "temp-consultant-sa"},
    ],
    "gdpr": [
        {"id": "Art. 32", "desc": "Appropriate technical measures for data security", "resource": "orders-cloudsql"},
    ],
}

chaos_events = [
    {"id": "chaos-sql-ransomware", "org_id": "org-acme", "title": "SQL Database Ransomware Threat", "provider": "Azure",
     "description": "A machine learning alert shows an external IP triggering mass exports from sql-user-data, followed by ALTER TABLE encryption actions.",
     "finding_id": "res-azure-sql-04",
     "finding_patch": {"status": "DANGER", "severity": "Critical",
                        "details": "Mass export + encryption tampering detected from untrusted IP"},
     "feed_message": "Anomalous export volume detected on sql-user-data"},
    {"id": "chaos-cryptomining", "org_id": "org-globex", "title": "Cryptomining Node Injection", "provider": "GCP",
     "description": "An unauthorized pod was spun up using dynamic API access. The pod is consuming 98% CPU and communicating with public Monero pools.",
     "finding_id": "res-gcp-gke-06",
     "finding_patch": {"status": "DANGER", "severity": "Critical",
                        "details": "Unauthorized pod consuming 98% CPU, contacting known mining pool"},
     "feed_message": "Unauthorized workload detected on checkout-cluster"},
]

feed = [
    {"id": "f1", "org_id": "org-acme", "provider": "AWS", "text": "API Audit: Checked IAM policy limits", "status": "HEALTHY", "time": "Just now"},
    {"id": "f2", "org_id": "org-globex", "provider": "GCP", "text": "GKE scan completed: workload identity check ran", "status": "HEALTHY", "time": "Just now"},
]

# --- Organizations & users ---
# In a real system this would be a users/orgs table. For the demo, two
# hardcoded organizations each with one admin login.
organizations = {
    "org-acme": {"org_id": "org-acme", "org_name": "Acme Corp"},
    "org-globex": {"org_id": "org-globex", "org_name": "Globex Industries"},
}

users = {
    "admin@acme.com": {"password": "acme123", "org_id": "org-acme"},
    "admin@globex.com": {"password": "globex123", "org_id": "org-globex"},
}

triggered_event_ids = []
remediated_count = 0
