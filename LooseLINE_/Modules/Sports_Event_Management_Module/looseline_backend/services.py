from db import get_connection

def showStartMenu():
    conn = get_connection()
    cur = conn.cursor()

    # 1. Спорты + количество событий
    cur.execute("""
        SELECT st.sport_id, st.sport_name, st.icon_emoji,
               COUNT(e.event_id) AS event_count
        FROM sports_types st
        LEFT JOIN events e ON st.sport_id = e.sport_id
        GROUP BY st.sport_id
    """)
    sports = [
        {
            "sport_id": r[0],
            "name": r[1],
            "emoji": r[2],
            "event_count": r[3]
        }
        for r in cur.fetchall()
    ]

    # 2. События в ближайшие 24 часа
    cur.execute("""
        SELECT COUNT(*) FROM events
        WHERE event_datetime BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
        AND status = 'scheduled'
    """)
    upcoming_24h = cur.fetchone()[0]

    # 3. Популярные лиги
    cur.execute("""
        SELECT l.league_id, l.league_name, st.sport_name
        FROM leagues l
        JOIN sports_types st ON st.sport_id = l.sport_id
        ORDER BY (
            SELECT COUNT(*) FROM events e WHERE e.league_id = l.league_id
        ) DESC
        LIMIT 5
    """)
    popular_leagues = [
        {
            "league_id": r[0],
            "name": r[1],
            "sport_name": r[2]
        }
        for r in cur.fetchall()
    ]

    cur.execute("SELECT COUNT(*) FROM events WHERE status != 'finished'")
    total_active_events = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {
        "sports": sports,
        "upcoming_events_24h": upcoming_24h,
        "popular_leagues": popular_leagues,
        "total_active_events": total_active_events
    }

# метод 2 

def loadSportEvents(sport_type=None, page=1, per_page=20):
    conn = get_connection()
    cur = conn.cursor()

    try:
        # Пробуем получить события из новой структуры (с home_team и away_team) + коэффициенты
        if sport_type and sport_type != "all":
            query = """
                SELECT e.event_id, st.sport_name, e.home_team, e.away_team, 
                       e.event_datetime, e.status, l.league_name
                FROM events e
                JOIN sports_types st ON e.sport_id = st.sport_id
                LEFT JOIN leagues l ON e.league_id = l.league_id
                WHERE st.sport_name = %s AND e.home_team IS NOT NULL AND e.away_team IS NOT NULL
                ORDER BY e.event_datetime DESC
                LIMIT %s OFFSET %s
            """
            cur.execute(query, (sport_type, per_page, (page - 1) * per_page))
        else:
            query = """
                SELECT e.event_id, st.sport_name, e.home_team, e.away_team, 
                       e.event_datetime, e.status, l.league_name
                FROM events e
                JOIN sports_types st ON e.sport_id = st.sport_id
                LEFT JOIN leagues l ON e.league_id = l.league_id
                WHERE e.home_team IS NOT NULL AND e.away_team IS NOT NULL
                ORDER BY e.event_datetime DESC
                LIMIT %s OFFSET %s
            """
            cur.execute(query, (per_page, (page - 1) * per_page))

        rows = cur.fetchall()
        
        # Возвращаем только данные из новой структуры (с home_team и away_team) + коэффициенты
        result = []
        for row in rows:
            event_id, sport_name, home_team, away_team, event_datetime, status, league_name = row
            if home_team and away_team:  # Только события с командами
                # Получаем коэффициенты для этого события
                cur.execute("""
                    SELECT bet_type, coefficient
                    FROM odds
                    WHERE event_id = %s AND is_active = TRUE
                    ORDER BY bet_type
                """, (event_id,))
                odds_rows = cur.fetchall()
                
                # Формируем объект с коэффициентами
                odds_dict = {}
                for bet_type, coefficient in odds_rows:
                    if bet_type == '1':
                        odds_dict['HOME'] = float(coefficient)
                    elif bet_type == 'X':
                        odds_dict['DRAW'] = float(coefficient)
                    elif bet_type == '2':
                        odds_dict['AWAY'] = float(coefficient)
                
                # Если коэффициентов нет, используем значения по умолчанию
                if not odds_dict:
                    odds_dict = {'HOME': 2.0, 'DRAW': 3.0, 'AWAY': 2.5}
                
                title = f"{home_team} vs {away_team}"
                result.append({
                    "id": event_id,
                    "event_id": event_id,
                    "sport": sport_name,
                    "title": title,
                    "home_team": home_team,
                    "away_team": away_team,
                    "event_datetime": event_datetime.isoformat() if event_datetime else None,
                    "date": event_datetime.isoformat() if event_datetime else None,
                    "status": status,
                    "league_name": league_name,
                    "type": sport_name,
                    "odds": odds_dict  # Добавляем коэффициенты
                })
        
        cur.close()
        conn.close()
        return result
        
    except Exception as e:
        # Если ошибка, возвращаем пустой список (не показываем старые данные)
        print(f"Error loading events: {e}")
        try:
            cur.close()
            conn.close()
        except:
            pass
        return []

