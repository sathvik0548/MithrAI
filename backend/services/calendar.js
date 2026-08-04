import { google } from "googleapis";
import { supabaseAdmin } from "../config/supabase.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Creates a Google Calendar event with a reminder for a user.
 * Retrieves the user's stored refresh token, exchanges it for a fresh access token,
 * and inserts the event with reminder overrides.
 */
export async function createCalendarReminder(userId, { title, description, dateTimeISO, minutesBefore = 30 }) {
  // Fetch stored refresh token for the user
  const { data: tokenRow, error: tokenError } = await supabaseAdmin
    .from("user_google_tokens")
    .select("refresh_token")
    .eq("user_id", userId)
    .single();

  if (tokenError || !tokenRow?.refresh_token) {
    const err = new Error("CALENDAR_NO_ACCESS");
    err.code = "CALENDAR_NO_ACCESS";
    throw err;
  }

  oauth2Client.setCredentials({
    refresh_token: tokenRow.refresh_token,
  });

  // Refresh to get a valid access token
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Build start/end (default 1hr event)
  const startDate = new Date(dateTimeISO);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour

  const event = {
    summary: title,
    description: description || "",
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "UTC",
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: minutesBefore },
        { method: "email", minutes: minutesBefore },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  return { eventId: response.data.id, htmlLink: response.data.htmlLink };
}
