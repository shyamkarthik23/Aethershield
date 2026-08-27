import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import data  # kept only as a static reference for "original" asset values on reset
from schemas import ChaosTriggerRequest
from auth import get_current_org

router = APIRouter(prefix="/api/chaos", tags=["chaos"])

def _event_dict(e):
    return {"id": e.id, "org_id": e.org_id, "title": e.title, "provider": e.provider,
            "description": e.description, "finding_id": e.finding_id,
            "finding_patch": e.finding_patch, "feed_message": e.feed_message}

@router.get("/events")
def list_chaos_events(org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    events = db.query(models.ChaosEvent).filter(models.ChaosEvent.org_id == org_id).all()
    return [_event_dict(e) for e in events]

@router.post("/trigger")
def trigger_event(req: ChaosTriggerRequest, org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    event = db.query(models.ChaosEvent).filter(
        models.ChaosEvent.id == req.event_id, models.ChaosEvent.org_id == org_id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Chaos event not found")

    already = db.query(models.TriggeredEvent).filter(
        models.TriggeredEvent.chaos_event_id == req.event_id, models.TriggeredEvent.org_id == org_id
    ).first()
    if already:
        return {"status": "already_triggered"}

    db.add(models.TriggeredEvent(chaos_event_id=req.event_id, org_id=org_id))

    asset = db.query(models.Asset).filter(
        models.Asset.id == event.finding_id, models.Asset.org_id == org_id
    ).first()
    if asset:
        for key, value in event.finding_patch.items():
            setattr(asset, key, value)

    db.add(models.FeedItem(
        id=f"feed-{req.event_id}-{int(time.time()*1000)}",  # timestamp keeps id unique across repeat cycles
        org_id=org_id, provider=event.provider.upper(), text=event.feed_message,
        status="CRITICAL", time="Just now",
    ))
    db.commit()
    return {"status": "triggered", "event_id": req.event_id}

@router.post("/reset")
def reset_chaos(org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    triggered = db.query(models.TriggeredEvent).filter(models.TriggeredEvent.org_id == org_id).all()
    for t in triggered:
        db.delete(t)

    for event_data in data.chaos_events:
        if event_data["org_id"] != org_id:
            continue
        original = next((a for a in data.assets if a["id"] == event_data["finding_id"]), None)
        if not original:
            continue
        asset = db.query(models.Asset).filter(
            models.Asset.id == event_data["finding_id"], models.Asset.org_id == org_id
        ).first()
        if asset:
            asset.status = original["status"]
            asset.severity = original["severity"]
            asset.details = original["details"]

    db.commit()
    return {"status": "reset"}