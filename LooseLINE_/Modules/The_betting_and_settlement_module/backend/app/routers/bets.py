from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..db import get_db

router = APIRouter(prefix="/bets", tags=["bets"])


@router.post("/calculate", response_model=schemas.BetCalculateResponse)
def calculate_bet(body: schemas.BetCalculateRequest):
  result = crud.calculate_potential_win(body.bet_amount, body.coefficient)
  return schemas.BetCalculateResponse(**result)


@router.post("/", response_model=schemas.Bet, status_code=status.HTTP_201_CREATED)
def create_bet(
  bet: schemas.BetCreate,
  db: Session = Depends(get_db),
):
  try:
    created = crud.create_bet(db, payload=bet)
    return created
  except ValueError as e:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{bet_id}", response_model=schemas.Bet)
def get_bet(
  bet_id: int,
  db: Session = Depends(get_db),
):
  bet = crud.get_bet(db, bet_id)
  if not bet:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bet not found")
  return bet


@router.get("/user/{user_id}", response_model=List[schemas.Bet])
def list_user_bets(
  user_id: str,
  db: Session = Depends(get_db),
):
  return crud.list_user_bets(db, user_id=user_id)


@router.patch("/{bet_id}/status", response_model=schemas.Bet)
def update_status(
  bet_id: int,
  body: schemas.BetStatusUpdate,
  db: Session = Depends(get_db),
):
  bet = crud.update_bet_status(db, bet_id=bet_id, new_status=body.new_status)
  if not bet:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bet not found")
  return bet



@router.get("/balance/{user_id}", response_model=schemas.UserBalance)
def get_balance(
  user_id: str,
  db: Session = Depends(get_db),
):
  return crud.get_user_balance(db, user_id)
