from sqlalchemy import Column, String, Boolean, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Organization(Base):
    __tablename__ = "organizations"
    org_id = Column(String(50), primary_key=True)
    org_name = Column(String(100), nullable=False)

class User(Base):
    __tablename__ = "users"
    email = Column(String(100), primary_key=True)
    password = Column(String(100), nullable=False)
    org_id = Column(String(50), ForeignKey("organizations.org_id"))

class Asset(Base):
    __tablename__ = "assets"
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.org_id"))
    name = Column(String(100))
    provider = Column(String(20))
    service_type = Column(String(50))
    status = Column(String(20))
    details = Column(String(255))
    severity = Column(String(20))

class PolicyRule(Base):
    __tablename__ = "policy_rules"
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.org_id"))
    name = Column(String(100))
    category = Column(String(50))
    provider = Column(String(20))
    severity = Column(String(20))
    active = Column(Boolean, default=True)
    auto_remediate = Column(Boolean, default=False)

class ComplianceFramework(Base):
    __tablename__ = "compliance_frameworks"
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.org_id"))
    name = Column(String(100))
    description = Column(String(255))
    pass_count = Column(Integer, default=0)
    fail_count = Column(Integer, default=0)

class FailedControl(Base):
    __tablename__ = "failed_controls"
    row_id = Column(Integer, primary_key=True, autoincrement=True)
    framework_id = Column(String(50), ForeignKey("compliance_frameworks.id"))
    control_id = Column(String(20))
    desc = Column(String(255))
    resource = Column(String(100))

class ChaosEvent(Base):
    __tablename__ = "chaos_events"
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.org_id"))
    title = Column(String(150))
    provider = Column(String(20))
    description = Column(String(500))
    finding_id = Column(String(50))
    finding_patch = Column(JSON)
    feed_message = Column(String(255))

class FeedItem(Base):
    __tablename__ = "feed"
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.org_id"))
    provider = Column(String(20))
    text = Column(String(255))
    status = Column(String(20))
    time = Column(String(50))

class TriggeredEvent(Base):
    __tablename__ = "triggered_events"
    row_id = Column(Integer, primary_key=True, autoincrement=True)
    chaos_event_id = Column(String(50), ForeignKey("chaos_events.id"))
    org_id = Column(String(50), ForeignKey("organizations.org_id"))