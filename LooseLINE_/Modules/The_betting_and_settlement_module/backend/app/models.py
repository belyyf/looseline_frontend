from datetime import datetime

from sqlalchemy import (
  Column,
  DateTime,
  ForeignKey,
  Integer,
  Numeric,
  String,
  Text,
)
from sqlalchemy.orm import relationship

from .db import Base


class User(Base):
  __tablename__ = "users"

  id = Column(String(50), primary_key=True, index=True)
  username = Column(String(100))
  email = Column(String(255))
  created_at = Column(DateTime, default=datetime.utcnow)

  balance = relationship("UserBalance", back_populates="user", uselist=False)

  coupons = relationship("Coupon", back_populates="user")
  transactions = relationship("BetTransaction", back_populates="user")


class UserBalance(Base):
  __tablename__ = "users_balance"

  user_id = Column(String(50), ForeignKey("users.id"), primary_key=True)
  balance = Column(Numeric(15, 2), nullable=False, default=0)
  total_deposited = Column(Numeric(15, 2), default=0)
  total_withdrawn = Column(Numeric(15, 2), default=0)
  currency = Column(String(3), default="USD")
  updated_at = Column(DateTime, default=datetime.utcnow)

  user = relationship("User", back_populates="balance")


class Event(Base):
  __tablename__ = "events"

  event_id = Column(Integer, primary_key=True, index=True)
  event_name = Column(String(255), nullable=False)
  event_date = Column(DateTime)
  status = Column(String(20), default="scheduled")
  created_at = Column(DateTime, default=datetime.utcnow)

  odds = relationship("Odds", back_populates="event")
  result = relationship("BetResult", back_populates="event", uselist=False)


class Odds(Base):
  __tablename__ = "odds"

  odds_id = Column(Integer, primary_key=True, index=True)
  event_id = Column(Integer, ForeignKey("events.event_id"), nullable=False)
  bet_type = Column(String(10), nullable=False)  # '1', 'X', '2'
  coefficient = Column(Numeric(10, 2), nullable=False)
  created_at = Column(DateTime, default=datetime.utcnow)

  event = relationship("Event", back_populates="odds")


class Bet(Base):
  __tablename__ = "bets"

  bet_id = Column(Integer, primary_key=True, index=True)
  user_id = Column(String(50), nullable=False)  # No FK - uses auth module user_id
  event_id = Column(Integer, nullable=False)  # No FK - events are in sports module
  event_name = Column(String(255), nullable=True) # Added event name for display
  event_end_date = Column(DateTime, nullable=True) # Added: when event ends
  expected_result = Column(String(10), nullable=True) # Added: П1, X, or П2
  odds_id = Column(Integer, nullable=True)  # No FK - odds are in sports module
  bet_type = Column(String(10))
  bet_amount = Column(Numeric(15, 2), nullable=False)
  coefficient = Column(Numeric(10, 2), nullable=False)
  potential_win = Column(Numeric(15, 2), nullable=False)
  status = Column(String(20), default="open")
  result = Column(String(20))
  actual_win = Column(Numeric(15, 2))
  placed_at = Column(DateTime, default=datetime.utcnow)
  resolved_at = Column(DateTime)
  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow)


  # Relationships removed - events/odds in different database
  coupon_links = relationship("CouponBet", back_populates="bet")
  transactions = relationship("BetTransaction", back_populates="bet")


class Coupon(Base):
  __tablename__ = "coupons"

  coupon_id = Column(Integer, primary_key=True, index=True)
  user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
  coupon_code = Column(String(20), unique=True, nullable=False)
  total_bet_amount = Column(Numeric(15, 2), nullable=False)
  total_potential_win = Column(Numeric(15, 2), nullable=False)
  status = Column(String(20), default="open")
  result = Column(String(20))
  actual_win = Column(Numeric(15, 2))
  number_of_bets = Column(Integer, nullable=False)
  created_at = Column(DateTime, default=datetime.utcnow)
  resolved_at = Column(DateTime)
  updated_at = Column(DateTime, default=datetime.utcnow)

  user = relationship("User", back_populates="coupons")
  bets = relationship("CouponBet", back_populates="coupon")


class CouponBet(Base):
  __tablename__ = "coupon_bets"

  coupon_bet_id = Column(Integer, primary_key=True, index=True)
  coupon_id = Column(Integer, ForeignKey("coupons.coupon_id"), nullable=False)
  bet_id = Column(Integer, ForeignKey("bets.bet_id"), nullable=False)

  coupon = relationship("Coupon", back_populates="bets")
  bet = relationship("Bet", back_populates="coupon_links")


class BetTransaction(Base):
  __tablename__ = "bet_transactions"

  transaction_id = Column(Integer, primary_key=True, index=True)
  user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
  bet_id = Column(Integer, ForeignKey("bets.bet_id"))
  transaction_type = Column(String(20), nullable=False)
  amount = Column(Numeric(15, 2), nullable=False)
  balance_before = Column(Numeric(15, 2))
  balance_after = Column(Numeric(15, 2))
  description = Column(Text)
  created_at = Column(DateTime, default=datetime.utcnow)

  user = relationship("User", back_populates="transactions")
  bet = relationship("Bet", back_populates="transactions")


class BetResult(Base):
  __tablename__ = "bet_results"

  result_id = Column(Integer, primary_key=True, index=True)
  event_id = Column(Integer, ForeignKey("events.event_id"), nullable=False)
  winning_bet_type = Column(String(10))
  home_score = Column(Integer)
  away_score = Column(Integer)
  resolved_at = Column(DateTime, default=datetime.utcnow)

  event = relationship("Event", back_populates="result")


