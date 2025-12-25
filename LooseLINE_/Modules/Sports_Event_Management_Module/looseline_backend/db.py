import psycopg2
import os

def get_connection():
    # Берем DATABASE_URL из окружения или используем дефолтные значения
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        return psycopg2.connect(database_url)
    
    # Fallback для локальной разработки
    return psycopg2.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', 5432)),
        database=os.environ.get('DB_NAME', 'looseline_sports'),
        user=os.environ.get('DB_USER', 'postgres'),
        password=os.environ.get('DB_PASSWORD', 'postgres')
    )