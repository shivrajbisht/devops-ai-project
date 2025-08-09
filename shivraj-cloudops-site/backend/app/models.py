from sqlalchemy import Column, Integer, String, Text, DateTime, func
from .db import Base


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(320), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)