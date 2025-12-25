from decimal import Decimal
from typing import Iterable, List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models


def calculate_potential_win(amount: Decimal, coefficient: Decimal) -> dict:
  payout = round(amount * coefficient, 2)
  profit = round(payout - amount, 2)
  return {"payout": payout, "profit": profit}


def calculate_coupon_win(amount: Decimal, coefficients: Iterable[Decimal]) -> dict:
  coeffs = [Decimal(str(c)) for c in coefficients if Decimal(str(c)) >= Decimal("1.01")]
  if not coeffs or amount <= 0:
    return {
      "betAmount": Decimal("0"),
      "coefficients": [],
      "totalCoefficient": Decimal("0"),
      "potentialWin": Decimal("0"),
      "profit": Decimal("0"),
    }

  total_coeff = Decimal("1")
  for c in coeffs:
    total_coeff *= c

  potential = round(amount * total_coeff, 2)
  profit = round(potential - amount, 2)

  return {
    "betAmount": amount,
    "coefficients": coeffs,
    "totalCoefficient": round(total_coeff, 2),
    "potentialWin": potential,
    "profit": profit,
  }


def create_bet(db: Session, *, payload) -> models.Bet:
  # Check and create user if needed (DEMO MODE: no balance deduction)
  user_balance = db.get(models.UserBalance, payload.user_id)
  if not user_balance:
    # Create user if missing
    user = db.get(models.User, payload.user_id)
    if not user:
      # Truncate username to fit in 100 chars
      username = f"user_{payload.user_id[:93]}"
      user = models.User(id=payload.user_id, username=username, email=f"{payload.user_id}@example.com")
      db.add(user)
      db.commit()
      db.refresh(user)

    # Create balance if missing
    user_balance = models.UserBalance(user_id=payload.user_id, balance=5000, currency="USD")
    db.add(user_balance)
    db.commit()
    db.refresh(user_balance)

  # DEMO MODE: Skip balance check and deduction
  # if user_balance.balance < payload.bet_amount:
  #   raise ValueError("Insufficient funds")
  # user_balance.balance -= payload.bet_amount

  data = payload.dict()
  if not data.get("potential_win"):
    calc = calculate_potential_win(payload.bet_amount, payload.coefficient)
    data["potential_win"] = calc["payout"]

  # Map bet_type to expected_result
  if not data.get("expected_result"):
    if payload.bet_type == "1":
      data["expected_result"] = "П1"
    elif payload.bet_type == "X":
      data["expected_result"] = "X"
    elif payload.bet_type == "2":
      data["expected_result"] = "П2"

  bet = models.Bet(**data)
  db.add(bet)
  db.commit()
  db.refresh(bet)
  return bet


def get_user_balance(db: Session, user_id: str) -> models.UserBalance:
  balance = db.get(models.UserBalance, user_id)
  if not balance:
    # Auto-create user if missing
    user = db.get(models.User, user_id)
    if not user:
      # Truncate username to fit in 100 chars
      username = f"user_{user_id[:93]}"
      user = models.User(id=user_id, username=username, email=f"{user_id}@example.com")
      db.add(user)
      db.commit()
      db.refresh(user)

    # Auto-create balance if missing for UX/Demo
    balance = models.UserBalance(user_id=user_id, balance=5000, currency="USD")
    db.add(balance)
    db.commit()
    db.refresh(balance)

  # DEMO MODE: Always return 5000 balance
  # Create a copy with balance = 5000 for demo purposes
  demo_balance = models.UserBalance(
    user_id=balance.user_id,
    balance=Decimal("5000.00"),
    currency=balance.currency,
    total_deposited=balance.total_deposited,
    total_withdrawn=balance.total_withdrawn,
    updated_at=balance.updated_at
  )

  return demo_balance


def get_bet(db: Session, bet_id: int) -> Optional[models.Bet]:
  return db.get(models.Bet, bet_id)


def list_user_bets(db: Session, user_id: str) -> List[models.Bet]:
  stmt = select(models.Bet).where(models.Bet.user_id == user_id).order_by(
    models.Bet.placed_at.desc()
  )
  return list(db.scalars(stmt))


def create_coupon(db: Session, *, user_id: str, bet_ids: List[int], total_amount: Decimal) -> models.Coupon:
  # Получаем ставки и их коэффициенты
  stmt = select(models.Bet).where(models.Bet.bet_id.in_(bet_ids))
  bets = list(db.scalars(stmt))
  if len(bets) != len(bet_ids):
    raise ValueError("Some bet ids not found")

  coeffs = [Decimal(str(b.coefficient)) for b in bets]
  calc = calculate_coupon_win(total_amount, coeffs)

  from datetime import datetime

  date = datetime.utcnow().strftime("%Y%m%d")
  import random

  random_code = f"{random.randrange(10**6):06d}"
  coupon_code = f"CPN{date}_{random_code}"

  coupon = models.Coupon(
    user_id=user_id,
    coupon_code=coupon_code,
    total_bet_amount=total_amount,
    total_potential_win=calc["potentialWin"],
    status="open",
    number_of_bets=len(bet_ids),
  )
  db.add(coupon)
  db.flush()  # чтобы появился coupon_id

  for b in bets:
    link = models.CouponBet(coupon_id=coupon.coupon_id, bet_id=b.bet_id)
    db.add(link)

  db.commit()
  db.refresh(coupon)
  return coupon


def update_bet_status(db: Session, bet_id: int, new_status: str) -> Optional[models.Bet]:
  bet = get_bet(db, bet_id)
  if not bet:
    return None
  bet.status = new_status
  db.commit()
  db.refresh(bet)
  return bet


def list_user_coupons(db: Session, user_id: str) -> List[models.Coupon]:
  stmt = select(models.Coupon).where(models.Coupon.user_id == user_id).order_by(
    models.Coupon.created_at.desc()
  )
  return list(db.scalars(stmt))


