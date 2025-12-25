import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const events = await db
      .selectFrom('event')
      .selectAll()
      .orderBy('event_datetime', 'asc')
      .execute();
      
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const eventData = await request.json();
    
    // Validate required fields
    if (!eventData.home_team || !eventData.away_team || !eventData.event_datetime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the event in the database
    const newEvent = await db
      .insertInto('event')
      .values({
        name: `${eventData.home_team} vs ${eventData.away_team}`,
        home_team: eventData.home_team,
        away_team: eventData.away_team,
        sport_type: eventData.sport_type || 'football',
        league_name: eventData.league_name || 'Premier League',
        event_datetime: new Date(eventData.event_datetime),
        expected_revenue: Number(eventData.expectedRevenue) || 0,
        coefficient_1: parseFloat(eventData.coefficient_1) || 2.0,
        coefficient_x: parseFloat(eventData.coefficient_x) || 3.0,
        coefficient_2: parseFloat(eventData.coefficient_2) || 2.5,
        status: 'upcoming',
        updated_at: new Date()
      })
      .returningAll()
      .executeTakeFirst();

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// This is needed to handle CORS preflight requests
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
