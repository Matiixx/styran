import { google, type calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { type GaxiosError } from "gaxios";

import { type Dayjs } from "~/utils/dayjs";
import { db } from "~/server/db";

export class GoogleCalendarApi {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;
  private userToken: string | undefined;
  private userId: string;

  constructor(userId: string, refreshToken: string | undefined | null) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    this.userId = userId;

    this.oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
  }

  async getEvents(ctx: {
    timeMin?: Dayjs;
    timeMax?: Dayjs;
    privateExtendedProperty?: string[];
  }) {
    const res = await this.calendar.events
      .list({
        calendarId: "primary",
        timeMin: ctx.timeMin?.toISOString(),
        timeMax: ctx.timeMax?.toISOString(),
        privateExtendedProperty: ctx.privateExtendedProperty,
      })
      .catch(async (error: GaxiosError) => {
        if (error.message === "invalid_grant") {
          await db.user.update({
            where: { id: this.userId },
            data: { gclRefreshToken: null },
          });
        }
        return { data: { items: null } };
      });
    return res.data.items;
  }

  async createEvent(event: calendar_v3.Schema$Event) {
    const res = await this.calendar.events
      .insert({
        calendarId: "primary",
        requestBody: event,
      })
      .catch(async (error: GaxiosError) => {
        if (error.message === "invalid_grant") {
          await db.user.update({
            where: { id: this.userId },
            data: { gclRefreshToken: null },
          });
        }
        return { data: null };
      });

    return res.data;
  }

  async deleteEvent(eventId: string) {
    const res = await this.calendar.events
      .delete({
        calendarId: "primary",
        eventId: eventId,
      })
      .catch(async (error: GaxiosError) => {
        if (error.message === "invalid_grant") {
          await db.user.update({
            where: { id: this.userId },
            data: { gclRefreshToken: null },
          });
        }
        return { data: null };
      });

    return res.data;
  }

  async updateEvent(eventId: string, event: calendar_v3.Schema$Event) {
    const res = await this.calendar.events
      .update({
        calendarId: "primary",
        eventId: eventId,
        requestBody: event,
      })
      .catch(async (error: GaxiosError) => {
        if (error.message === "invalid_grant") {
          await db.user.update({
            where: { id: this.userId },
            data: { gclRefreshToken: null },
          });
        }
        return { data: null };
      });

    return res.data;
  }
}
