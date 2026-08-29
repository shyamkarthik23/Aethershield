# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import auth, assets, policy_rules, compliance, dashboard, remediation, chaos, feed, copilot

app = FastAPI(title="AetherShield API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aethershieldfrontend-mhmsozdj6-shyam-a951.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(policy_rules.router)
app.include_router(compliance.router)
app.include_router(dashboard.router)
app.include_router(remediation.router)
app.include_router(chaos.router)
app.include_router(feed.router)
app.include_router(copilot.router)

@app.get("/")
def root():
    return {"status": "AetherShield API running"}
