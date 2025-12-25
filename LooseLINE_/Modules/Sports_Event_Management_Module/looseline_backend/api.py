from services import loadSportEvents

def get_events(sport=None):
    return loadSportEvents(sport_type=sport)
    