# метод 3 

def filterEventsByType(sport_type: str):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT sport_id FROM sports_types WHERE sport_name = %s", (sport_type,))
    sport = cur.fetchone()
    if not sport:
        return {"error": "Sport not found"}, 404

    sport_id = sport[0]

    cur.execute("""
        SELECT e.event_id, l.league_name,
               e.home_team, e.away_team,
               e.event_datetime, e.status
        FROM events e
        JOIN leagues l ON l.league_id = e.league_id
        WHERE e.sport_id = %s
        ORDER BY e.event_datetime
    """, (sport_id,))

    events = cur.fetchall()

    cur.execute("""
        SELECT l.league_id, l.league_name, COUNT(e.event_id)
        FROM leagues l
        LEFT JOIN events e ON e.league_id = l.league_id
        WHERE l.sport_id = %s
        GROUP BY l.league_id
    """, (sport_id,))

    leagues = [
        {"league_id": r[0], "name": r[1], "count": r[2]}
        for r in cur.fetchall()
    ]

    cur.close()
    conn.close()

    return {
        "sport_type": sport_type,
        "total_events": len(events),
        "events": events,
        "leagues": leagues
    }

#метод 4 

def updateCoefficients(odds_id, new_coefficient, admin_id, reason=None):
    if new_coefficient < 1.01 or new_coefficient > 100:
        return {"error": "Invalid coefficient"}, 400

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT coefficient FROM odds WHERE odds_id = %s", (odds_id,))
    row = cur.fetchone()
    if not row:
        return {"error": "Odds not found"}, 404

    old = row[0]

    cur.execute("""
        UPDATE odds SET coefficient = %s, updated_at = NOW()
        WHERE odds_id = %s
    """, (new_coefficient, odds_id))

    cur.execute("""
        INSERT INTO odds_history
        (odds_id, old_coefficient, new_coefficient, changed_by, reason)
        VALUES (%s, %s, %s, %s, %s)
    """, (odds_id, old, new_coefficient, admin_id, reason))

    conn.commit()
    cur.close()
    conn.close()

    return {
        "success": True,
        "message": f"Коэффициент обновлён с {old} на {new_coefficient}"
    }

# 5 метод 

from datetime import datetime
from db import get_connection


