import { expect, describe, test, beforeAll, afterAll } from "vitest";

import { db } from "~/server/db";
import dayjs from "~/utils/dayjs";

import { GoogleCalendarApi } from "./google-calendar-api";

describe("google calendar api", () => {
  const UID = "cm3a58mci000054t40t60bsz8";
  const TEST_PROPERTY = "cm3a58mci000054t40t60bsz8";
  let googleCalendarApi: GoogleCalendarApi;

  beforeAll(async () => {
    const user = await db.user.findUnique({ where: { id: UID } });
    expect(user).toBeDefined();
    expect(user?.gclRefreshToken).toBeDefined();

    googleCalendarApi = new GoogleCalendarApi(user?.gclRefreshToken);
    await googleCalendarApi.initializeUserToken();
  });

  afterAll(async () => {
    const testEvents = await googleCalendarApi.getEvents({
      timeMin: dayjs().startOf("day"),
      timeMax: dayjs().add(1, "day").endOf("day"),
      privateExtendedProperty: [`test-property=${TEST_PROPERTY}`],
    });
    if (testEvents) {
      await Promise.all(
        testEvents.map(async (event) =>
          googleCalendarApi.deleteEvent(event.id!),
        ),
      );
    }
  });

  test("read events from calendar", async () => {
    const events = await googleCalendarApi.getEvents({
      timeMin: dayjs().startOf("day"),
      timeMax: dayjs().add(1, "day").endOf("day"),
      privateExtendedProperty: [`test-property=${TEST_PROPERTY}`],
    });
    console.log("🚀 ~ test ~ events:", events);
  });

  test("create event", async () => {
    const event = await googleCalendarApi.createEvent({
      summary: "Test Event",
      description: "Test Description",
      start: { dateTime: dayjs().toISOString() },
      end: { dateTime: dayjs().add(1, "hour").toISOString() },
      extendedProperties: { private: { "test-property": TEST_PROPERTY } },
    });

    expect(event).toBeDefined();
    expect(event.extendedProperties?.private).toBeDefined();
    expect(event.extendedProperties?.private).toEqual(
      event.extendedProperties?.private,
    );
    expect(event.summary).toEqual("Test Event");
    expect(event.description).toEqual("Test Description");
    expect(dayjs(event.start?.dateTime).hour()).toEqual(
      dayjs(dayjs().toISOString()).hour(),
    );
    expect(dayjs(event.end?.dateTime).hour()).toEqual(
      dayjs(dayjs().add(1, "hour").toISOString()).hour(),
    );
  });

  test("delete event", async () => {
    const event = await googleCalendarApi.createEvent({
      summary: "Test Event",
      description: "Test Description",
      start: { dateTime: dayjs().toISOString() },
      end: { dateTime: dayjs().add(1, "hour").toISOString() },
      extendedProperties: { private: { "test-property": TEST_PROPERTY } },
    });

    expect(event).toBeDefined();

    const deletedEvent = await googleCalendarApi.deleteEvent(event.id!);
    expect(deletedEvent).toBeDefined();

    const exisitingEvents = await googleCalendarApi.getEvents({
      timeMin: dayjs().startOf("day"),
      timeMax: dayjs().add(1, "day").endOf("day"),
      privateExtendedProperty: [`test-property=${TEST_PROPERTY}`],
    });

    if (exisitingEvents) {
      await Promise.all(
        exisitingEvents.map(async (event) => {
          return googleCalendarApi.deleteEvent(event.id!);
        }),
      );
    }
  });

  test("update event", async () => {
    const event = await googleCalendarApi.createEvent({
      summary: "Test Event",
      description: "Test Description",
      start: { dateTime: dayjs().toISOString() },
      end: { dateTime: dayjs().add(1, "hour").toISOString() },
      extendedProperties: { private: { "test-property": TEST_PROPERTY } },
    });

    expect(event).toBeDefined();

    const newStart = dayjs().add(1, "hour").toISOString();
    const newEnd = dayjs().add(2, "hour").toISOString();

    const updatedEvent = await googleCalendarApi.updateEvent(event.id!, {
      ...event,
      summary: "Updated Event",
      description: "Updated Description",
      start: { dateTime: newStart },
      end: { dateTime: newEnd },
    });

    expect(updatedEvent).toBeDefined();
    expect(updatedEvent.extendedProperties?.private).toBeDefined();
    expect(updatedEvent.extendedProperties?.private).toEqual(
      event.extendedProperties?.private,
    );
    expect(updatedEvent.summary).toEqual("Updated Event");
    expect(updatedEvent.description).toEqual("Updated Description");
    expect(dayjs(updatedEvent.start?.dateTime).hour()).toEqual(
      dayjs(newStart).hour(),
    );
    expect(dayjs(updatedEvent.start?.dateTime).minute()).toEqual(
      dayjs(newStart).minute(),
    );
    expect(dayjs(updatedEvent.end?.dateTime).hour()).toEqual(
      dayjs(newEnd).hour(),
    );
    expect(dayjs(updatedEvent.end?.dateTime).minute()).toEqual(
      dayjs(newEnd).minute(),
    );
  });
});
