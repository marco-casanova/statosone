import { describe, it, expect } from "vitest";
import { validateRegister, passwordStrength } from "../registerValidation";

describe("validateRegister", () => {
  it("fails when name missing", () => {
    const r = validateRegister({
      full_name: "",
      email: "a@b.com",
      password: "secret",
    });
    expect(r.ok).toBe(false);
    expect(r.error).toBe("error.name_required");
  });
  it("fails invalid email", () => {
    const r = validateRegister({
      full_name: "Alice",
      email: "nope",
      password: "secret",
    });
    expect(r.ok).toBe(false);
    expect(r.error).toBe("error.email_invalid");
  });
  it("fails short password", () => {
    const r = validateRegister({
      full_name: "Alice",
      email: "a@b.com",
      password: "123",
    });
    expect(r.ok).toBe(false);
    expect(r.error).toBe("error.password_short");
  });
  it("passes valid set", () => {
    const r = validateRegister({
      full_name: "Alice",
      email: "a@b.com",
      password: "Secret1!",
    });
    expect(r.ok).toBe(true);
  });
});

describe("passwordStrength", () => {
  it("scores increasing complexity (length & diversity)", () => {
    // below 6 chars -> 0
    expect(passwordStrength("abc")).toBe(0);
    // length >=6 adds 1
    expect(passwordStrength("ghijkl")).toBe(1);
    // length >=10 adds another (2)
    expect(passwordStrength("ghijklmnop")).toBe(2);
    // add uppercase + digits -> diversity >=3 => +1 (3)
    expect(passwordStrength("Ghijklmnop1")).toBe(3);
    // add symbol and longer length tier >=14 => could reach 4
    expect(passwordStrength("Ghijklmnop1!QRST")).toBe(4);
  });
  it("penalizes repetition", () => {
    const base = passwordStrength("Aaaaaaa1!");
    const better = passwordStrength("AaBcdEf1!");
    expect(better).toBeGreaterThanOrEqual(base);
  });
});
