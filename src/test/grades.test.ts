import { describe, expect, it } from "vitest";
import { classLabel, parseGrade } from "@/lib/assignments";
describe("grades", () => {
  it("parses ป.4–6 and ม.1–3", () => {
    expect(parseGrade("ป.4")).toBe("p4");
    expect(parseGrade("ม 1")).toBe("m1");
    expect(parseGrade("ม.3")).toBe("m3");
    expect(parseGrade("ป.1")).toBeNull();
  });
  it("labels", () => expect(classLabel("m2", "3")).toBe("ม.2/3"));
});
