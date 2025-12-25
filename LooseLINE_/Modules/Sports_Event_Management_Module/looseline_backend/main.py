from flask import Flask, jsonify, request
from flask_cors import CORS
from api import get_events
from services import manageSportEvents

app = Flask(__name__)
CORS(app)

@app.route("/api/events", methods=["GET"])
def events():
    sport = request.args.get("sport")
    return jsonify(get_events(sport))

@app.route("/api/events", methods=["POST"])
def create_event():
    try:
        data = request.get_json()
        # Получаем admin_id из заголовков или данных (в реальном приложении из сессии)
        admin_id = request.headers.get("X-Admin-Id") or data.get("admin_id", "admin_1")
        
        result = manageSportEvents(
            action="create",
            admin_id=admin_id,
            sport_type=data.get("sport_type"),
            league_name=data.get("league_name"),
            home_team=data.get("home_team"),
            away_team=data.get("away_team"),
            event_datetime=data.get("event_datetime"),
            odds_data=data.get("odds_data", [])
        )
        
        if isinstance(result, tuple) and result[1] != 200:
            return jsonify(result[0]), result[1]
        
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/events/cleanup", methods=["POST"])
def cleanup_old_events():
    """Удаляет старые события без home_team и away_team"""
    try:
        from db import get_connection
        conn = get_connection()
        cur = conn.cursor()
        
        # Удаляем события из старой таблицы (без sport_id)
        try:
            cur.execute("""
                DELETE FROM events 
                WHERE sport_id IS NULL 
                OR home_team IS NULL 
                OR away_team IS NULL
            """)
            deleted_count = cur.rowcount
            conn.commit()
        except:
            # Если таблица не имеет этих полей, пробуем удалить по другой структуре
            try:
                cur.execute("""
                    DELETE FROM events 
                    WHERE title LIKE '%Концерт%' 
                    OR title LIKE '%Conference%' 
                    OR title LIKE '%Festival%'
                """)
                deleted_count = cur.rowcount
                conn.commit()
            except:
                deleted_count = 0
        
        cur.close()
        conn.close()
        
        return jsonify({"success": True, "deleted": deleted_count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
