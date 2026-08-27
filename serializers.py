def asset_out(a):
    return {
        "id": a.id, "org_id": a.org_id, "name": a.name, "provider": a.provider,
        "service_type": a.service_type, "status": a.status, "details": a.details,
        "severity": a.severity,
    }

def rule_out(r):
    return {
        "id": r.id, "org_id": r.org_id, "name": r.name, "category": r.category,
        "provider": r.provider, "severity": r.severity, "active": r.active,
        "auto_remediate": r.auto_remediate,
    }

def framework_out(f):
    return {
        "id": f.id, "org_id": f.org_id, "name": f.name, "description": f.description,
        "pass": f.pass_count, "fail": f.fail_count,
    }

def failed_control_out(fc):
    return {"id": fc.control_id, "desc": fc.description, "resource": fc.resource}

def chaos_event_out(e):
    return {
        "id": e.id, "org_id": e.org_id, "title": e.title, "provider": e.provider,
        "description": e.description,
    }

def feed_out(f):
    return {
        "id": str(f.pk), "org_id": f.org_id, "provider": f.provider,
        "text": f.text, "status": f.status, "time": f.time,
    }