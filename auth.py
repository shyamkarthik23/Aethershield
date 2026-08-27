import hmac, hashlib, base64, json, time, uuid
from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas import LoginRequest, TokenResponse, SignupRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = "aethershield-demo-secret-change-in-production"
TOKEN_TTL_SECONDS = 60 * 60 * 8

def _sign(payload: dict) -> str:
    body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    sig = hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{sig}"

def _verify(token: str) -> dict:
    try:
        body, sig = token.split(".")
        expected_sig = hmac.new(SECRET_KEY.encode(), body.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            raise ValueError("bad signature")
        payload = json.loads(base64.urlsafe_b64decode(body))
        if payload["exp"] < time.time():
            raise ValueError("expired")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.post("/signup", response_model=TokenResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    org_id = f"org-{uuid.uuid4().hex[:8]}"
    new_org = models.Organization(org_id=org_id, org_name=req.org_name)
    db.add(new_org)

    new_user = models.User(email=req.email, password=req.password, org_id=org_id)
    db.add(new_user)

    db.commit()

    payload = {"sub": req.email, "org_id": org_id, "exp": time.time() + TOKEN_TTL_SECONDS}
    return TokenResponse(access_token=_sign(payload), org_id=org_id, org_name=req.org_name)

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or user.password != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    org = db.query(models.Organization).filter(models.Organization.org_id == user.org_id).first()
    payload = {"sub": req.email, "org_id": org.org_id, "exp": time.time() + TOKEN_TTL_SECONDS}
    return TokenResponse(access_token=_sign(payload), org_id=org.org_id, org_name=org.org_name)

def get_current_org(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    payload = _verify(token)
    return payload["org_id"]