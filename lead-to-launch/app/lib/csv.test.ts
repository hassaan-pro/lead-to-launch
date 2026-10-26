import { describe, expect, it } from "vitest";
import { csvEscape } from "./csv";

describe("csvEscape", () => {
  it("neutralises formula starts with a leading single quote", () => {
    expect(csvEscape("=2+3")).toBe("'=2+3");
    expect(csvEscape("+2+3")).toBe("'+2+3");
    expect(csvEscape("-2+3")).toBe("'-2+3");
    expect(csvEscape("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
    expect(csvEscape("|calc")).toBe("'|calc");
    expect(csvEscape("%calc")).toBe("'%calc");
  });

  it("neutralises a formula hidden behind leading spaces or tabs", () => {
    expect(csvEscape("  =cmd")).toBe("'=cmd");
    expect(csvEscape("\t=cmd")).toBe("'=cmd");
  });

  it("leaves normal values alone, including a phone number that does not start with a formula char", () => {
    expect(csvEscape("Test Salon")).toBe("Test Salon");
    expect(csvEscape(4.7)).toBe("4.7");
    expect(csvEscape("0300 1234567")).toBe("0300 1234567");
  });

  it("treats a plus phone number as text, because Excel treats a leading plus as a formula start", () => {
    expect(csvEscape("+92 300 1234567")).toBe("'+92 300 1234567");
  });

  it("still quotes fields with commas, quotes, or newlines, after neutralising", () => {
    expect(csvEscape("Hello, World")).toBe('"Hello, World"');
    expect(csvEscape('Say "hi"')).toBe('"Say ""hi"""');
    expect(csvEscape("Line1\nLine2")).toBe('"Line1\nLine2"');
    expect(csvEscape("=cmd, arg")).toBe('"\'=cmd, arg"');
  });

  it("returns an empty string for null and undefined", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });
});
