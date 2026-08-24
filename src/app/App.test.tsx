import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { routeDefinitions } from "./routes/route-definitions";
import { appRouter } from "./routes/router";
import { App } from "./App";
import { database } from "@/lib/storage/database";
import { WorkspaceService } from "@/lib/storage/workspace-service";

describe("DualLens application shell", () => {
  const routeHeading: Partial<Record<(typeof routeDefinitions)[number]["path"], string>> = {
    "/": "Trustworthy AI investment research",
    "/project": "From experiment to research product",
  };

  it("renders the complete Demo Mode overview", async () => {
    await appRouter.navigate("/");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Trustworthy AI investment research" }),
    ).toBeVisible();
    expect(screen.getByText("138")).toBeVisible();
    expect(screen.getAllByText("FLAGGED").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Academic experiment" })).toBeVisible();
    expect(screen.getByText(/Demo Mode reconstructs the final evaluated run/i)).toBeVisible();
    expect(await screen.findByText("Ready")).toBeVisible();
  });

  it("exposes accessible navigation and an honest mode boundary", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Financial Lens" })).toHaveAttribute(
      "href",
      "#/financial",
    );
    const localModeButtons = screen.getAllByRole("button", { name: /local ai/i });
    expect(localModeButtons.every((button) => !button.hasAttribute("disabled"))).toBe(true);
    await user.click(localModeButtons[0]!);
    expect(
      await screen.findByRole("heading", { name: /local evidence research workspace/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /From measured experiment to local product/i }),
    ).toBeVisible();
    expect(screen.getByText(/same evidence-first contract to your own documents/i)).toBeVisible();
    expect(screen.getByText(/processed on this device/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Open navigation" })).toBeVisible();
  });

  it("exposes the developer and public project links in the footer", async () => {
    await appRouter.navigate("/");
    render(<App />);

    const author = (await screen.findByText("Arturo Cesar Morales Montaño")).closest("a");
    expect(author).not.toBeNull();
    expect(author).toHaveAttribute("href", "https://artmoram.com/");
    expect(author).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /LinkedIn/i })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/arturo-cesar-morales-montano/",
    );
    expect(screen.getByRole("link", { name: /View repository/i })).toHaveAttribute(
      "href",
      "https://github.com/TYNIP/DualLens_Analytics-Trustworthy_AI_Investment_Research",
    );
  });

  it("resolves every planned route in Demo Mode", async () => {
    render(<App />);

    for (const route of routeDefinitions) {
      await act(() => appRouter.navigate(route.path));
      expect(
        await screen.findByRole("heading", {
          name: routeHeading[route.path] ?? route.label,
        }),
      ).toBeVisible();
    }
  });

  it("explains the academic-to-portfolio transition without rendering a broken notebook link", async () => {
    await appRouter.navigate("/project");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "What the academic experiment tested" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Lessons carried into Local AI" })).toBeVisible();
    expect(screen.getByText(/not bundled into the static application/i)).toBeVisible();
    expect(document.querySelector('a[href*=".ipynb"]')).toBeNull();
  });

  it("connects the academic and browser-native architectures", async () => {
    await appRouter.navigate("/how-it-works");
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "The runtime changed; the evidence contract did not",
      }),
    ).toBeVisible();
    expect(screen.getByText("Financial data + five AI initiative PDFs")).toBeVisible();
  });

  it("renders a recoverable not-found route", async () => {
    await appRouter.navigate("/missing-research-module");
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Route not found" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Return to overview" })).toHaveAttribute("href", "#/");
  });

  it("shows the no-WebGPU retrieval fallback and keeps generation disabled", async () => {
    localStorage.setItem("duallens:app-mode", "local-ai");
    await appRouter.navigate("/assistant");
    render(<App />);

    expect(await screen.findByText(/WebGPU is unavailable/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Generate grounded answer" })).toBeDisabled();
    expect(screen.getByText(/Retrieval works without WebGPU/i)).toBeVisible();
  });

  it("requires confirmation before clearing the local workspace", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(globalThis, "confirm").mockReturnValue(false);
    localStorage.setItem("duallens:app-mode", "local-ai");
    await appRouter.navigate("/storage");
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Clear local workspace" }));
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/Clear .* from this browser/i));
    confirm.mockRestore();
  });

  it("enables the upload workflow after a company and PDF are selected", async () => {
    const user = userEvent.setup();
    const workspace = new WorkspaceService(database);
    await workspace.clear();
    localStorage.setItem("duallens:app-mode", "local-ai");
    await appRouter.navigate("/documents");
    render(<App />);

    await user.type(await screen.findByLabelText("Ticker or short code"), "ACME");
    await user.type(screen.getByLabelText("Company or research entity"), "Acme Robotics");
    await user.click(screen.getByRole("button", { name: "Add company" }));
    expect(await screen.findByText("Acme Robotics")).toBeVisible();

    const file = new File(["synthetic"], "acme.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("PDF source"), file);
    expect(screen.getByRole("button", { name: "Index PDF" })).toBeEnabled();
    await workspace.clear();
  });
});
