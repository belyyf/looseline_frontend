from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routers import bets, coupons

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Looseline Betting API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(bets.router)
app.include_router(coupons.router)


@app.get("/health", tags=["service"])
def health_check():
  return {"status": "ok"}


@app.on_event("startup")
async def startup_event():
    # Simple "migration" to ensure columns exist
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            # Existing column
            conn.execute(text("ALTER TABLE bets ADD COLUMN IF NOT EXISTS event_name VARCHAR(255)"))
            # New columns
            conn.execute(text("ALTER TABLE bets ADD COLUMN IF NOT EXISTS event_end_date TIMESTAMP"))
            conn.execute(text("ALTER TABLE bets ADD COLUMN IF NOT EXISTS expected_result VARCHAR(10)"))
            conn.commit()
            print("✅ Checked/Added columns to bets table: event_name, event_end_date, expected_result")
    except Exception as e:
        print(f"⚠️ Migration warning: {e}")
