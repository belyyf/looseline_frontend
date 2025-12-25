"""
SQLAlchemy ORM модели для LOOSELINE.
Соответствуют таблицам из tables.sql.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from sqlalchemy import (
    Column, String, Integer, BigInteger, Boolean,
    DECIMAL, TIMESTAMP, Text, ForeignKey, Index, DATE
)
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    """
    Модель пользователя.
    
    Attributes:
        id: Уникальный ID пользователя (INTEGER)
        email: Email пользователя (уникальный)
        username: Имя пользователя
        password_hash: Хэш пароля
        stripe_customer_id: ID клиента в Stripe
        is_verified: Верифицирован ли аккаунт
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36))
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True)
    password_hash = Column(String(255), nullable=False)
    stripe_customer_id = Column(String(100), unique=True, index=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    balance = relationship("UserBalance", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("BalanceTransaction", back_populates="user", cascade="all, delete-orphan")
    wallet_operations = relationship("WalletOperation", back_populates="user", cascade="all, delete-orphan")
    payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete-orphan")
    withdrawal_methods = relationship("WithdrawalMethod", back_populates="user", cascade="all, delete-orphan")
    monthly_statements = relationship("MonthlyStatement", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    bets = relationship("Bet", back_populates="user", cascade="all, delete-orphan")


class UserBalance(Base):
    """
    Баланс пользователя.

    Attributes:
        id: ID записи (PRIMARY KEY)
        user_id: ID пользователя (UNIQUE)
        balance: Текущий баланс
        locked_in_bets: Заблокировано в ставках
        total_deposited: Сумма всех пополнений
        total_withdrawn: Сумма всех выводов
        total_bet: Сумма всех ставок
        total_won: Сумма всех выигрышей
        total_lost: Сумма всех проигрышей
        currency: Валюта (по умолчанию USD)
        last_transaction_at: Время последней транзакции
    """
    __tablename__ = "users_balance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    balance = Column(DECIMAL(15, 2), nullable=False, default=0.00)
    locked_in_bets = Column(DECIMAL(15, 2), default=0.00)
    total_deposited = Column(DECIMAL(15, 2), default=0.00)
    total_withdrawn = Column(DECIMAL(15, 2), default=0.00)
    total_bet = Column(DECIMAL(15, 2), default=0.00)
    total_won = Column(DECIMAL(15, 2), default=0.00)
    total_lost = Column(DECIMAL(15, 2), default=0.00)
    currency = Column(String(3), default="USD")
    last_transaction = Column(TIMESTAMP)  # Для совместимости со старым кодом
    last_transaction_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="balance")

    @property
    def net_profit(self) -> Decimal:
        """Чистая прибыль: выигрыши - проигрыши."""
        return Decimal(self.total_won or 0) - Decimal(self.total_lost or 0)

    @property
    def roi_percent(self) -> float:
        """ROI в процентах."""
        if self.total_bet and self.total_bet > 0:
            return float((Decimal(self.total_won or 0) / Decimal(self.total_bet)) * 100)
        return 0.0


class BalanceTransaction(Base):
    """
    История всех транзакций.

    transaction_type варианты:
        - deposit: пополнение счёта
        - withdrawal: вывод средств
        - bet_placed: размещение ставки
        - bet_won: выигрыш ставки
        - bet_lost: проигрыш ставки
        - bet_cancelled: отмена ставки
        - coupon_won: выигрыш купона
        - coupon_lost: проигрыш купона
        - bonus_added: добавлен бонус
        - fee_charged: списана комиссия
        - refund: возврат денег

    status варианты:
        - completed: завершено
        - pending: в ожидании
        - failed: ошибка
        - cancelled: отменено
    """
    __tablename__ = "balance_transactions"

    transaction_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(String(50), nullable=False)
    amount = Column(DECIMAL(15, 2), nullable=False)
    balance_before = Column(DECIMAL(15, 2), nullable=False)
    balance_after = Column(DECIMAL(15, 2), nullable=False)
    status = Column(String(20), nullable=False)
    description = Column(Text)
    reference_id = Column(String(100))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")

    __table_args__ = (
        Index("idx_user_transactions", "user_id", "created_at"),
        Index("idx_transaction_type", "transaction_type"),
    )


class WalletOperation(Base):
    """
    Операции пополнения/вывода через Stripe.

    operation_type: deposit, withdrawal
    status: pending, processing, completed, failed, cancelled
    """
    __tablename__ = "wallet_operations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36), unique=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    operation_type = Column(String(20), nullable=False)
    amount = Column(DECIMAL(15, 2), nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(String(20), default="pending")
    stripe_payment_intent_id = Column(String(100))
    stripe_payment_method_id = Column(String(100))
    stripe_charge_id = Column(String(100))
    withdrawal_method_id = Column(Integer)
    processor = Column(String(50))
    processor_reference = Column(String(100))
    fee_amount = Column(DECIMAL(15, 2), default=0.00)
    net_amount = Column(DECIMAL(15, 2))
    error_code = Column(String(50))
    error_message = Column(Text)
    initiated_at = Column(TIMESTAMP, default=datetime.utcnow)
    processed_at = Column(TIMESTAMP)
    completed_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="wallet_operations")

    __table_args__ = (
        Index("idx_wallet_operations_user_id", "user_id"),
        Index("idx_wallet_operations_created_at", "created_at"),
    )


class PaymentMethod(Base):
    """
    Сохранённые способы оплаты.
    """
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stripe_payment_method_id = Column(String(100), unique=True, nullable=False)
    card_last4 = Column(String(4))
    card_brand = Column(String(50))
    card_exp_month = Column(Integer)
    card_exp_year = Column(Integer)
    is_default = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="payment_methods")

    __table_args__ = (
        Index("idx_payment_methods_user_id", "user_id"),
    )


class WithdrawalMethod(Base):
    """
    Методы вывода средств.
    """
    __tablename__ = "withdrawal_methods"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    method_type = Column(String(50), nullable=False)
    account_details = Column(JSONB, default={})
    is_default = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="withdrawal_methods")

    __table_args__ = (
        Index("idx_withdrawal_methods_user_id", "user_id"),
    )


