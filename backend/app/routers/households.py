from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(tags=["households"])


@router.get("/api/districts/{district_id}/households", response_model=list[schemas.HouseholdOut])
def list_households(district_id: str, db: Session = Depends(get_db)):
    if not db.get(models.District, district_id):
        raise HTTPException(404, "District not found")
    return (
        db.query(models.Household)
        .filter(models.Household.district_id == district_id)
        .order_by(models.Household.created_at)
        .all()
    )


@router.post(
    "/api/districts/{district_id}/households",
    response_model=schemas.HouseholdOut,
    status_code=201,
)
def create_household(
    district_id: str, payload: schemas.HouseholdCreate, db: Session = Depends(get_db)
):
    if not db.get(models.District, district_id):
        raise HTTPException(404, "District not found")
    household = models.Household(district_id=district_id, **payload.model_dump())
    db.add(household)
    db.commit()
    db.refresh(household)
    return household


@router.patch("/api/households/{household_id}", response_model=schemas.HouseholdOut)
def update_household(
    household_id: str, payload: schemas.HouseholdUpdate, db: Session = Depends(get_db)
):
    household = db.get(models.Household, household_id)
    if not household:
        raise HTTPException(404, "Household not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(household, field, value)
    db.commit()
    db.refresh(household)
    return household


@router.delete("/api/households/{household_id}", status_code=204)
def delete_household(household_id: str, db: Session = Depends(get_db)):
    household = db.get(models.Household, household_id)
    if not household:
        raise HTTPException(404, "Household not found")
    db.delete(household)
    db.commit()
