from database import engine, Base, SessionLocal
import models
import data  # your existing data.py

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# --- Stage 1: parents first (organizations, users) ---
for org_id, org in data.organizations.items():
    db.add(models.Organization(**org))

for email, u in data.users.items():
    db.add(models.User(email=email, password=u["password"], org_id=u["org_id"]))

db.commit()  # commit parents BEFORE children reference them

# --- Stage 2: everything that has a foreign key to organizations ---
for a in data.assets:
    db.add(models.Asset(**a))

for r in data.policy_rules:
    db.add(models.PolicyRule(**r))

for f in data.compliance_frameworks:
    db.add(models.ComplianceFramework(
        id=f["id"], org_id=f["org_id"], name=f["name"],
        description=f["description"], pass_count=f["pass"], fail_count=f["fail"]
    ))

db.commit()  # commit frameworks before failed_controls references them

# --- Stage 3: things that reference stage 2 tables ---
for framework_id, controls in data.failed_controls.items():
    for c in controls:
        db.add(models.FailedControl(
            framework_id=framework_id, control_id=c["id"],
            desc=c["desc"], resource=c["resource"]
        ))

for c in data.chaos_events:
    db.add(models.ChaosEvent(**c))

for f in data.feed:
    db.add(models.FeedItem(**f))

db.commit()
db.close()
print("Seeded aethershield database ✅")