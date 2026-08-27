import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from groq import Groq
from database import get_db
import models
from schemas import CopilotRequest
from auth import get_current_org

router = APIRouter(prefix="/api/copilot", tags=["copilot"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def _remediate(asset, db: Session):
    if asset.severity != "Healthy":
        asset.status = "HEALTHY"
        asset.severity = "Healthy"
        asset.details = f"Remediated -- {asset.details}"
        db.commit()
        db.refresh(asset)
        return asset
    return None

@router.post("/ask")
def ask_copilot(req: CopilotRequest, org_id: str = Depends(get_current_org), db: Session = Depends(get_db)):
    p = req.prompt.lower()
    org_assets = db.query(models.Asset).filter(models.Asset.org_id == org_id).all()

    # Fast-path: direct "fix X" commands stay local, no API call needed
    matched_asset = next((a for a in org_assets if a.name.lower() in p), None)
    if matched_asset and matched_asset.severity != "Healthy":
        fixed = _remediate(matched_asset, db)
        reply = (f"Fixed. {fixed.name}'s issue has been resolved and cleared from "
                 f"Asset Inventory. Your security score has been recalculated.")
        return {"reply": reply}

    # Everything else goes to the real LLM, with live org data as context
    asset_summary = "\n".join(
        f"- {a.name} ({a.provider}, {a.service_type}): {a.severity} - {a.details}"
        for a in org_assets
    )

    system_prompt = (
        "You are AetherShield Copilot, a cloud security assistant. "
        "Answer briefly and specifically using the asset data provided. "
        "If asked to fix something, tell the user to name the exact resource. "
        "Keep replies under 3 sentences unless asked for detail.\n\n"
        f"Current assets for this organization:\n{asset_summary}"
    )

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.prompt},
            ],
            max_tokens=300,
        )
        reply = completion.choices[0].message.content
    except Exception as e:
        reply = "Copilot is temporarily unavailable. Please try again shortly."
        print(f"Groq API error: {e}")

    return {"reply": reply}