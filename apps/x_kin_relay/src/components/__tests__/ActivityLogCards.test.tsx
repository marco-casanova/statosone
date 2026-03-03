import { getActivitySubtypeValues } from "../activitySubtypeValues";

describe("ActivityLogCards", () => {
  test("dedupes mirrored subtype values while preserving order", () => {
    expect(
      getActivitySubtypeValues({
        subtype_observation: "redness",
        subtype_health: "redness",
        subtype_adl: "hydration",
        subtype_service: null,
      }),
    ).toEqual(["redness", "hydration"]);
  });
});
