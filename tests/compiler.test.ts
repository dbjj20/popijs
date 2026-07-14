import { describe, expect, test } from "bun:test";
import { compilePL } from "../compiler/compilePL";

describe("compilePL", () => {
  test("compiles .pl components into minimal helper imports", () => {
    const output = compilePL(`
      component CounterActions {
        fragment {
          button("+", on:click=increase)
        }
      }

      component CounterCard {
        div(isBoundary, className="counter") {
          div("Count: {count:0}")
          CounterActions(increase=increase)
        }
      }
    `);

    expect(output).toContain('import { button, div, fragment } from "@xdstriker/pulsedom/virtual-node";');
    expect(output).toContain("export const CounterActions");
    expect(output).toContain("export const CounterCard");
    expect(output).toContain("CounterActions({");
    expect(output).toContain("isBoundary: true");
    expect(output).toContain('text: "Count: {count:0}"');
  });

  test("compiles handlers with magic update statements", () => {
    const output = compilePL(`
      component EchoCard {
        handler updateMessage {
          update { echo: event.target.value }
        }

        div(isBoundary) {
          input(on:input=updateMessage)
          div("Echo: {echo:}")
        }
      }
    `);

    expect(output).toContain("const updateMessage = (event, node) =>");
    expect(output).toContain('scope.draw(scope.objTree(), node, "update", { echo: event.target.value });');
    expect(output).toContain('events: { input: updateMessage }');
    expect(output).toContain('t("input"');
  });

  test("compiles async handlers and multiple effects", () => {
    const output = compilePL(`
      component ServerPanel {
        handler loadUsers {
          update { serverStatus: "loading" }
          const response = await fetch("/api/mock/users");
          const payload = await response.json();
          update { serverStatus: "loaded", userCount: payload.users.length }
        }

        effect syncStatus {
          const element = node as HTMLElement;
          element.dataset.status = String(state.serverStatus ?? "idle");
        }

        effect mirrorAction {
          const element = node as HTMLElement;
          element.dataset.action = action;
        }

        div(isBoundary) {
          button("Load", on:click=loadUsers)
          div("Users: {userCount:0}")
        }
      }
    `);

    expect(output).toContain("const loadUsers = async (event, node) =>");
    expect(output).toContain('effect: [syncStatus, mirrorAction]');
    expect(output).toContain('serverStatus: "loading"');
    expect(output).toContain('userCount: payload.users.length');
  });

  test("imports svg helper when svg is used", () => {
    const output = compilePL(`
      component SearchIcon {
        svg(viewBox="0 0 16 16") {
          path(d="M7 1a6 6 0 1 0 0 12")
        }
      }
    `);

    expect(output).toContain('import { svg, t } from "@xdstriker/pulsedom/virtual-node";');
    expect(output).toContain("return svg({");
    expect(output).toContain('t("path"');
    expect(output).toContain('d: "M7 1a6 6 0 1 0 0 12"');
  });
});
