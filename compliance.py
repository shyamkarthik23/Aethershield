from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_org

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

@router.get("/frameworks")
def list_frameworks(org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    frameworks = db.query(models.ComplianceFramework).filter(models.ComplianceFramework.org_id == org_id).all()
    return [{"id": f.id, "org_id": f.org_id, "name": f.name, "description": f.description,
             "pass": f.pass_count, "fail": f.fail_count} for f in frameworks]

@router.get("/frameworks/{framework_id}/failed-controls")
def get_failed_controls(framework_id: str, org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    framework = db.query(models.ComplianceFramework).filter(
        models.ComplianceFramework.id == framework_id, models.ComplianceFramework.org_id == org_id
    ).first()
    if not framework:
        raise HTTPException(status_code=404, detail="Framework not found")
    controls = db.query(models.FailedControl).filter(models.FailedControl.framework_id == framework_id).all()
    return [{"id": c.control_id, "desc": c.desc, "resource": c.resource} for c in controls]