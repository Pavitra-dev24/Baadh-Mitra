from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.flood_feed import generate_next_alert

router = APIRouter(tags=["alerts"])


@router.get("/api/districts/{district_id}/alerts", response_model=list[schemas.AlertOut])
def list_alerts(district_id: str, db: Session = Depends(get_db)):
    if not db.get(models.District, district_id):
        raise HTTPException(404, "District not found")
    return (
        db.query(models.Alert)
        .filter(models.Alert.district_id == district_id)
        .order_by(models.Alert.issued_at.desc())
        .all()
    )


@router.get("/api/districts/{district_id}/alerts/active", response_model=schemas.AlertOut | None)
def get_active_alert(district_id: str, db: Session = Depends(get_db)):
    district = db.get(models.District, district_id)
    if not district:
        raise HTTPException(404, "District not found")
    return (
        db.query(models.Alert)
        .filter(models.Alert.district_id == district_id, models.Alert.is_active.is_(True))
        .order_by(models.Alert.issued_at.desc())
        .first()
    )


@router.post(
    "/api/districts/{district_id}/alerts/simulate",
    response_model=schemas.AlertOut,
    status_code=201,
)
def simulate_alert(district_id: str, db: Session = Depends(get_db)):
    """Demo/testing control that stands in for an incoming Flood Hub-style
    gauge update. Deactivates the previous alert for this district and issues
    the next one, nudged from the last severity level (see app/flood_feed.py).
    """
    district = db.get(models.District, district_id)
    if not district:
        raise HTTPException(404, "District not found")

    previous = (
        db.query(models.Alert)
        .filter(models.Alert.district_id == district_id, models.Alert.is_active.is_(True))
        .order_by(models.Alert.issued_at.desc())
        .first()
    )
    if previous:
        previous.is_active = False

    data = generate_next_alert(district.river, previous.severity if previous else None)
    alert = models.Alert(district_id=district_id, is_active=True, **data)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
