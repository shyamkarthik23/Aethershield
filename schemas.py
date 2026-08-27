# schemas.py
from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    org_id: str
    org_name: str

class PolicyRuleUpdate(BaseModel):
    active: Optional[bool] = None
    auto_remediate: Optional[bool] = None

class ChaosTriggerRequest(BaseModel):
    event_id: str

class CopilotRequest(BaseModel):
    prompt: str

class RemediateRequest(BaseModel):
    asset_id: str
    
class SignupRequest(BaseModel):
    org_name: str
    email: str
    password: str