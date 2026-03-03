import { describe, expect, test, vi } from "vitest";
import {
  adaptKrActivitiesPayloadForMissingColumn,
  extractMissingKrActivitiesColumn,
  insertKrActivity,
} from "../krActivities";

describe("krActivities helpers", () => {
  test("extracts schema-cache missing column errors", () => {
    expect(
      extractMissingKrActivitiesColumn(
        "Could not find the 'subtype_observation' column of 'kr_activities' in the schema cache",
      ),
    ).toBe("subtype_observation");
  });

  test("maps missing subtype_observation to subtype_health", () => {
    expect(
      adaptKrActivitiesPayloadForMissingColumn(
        {
          category: "health_observation",
          subtype_observation: "breathing_difficulty",
        },
        "subtype_observation",
      ),
    ).toEqual({
      category: "health_observation",
      subtype_health: "breathing_difficulty",
    });
  });

  test("moves unsupported subtype columns into details", () => {
    expect(
      adaptKrActivitiesPayloadForMissingColumn(
        {
          category: "service",
          subtype_service: "family_contact",
          details: { note: "done" },
        },
        "subtype_service",
      ),
    ).toEqual({
      category: "service",
      details: {
        note: "done",
        activity_subtype: "family_contact",
        subtype_service: "family_contact",
      },
    });
  });

  test("retries kr_activities inserts against schema variants", async () => {
    const insert = vi
      .fn()
      .mockResolvedValueOnce({
        error: {
          message:
            "Could not find the 'subtype_observation' column of 'kr_activities' in the schema cache",
        },
      })
      .mockResolvedValueOnce({ error: null });
    const from = vi.fn(() => ({ insert }));
    const client = { from } as any;

    const result = await insertKrActivity(client, {
      category: "health_observation",
      subtype_observation: "breathing_difficulty",
      created_by: "user-1",
    });

    expect(result.error).toBeNull();
    expect(from).toHaveBeenCalledWith("kr_activities");
    expect(insert).toHaveBeenNthCalledWith(1, {
      category: "health_observation",
      subtype_observation: "breathing_difficulty",
      created_by: "user-1",
    });
    expect(insert).toHaveBeenNthCalledWith(2, {
      category: "health_observation",
      subtype_health: "breathing_difficulty",
      created_by: "user-1",
    });
  });
});
