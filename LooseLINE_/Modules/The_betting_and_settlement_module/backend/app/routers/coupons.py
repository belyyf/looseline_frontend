from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..db import get_db

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.get("/user/{user_id}", response_model=List[schemas.Coupon])
def list_user_coupons(
  user_id: str,
  db: Session = Depends(get_db),
):
  """Get all coupons for a user"""
  return crud.list_user_coupons(db, user_id=user_id)


@router.post("/", response_model=schemas.Coupon, status_code=status.HTTP_201_CREATED)
def create_coupon(
  body: schemas.CouponCreate,
  db: Session = Depends(get_db),
):
  try:
    coupon = crud.create_coupon(
      db,
      user_id=body.user_id,
      bet_ids=body.bet_ids,
      total_amount=body.total_bet_amount,
    )
  except ValueError as exc:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

  return coupon


