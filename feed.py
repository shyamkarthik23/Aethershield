# feed.py
from fastapi import APIRouter, Depends
import data
from auth import get_current_org

router = APIRouter(prefix="/api/feed", tags=["feed"])

@router.get("")
def get_feed(limit: int = 20, org_id: str = Depends(get_current_org)):
    org_feed = [f for f in data.feed if f["org_id"] == org_id]
    return org_feed[:limit]
