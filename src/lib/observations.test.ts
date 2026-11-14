import { expect, it } from "vitest";
import { meanObservedValue, radialLevel } from "./observations";
it("averages task-level performance, includes failures and ignores NE", () => {
  expect(meanObservedValue([{taskLevel: 3, observation: "A"}, {taskLevel: 2, observation: "C"}, {taskLevel: 1, observation: "F"}, {taskLevel: 3, observation: "NE"}], 1)).toBeCloseTo(1.4);
  expect(meanObservedValue([], 2)).toBeNull();
  expect(meanObservedValue([{observation: "NE"}], 2)).toBeNull();
  expect(meanObservedValue([{observation: "C"}], 2)).toBe(1.2);
});
it("uses equal radial increments from the hub, including fractional observations", () => {
  expect([0, 1, 2, 3].map(v => radialLevel(v, 10, 100))).toEqual([10, 40, 70, 100]);
  expect(radialLevel(1.2, 10, 100)).toBe(46);
});
