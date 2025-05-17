import { google, type calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

import { type Dayjs } from "~/utils/dayjs";

export class GoogleCalendarApi {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;
  private userToken: string | undefined;

  constructor(refreshToken: string | undefined | null) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    this.oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
  }

  async initializeUserToken() {
    const { token } = await this.oauth2Client.getAccessToken();
    this.userToken = token ?? undefined;
  }

  async getEvents(ctx: {
    timeMin?: Dayjs;
    timeMax?: Dayjs;
    privateExtendedProperty?: string[];
  }) {
    const res = await this.calendar.events.list({
      calendarId: "primary",
      timeMin: ctx.timeMin?.toISOString(),
      timeMax: ctx.timeMax?.toISOString(),
      privateExtendedProperty: ctx.privateExtendedProperty,
    });
    return res.data.items;
  }

  async createEvent(event: calendar_v3.Schema$Event) {
    const res = await this.calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return res.data;
  }

  async deleteEvent(eventId: string) {
    const res = await this.calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    return res.data;
  }

  async updateEvent(eventId: string, event: calendar_v3.Schema$Event) {
    const res = await this.calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      requestBody: event,
    });

    return res.data;
  }
}
