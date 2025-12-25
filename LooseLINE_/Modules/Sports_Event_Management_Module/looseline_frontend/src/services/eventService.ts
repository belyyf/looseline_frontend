// В Docker через nginx проксируется /api/events
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function loadEvents(sport?: string) {
  try {
    const url = sport ? `${API_BASE}/events?sport=${sport}` : `${API_BASE}/events`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed to load events:', res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

export async function createEvent(eventData: any) {
  try {
    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}
