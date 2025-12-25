FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y \
    gcc \
    libpq-dev

# Install Python dependencies directly
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install \
    flask \
    flask-cors \
    gunicorn \
    sqlalchemy \
    psycopg2-binary \
    python-dotenv

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Run with gunicorn (Flask production server)
CMD ["gunicorn", "--bind", "0.0.0.0:8001", "main:app"]
