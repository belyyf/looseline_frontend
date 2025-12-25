from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class BetBase(BaseModel):
  user_id: str = Field(..., example="user_123")
  event_id: int = Field(..., example=1)
  odds_id: int = Field(..., example=1)
  bet_type: str = Field(..., example="1")
  bet_amount: Decimal = Field(..., example=100.0)
  coefficient: Decimal = Field(..., example=1.85)
  event_name: Optional[str] = Field(None, example="Team A vs Team B")
  event_end_date: Optional[datetime] = Field(None, example="2025-12-28T18:00:00")
  expected_result: Optional[str] = Field(None, example="П1")


class BetCreate(BetBase):
  potential_win: Optional[Decimal] = None


class Bet(BetBase):
  bet_id: int
  potential_win: Decimal
  status: str
  result: Optional[str]
  actual_win: Optional[Decimal]
  placed_at: datetime

  class Config:
    from_attributes = True


class BetCalculateRequest(BaseModel):
  bet_amount: Decimal = Field(..., example=100.0)
  coefficient: Decimal = Field(..., example=1.85)


class BetCalculateResponse(BaseModel):
  payout: Decimal
  profit: Decimal


class CouponCreate(BaseModel):
  user_id: str
  bet_ids: List[int]
  total_bet_amount: Decimal


class Coupon(BaseModel):
  coupon_id: int
  user_id: str
  coupon_code: str
  total_bet_amount: Decimal
  total_potential_win: Decimal
  status: str
  result: Optional[str]
  actual_win: Optional[Decimal]
  number_of_bets: int
  created_at: datetime

  class Config:
    from_attributes = True


class BetStatusUpdate(BaseModel):
  new_status: str = Field(..., pattern="^(open|cancelled|resolved)$")
  reason: Optional[str] = None



class UserBalance(BaseModel):
  user_id: str
  balance: Decimal
  currency: str

  class Config:
    from_attributes = True
