FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (including for psycopg2)
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y \
    gcc \
    libpq-dev

# Install Python dependencies
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
# Ensure psycopg2-binary is installed
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install psycopg2-binary

# Copy application code
COPY . .

# Create directories for reports and logs
RUN mkdir -p /app/reports /app/logs

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
