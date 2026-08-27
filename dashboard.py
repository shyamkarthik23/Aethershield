from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from scoring import compute_score, count_critical, count_active_threats, count_auto_remediations
from auth import get_current_org

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

def _asset_dict(a):
    return {"id": a.id, "org_id": a.org_id, "name": a.name, "provider": a.provider,
            "service_type": a.service_type, "status": a.status, "details": a.details,
            "severity": a.severity}

def _rule_dict(r):
    return {"id": r.id, "org_id": r.org_id, "name": r.name, "category": r.category,
            "provider": r.provider, "severity": r.severity, "active": r.active,
            "auto_remediate": r.auto_remediate}

@router.get("/summary")
def dashboard_summary(org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    org_assets = [_asset_dict(a) for a in db.query(models.Asset).filter(models.Asset.org_id == org_id).all()]
    org_rules = [_rule_dict(r) for r in db.query(models.PolicyRule).filter(models.PolicyRule.org_id == org_id).all()]
    org = db.query(models.Organization).filter(models.Organization.org_id == org_id).first()

    remediated_count = db.query(models.Asset).filter(models.Asset.details.like("Remediated --%")).count()

    return {
        "org_id": org_id,
        "org_name": org.org_name,
        "security_score": compute_score(org_assets),
        "active_threats": count_active_threats(org_assets),
        "critical_findings": count_critical(org_assets),
        "auto_remediations": count_auto_remediations(org_rules, remediated_count),
        "priority_findings": [a for a in org_assets if a["severity"] != "Healthy"][:4],
    }