import { describe, expect, it } from "vitest";

import { academicConfidenceVerdict, experiment, goldSetResults, heldOutResults } from "./index";

describe("academic demo fixtures", () => {
  it("preserves the final experiment metrics", () => {
    expect(experiment).toMatchObject({
      companies: 5,
      pages: 44,
      chunks: 138,
      filteredRetrievalHit: 75,
      companyPurity: 96,
      baselineAccuracy: 55,
      heldOutV1Accuracy: 50,
      heldOutV2Accuracy: 62.5,
      judgeMean: 80,
      rankingGroundedness: 100,
      confidence: 79,
      verdict: "flagged",
    });
  });

  it("keeps the complete objective and held-out result sets", () => {
    expect(goldSetResults).toHaveLength(20);
    expect(goldSetResults.filter((result) => result.exactHit)).toHaveLength(11);
    expect(heldOutResults).toHaveLength(8);
    expect(heldOutResults.filter((result) => result.v1Hit)).toHaveLength(4);
    expect(heldOutResults.filter((result) => result.v2Hit)).toHaveLength(5);
  });

  it("maps 79.0 to the notebook's flagged policy", () => {
    expect(academicConfidenceVerdict(79)).toBe("flagged");
    expect(academicConfidenceVerdict(80)).toBe("client-ready");
    expect(academicConfidenceVerdict(59.9)).toBe("human-review");
  });
});
