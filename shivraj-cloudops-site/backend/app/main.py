from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from .db import Base, engine, get_db
from .models import ContactMessage

app = FastAPI(title="Shivraj CloudOps Website API")


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/v1/content")
def get_content():
    return {
        "name": "Shivraj Singh Bisht",
        "title": "CloudOps | DevOps | Infrastructure | Security",
        "tagline": "Building secure, scalable, observable platforms.",
        "services": [
            "Kubernetes platform engineering",
            "CI/CD pipelines and GitOps",
            "Infrastructure as Code (Terraform, Helm)",
            "Cloud security and compliance",
            "Observability (Prometheus, Grafana, ELK)",
            "Cost optimization and reliability"
        ],
        "contact": {
            "email": "contact@example.com"
        }
    }


@app.post("/api/v1/contact", status_code=201)
def submit_contact(payload: ContactIn, db: Session = Depends(get_db)):
    try:
        record = ContactMessage(name=payload.name, email=payload.email, message=payload.message)
        db.add(record)
        db.commit()
        db.refresh(record)
        return {"id": record.id, "created_at": record.created_at}
    except Exception as exc:  # pragma: no cover
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to store message") from exc