# restore_plaintext_passwords.py
from database import SessionLocal
import models

db = SessionLocal()

fixes = {
    "admin@acme.com": "acme123",
    "admin@globex.com": "globex123",
}

for email, plain_password in fixes.items():
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        user.password = plain_password
        print(f"Restored plaintext password for {email}")

db.commit()
db.close()
print("Done ✅")