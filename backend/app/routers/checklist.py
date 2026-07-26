from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.database import get_db
from app.prioritization import build_checklist

router = APIRouter(tags=["checklist"])


def _get_alert_or_404(db: Session, alert_id: str) -> models.Alert:
    alert = db.get(models.Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return alert


@router.post(
    "/api/alerts/{alert_id}/checklist/generate",
    response_model=list[schemas.ChecklistItemOut],
)
def generate_checklist(alert_id: str, db: Session = Depends(get_db)):
    """(Re)builds the ranked checklist for an alert from the district's
    current household roster. Safe to call again after editing households -
    existing items are replaced rather than duplicated."""
    alert = _get_alert_or_404(db, alert_id)

    db.query(models.ChecklistItem).filter(
        models.ChecklistItem.alert_id == alert_id
    ).delete()

    households = (
        db.query(models.Household)
        .filter(models.Household.district_id == alert.district_id)
        .all()
    )
    ranked = build_checklist(households, alert)

    items = []
    for row in ranked:
        item = models.ChecklistItem(
            alert_id=alert_id,
            household_id=row["household"].id,
            rank=row["rank"],
            priority_score=row["priority_score"],
            reason=row["reason"],
            status="pending",
        )
        db.add(item)
        items.append(item)

    db.commit()
    for item in items:
        db.refresh(item)

    return (
        db.query(models.ChecklistItem)
        .options(joinedload(models.ChecklistItem.household))
        .filter(models.ChecklistItem.alert_id == alert_id)
        .order_by(models.ChecklistItem.rank)
        .all()
    )


@router.get(
    "/api/alerts/{alert_id}/checklist", response_model=list[schemas.ChecklistItemOut]
)
def get_checklist(alert_id: str, db: Session = Depends(get_db)):
    _get_alert_or_404(db, alert_id)
    return (
        db.query(models.ChecklistItem)
        .options(joinedload(models.ChecklistItem.household))
        .filter(models.ChecklistItem.alert_id == alert_id)
        .order_by(models.ChecklistItem.rank)
        .all()
    )


@router.patch(
    "/api/checklist-items/{item_id}", response_model=schemas.ChecklistItemOut
)
def update_checklist_item(
    item_id: str, payload: schemas.ChecklistItemStatusUpdate, db: Session = Depends(get_db)
):
    item = db.get(models.ChecklistItem, item_id)
    if not item:
        raise HTTPException(404, "Checklist item not found")
    item.status = payload.status
    db.commit()
    db.refresh(item)
    return (
        db.query(models.ChecklistItem)
        .options(joinedload(models.ChecklistItem.household))
        .filter(models.ChecklistItem.id == item_id)
        .first()
    )


@router.get(
    "/api/alerts/{alert_id}/checklist/progress", response_model=schemas.ChecklistProgress
)
def get_progress(alert_id: str, db: Session = Depends(get_db)):
    _get_alert_or_404(db, alert_id)
    items = (
        db.query(models.ChecklistItem)
        .filter(models.ChecklistItem.alert_id == alert_id)
        .all()
    )
    total = len(items)
    warned = sum(1 for i in items if i.status == "warned")
    unreachable = sum(1 for i in items if i.status == "unreachable")
    pending = total - warned - unreachable
    percent = round((warned + unreachable) / total * 100, 1) if total else 0.0
    return schemas.ChecklistProgress(
        total=total,
        warned=warned,
        unreachable=unreachable,
        pending=pending,
        percent_complete=percent,
    )
