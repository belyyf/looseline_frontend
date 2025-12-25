export type Odds = {
  odds_id: number;
  bet_type: string;
  coefficient: number;
};

export type SportEvent = {
  event_id: number;
  home_team: string;
  away_team: string;
  league: string;
  sport_type: string;
  status: string;
  event_datetime: string;
  home_score: number | null;
  away_score: number | null;
  odds: Odds[];
};

export type EventsResponse = {
  events: SportEvent[];
  page: number;
  per_page: number;
  total_count: number;
};

