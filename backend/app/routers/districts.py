from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/districts", tags=["districts"])


@router.get("", response_model=list[schemas.DistrictOut])
def list_districts(db: Session = Depends(get_db)):
    return db.query(models.District).order_by(models.District.name).all()


@router.post("", response_model=schemas.DistrictOut, status_code=201)
def create_district(payload: schemas.DistrictCreate, db: Session = Depends(get_db)):
    district = models.District(**payload.model_dump())
    db.add(district)
    db.commit()
    db.refresh(district)
    return district


@router.get("/{district_id}", response_model=schemas.DistrictOut)
def get_district(district_id: str, db: Session = Depends(get_db)):
    district = db.get(models.District, district_id)
    if not district:
        raise HTTPException(404, "District not found")
    return district


@router.delete("/{district_id}", status_code=204)
def delete_district(district_id: str, db: Session = Depends(get_db)):
    district = db.get(models.District, district_id)
    if not district:
        raise HTTPException(404, "District not found")
    db.delete(district)
    db.commit()
