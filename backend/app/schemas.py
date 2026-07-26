from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models import ElevationBand, Severity


# ---------- Districts ----------
class DistrictCreate(BaseModel):
    name: str
    river: str
    state: str


class DistrictOut(DistrictCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime


# ---------- Households ----------
class HouseholdCreate(BaseModel):
    head_name: str
    landmark_chain: str
    elevation_band: ElevationBand = ElevationBand.mid_slope
    elderly_only: bool = False
    has_smartphone: bool = True
    mobility_limited: bool = False
    resident_count: int = Field(default=1, ge=1)
    notes: str = ""


class HouseholdUpdate(BaseModel):
    head_name: Optional[str] = None
    landmark_chain: Optional[str] = None
    elevation_band: Optional[ElevationBand] = None
    elderly_only: Optional[bool] = None
    has_smartphone: Optional[bool] = None
    mobility_limited: Optional[bool] = None
    resident_count: Optional[int] = Field(default=None, ge=1)
    notes: Optional[str] = None


class HouseholdOut(HouseholdCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    district_id: str
    created_at: datetime


# ---------- Alerts ----------
class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    district_id: str
    severity: Severity
    river_level_m: float
    forecast_note: str
    issued_at: datetime
    is_active: bool
    source: str


# ---------- Checklist ----------
class ChecklistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    alert_id: str
    household_id: str
    rank: int
    priority_score: float
    reason: str
    status: str
    updated_at: datetime
    household: HouseholdOut


class ChecklistItemStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|warned|unreachable)$")


class ChecklistProgress(BaseModel):
    total: int
    warned: int
    unreachable: int
    pending: int
    percent_complete: float