def manageSportEvents(action: str, admin_id: str = None, event_id: int = None, **kwargs):
    if not admin_id:
        return {"error": "Admin access required"}, 403

    conn = get_connection()
    cur = conn.cursor()

    try:
        # ===================== CREATE =====================
        if action == "create":
            sport_type = kwargs.get("sport_type")
            league_name = kwargs.get("league_name")
            home_team = kwargs.get("home_team")
            away_team = kwargs.get("away_team")
            event_datetime = kwargs.get("event_datetime")
            odds_data = kwargs.get("odds_data", [])

            # проверки
            if home_team == away_team:
                return {"error": "Teams must be different"}, 400

            event_dt = datetime.fromisoformat(event_datetime.replace("Z", ""))
            if event_dt <= datetime.now():
                return {"error": "Event must be in the future"}, 400

            # sport_id - создаём спорт, если не существует
            cur.execute(
                "SELECT sport_id FROM sports_types WHERE sport_name = %s",
                (sport_type,)
            )
            sport = cur.fetchone()
            if not sport:
                # Создаём новый вид спорта
                emoji_map = {
                    "football": "⚽",
                    "basketball": "🏀",
                    "hockey": "🏒",
                    "tennis": "🎾"
                }
                cur.execute("""
                    INSERT INTO sports_types (sport_name, icon_emoji)
                    VALUES (%s, %s)
                    RETURNING sport_id
                """, (sport_type, emoji_map.get(sport_type, "🏆")))
                sport_id = cur.fetchone()[0]
            else:
                sport_id = sport[0]

            # league_id - создаём лигу, если не существует
            cur.execute(
                "SELECT league_id FROM leagues WHERE league_name = %s AND sport_id = %s",
                (league_name, sport_id)
            )
            league = cur.fetchone()
            if not league:
                # Создаём новую лигу
                cur.execute("""
                    INSERT INTO leagues (league_name, sport_id)
                    VALUES (%s, %s)
                    RETURNING league_id
                """, (league_name, sport_id))
                league_id = cur.fetchone()[0]
            else:
                league_id = league[0]

            # create event
            cur.execute("""
                INSERT INTO events
                (sport_id, league_id, home_team, away_team, event_datetime, status)
                VALUES (%s, %s, %s, %s, %s, 'scheduled')
                RETURNING event_id
            """, (sport_id, league_id, home_team, away_team, event_dt))
            new_event_id = cur.fetchone()[0]

            # create odds
            created_odds = []
            for o in odds_data:
                cur.execute("""
                    INSERT INTO odds (event_id, bet_type, coefficient, is_active)
                    VALUES (%s, %s, %s, TRUE)
                    RETURNING odds_id
                """, (new_event_id, o["bet_type"], o["coefficient"]))
                odds_id = cur.fetchone()[0]
                created_odds.append({
                    "odds_id": odds_id,
                    "bet_type": o["bet_type"],
                    "coefficient": o["coefficient"]
                })

            conn.commit()
            return {
                "success": True,
                "message": "Event created",
                "event": {
                    "event_id": new_event_id,
                    "sport_type": sport_type,
                    "league": league_name,
                    "home_team": home_team,
                    "away_team": away_team,
                    "event_datetime": event_datetime,
                    "status": "scheduled",
                    "odds": created_odds
                }
            }

        # ===================== UPDATE =====================
        elif action == "update":
            if not event_id:
                return {"error": "event_id required"}, 400

            cur.execute("SELECT status FROM events WHERE event_id = %s", (event_id,))
            row = cur.fetchone()
            if not row:
                return {"error": "Event not found"}, 404

            current_status = row[0]
            new_status = kwargs.get("status", current_status)
            home_score = kwargs.get("home_score")
            away_score = kwargs.get("away_score")

            if new_status == "finished":
                if home_score is None or away_score is None:
                    return {"error": "Scores required for finished event"}, 400

            cur.execute("""
                UPDATE events
                SET status = %s,
                    home_score = %s,
                    away_score = %s,
                    updated_at = NOW()
                WHERE event_id = %s
            """, (new_status, home_score, away_score, event_id))

            conn.commit()
            return {
                "success": True,
                "message": "Event updated",
                "event": {
                    "event_id": event_id,
                    "status": new_status,
                    "home_score": home_score,
                    "away_score": away_score
                }
            }

        # ===================== DELETE =====================
        elif action == "delete":
            if not event_id:
                return {"error": "event_id required"}, 400

            cur.execute(
                "SELECT status FROM events WHERE event_id = %s",
                (event_id,)
            )
            row = cur.fetchone()
            if not row:
                return {"error": "Event not found"}, 404

            if row[0] != "scheduled":
                return {"error": "Only scheduled events can be deleted"}, 400

            # delete odds
            cur.execute("DELETE FROM odds WHERE event_id = %s", (event_id,))
            # delete event
            cur.execute("DELETE FROM events WHERE event_id = %s", (event_id,))

            conn.commit()
            return {
                "success": True,
                "message": "Event deleted",
                "deleted_event_id": event_id
            }

        else:
            return {"error": "Invalid action"}, 400

    finally:
        cur.close()
        conn.close()


