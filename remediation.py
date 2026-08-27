import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas import RemediateRequest
from auth import get_current_org

router = APIRouter(prefix="/api/remediation", tags=["remediation"])

def _to_dict(a):
    return {"id": a.id, "org_id": a.org_id, "name": a.name, "provider": a.provider,
            "service_type": a.service_type, "status": a.status, "details": a.details,
            "severity": a.severity}

@router.post("/remediate")
def remediate_asset(req: RemediateRequest, org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    asset = db.query(models.Asset).filter(models.Asset.id == req.asset_id, models.Asset.org_id == org_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    if asset.severity == "Healthy":
        return {"status": "already_healthy", "asset": _to_dict(asset)}

    asset.status = "HEALTHY"
    asset.severity = "Healthy"
    asset.details = f"Remediated -- {asset.details}"

    db.add(models.FeedItem(
        id=f"feed-{req.asset_id}-{int(time.time()*1000)}",
        org_id=org_id, provider=asset.provider.upper(),
        text=f"Remediated: {asset.name} -- issue resolved", status="HEALTHY", time="Just now",
    ))
    db.commit()
    db.refresh(asset)
    return {"status": "remediated", "asset": _to_dict(asset)}