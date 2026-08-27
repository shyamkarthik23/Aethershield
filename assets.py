from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_org

router = APIRouter(prefix="/api/assets", tags=["assets"])

def _to_dict(a):
    return {"id": a.id, "org_id": a.org_id, "name": a.name, "provider": a.provider,
            "service_type": a.service_type, "status": a.status, "details": a.details,
            "severity": a.severity}

@router.get("")
def list_assets(provider: Optional[str] = Query(None), severity: Optional[str] = Query(None),
                 org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    q = db.query(models.Asset).filter(models.Asset.org_id == org_id)
    if provider:
        q = q.filter(models.Asset.provider.ilike(provider))
    if severity:
        q = q.filter(models.Asset.severity.ilike(severity))
    return [_to_dict(a) for a in q.all()]

@router.post("/scan")
def trigger_posture_scan(org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    count = db.query(models.Asset).filter(models.Asset.org_id == org_id).count()
    return {"status": "scan_complete", "assets_scanned": count}