import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppModeProvider } from "@/app/providers/app-mode-provider";

import { RagPage } from "./rag-page";

function renderDemoRag() {
  return render(
    <AppModeProvider>
      <RagPage />
    </AppModeProvider>,
  );
}

describe("RAG Demo Mode", () => {
  it("switches between curated academic questions", async () => {
    const user = userEvent.setup();
    renderDemoRag();

    await user.click(screen.getByRole("button", { name: /IBM's data security/i }));
    expect(screen.getByText(/GEPA-optimized v2 answer identified Guardium/i)).toBeVisible();
    expect(screen.getByText(/score n\/a/i)).toBeVisible();
  });

  it("does not fabricate a free-form answer", async () => {
    const user = userEvent.setup();
    renderDemoRag();

    await user.type(screen.getByLabelText("Free-form research question"), "What changed today?");
    await user.click(screen.getByRole("button", { name: "Check availability" }));
    expect(screen.getByText(/No answer was generated/i)).toBeVisible();
    expect(screen.getByText(/becomes available in Local AI Mode/i)).toBeVisible();
  });
});
