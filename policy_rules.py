from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas import PolicyRuleUpdate
from auth import get_current_org

router = APIRouter(prefix="/api/policy-rules", tags=["policy_rules"])

def _to_dict(r):
    return {"id": r.id, "org_id": r.org_id, "name": r.name, "category": r.category,
            "provider": r.provider, "severity": r.severity, "active": r.active,
            "auto_remediate": r.auto_remediate}

@router.get("")
def list_rules(org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    return [_to_dict(r) for r in db.query(models.PolicyRule).filter(models.PolicyRule.org_id == org_id).all()]

@router.patch("/{rule_id}")
def update_rule(rule_id: str, update: PolicyRuleUpdate, org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    rule = db.query(models.PolicyRule).filter(models.PolicyRule.id == rule_id, models.PolicyRule.org_id == org_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    if update.active is not None:
        rule.active = update.active
    if update.auto_remediate is not None:
        rule.auto_remediate = update.auto_remediate
    db.commit()
    db.refresh(rule)
    return _to_dict(rule)