class MonthlyStatement(Base):
    """Месячные финансовые отчёты."""
    __tablename__ = "monthly_statements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    period_date = Column(DATE, nullable=False)
    file_path = Column(String(500))
    status = Column(String(20), default='generated')
    generated_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="monthly_statements")

    __table_args__ = (
        Index("idx_monthly_statements_user_id", "user_id"),
        Index("idx_monthly_statements_period", "period_date"),
    )


class AuditLog(Base):
    """
    Аудит логирование всех операций.
    
    action варианты:
        - deposit_initiated: инициирован депозит
        - deposit_completed: депозит завершён
        - withdrawal_initiated: инициирован вывод
        - withdrawal_completed: вывод завершён
        - balance_checked: проверка баланса
        - export_requested: запрос экспорта отчёта
        - suspicious_activity: подозрительная активность
        - stripe_webhook_received: получен webhook от Stripe
    """
    __tablename__ = "audit_log"

    log_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(50), nullable=False)
    amount = Column(DECIMAL(15, 2))
    ip_address = Column(INET)
    user_agent = Column(Text)
    status = Column(String(20))
    details = Column(JSONB)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index("idx_audit_log_user_id", "user_id"),
        Index("idx_audit_log_action", "action"),
        Index("idx_audit_log_created_at", "created_at"),
    )


class Bet(Base):
    """
    Ставки пользователей.

    status: pending, active, won, lost, void, cashout
    """
    __tablename__ = "bets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(String(100), nullable=False)
    event_name = Column(String(255))
    market_type = Column(String(100))
    selection = Column(String(255))
    odds = Column(DECIMAL(10, 4), nullable=False)
    stake = Column(DECIMAL(15, 2), nullable=False)
    potential_win = Column(DECIMAL(15, 2), nullable=False)
    actual_win = Column(DECIMAL(15, 2))
    status = Column(String(20), default='pending')
    placed_at = Column(TIMESTAMP, default=datetime.utcnow)
    settled_at = Column(TIMESTAMP)
    stake_transaction_id = Column(Integer)
    win_transaction_id = Column(Integer)
    bet_metadata = Column("metadata", JSONB, default={})
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    expected_result_date = Column(TIMESTAMP)  # Ожидаемая дата результата

    # Relationships
    user = relationship("User", back_populates="bets")

    __table_args__ = (
        Index("idx_bets_user_id", "user_id"),
        Index("idx_bets_event_id", "event_id"),
        Index("idx_bets_placed_at", "placed_at"),
        Index("idx_bets_status", "status"),
        Index("idx_bets_user_status", "user_id", "status"),
    )


