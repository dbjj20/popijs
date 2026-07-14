component WorkspaceSummary {
  div(className="workspace-summary") {
    div("Status: {workflowStatus:idle}")
    div("Active filter: {activeFilter:all}")
    div("Last run: {lastRun:never}")
  }
}

component OperationsWorkspace {
  effect markLifecycle {
    const element = node as HTMLElement;
    element.dataset.lifecycle = action;

    return () => {
      element.removeAttribute("data-lifecycle");
    };
  }

  effect syncStatusStyle {
    const element = node as HTMLElement;
    const status = String(state.workflowStatus ?? "idle");
    element.dataset.status = status;
    element.style.borderColor = status === "running" ? "#c58b2b" : "#d9dde3";

    return () => {
      element.style.borderColor = "";
    };
  }

  effect mirrorTitle {
    const element = node as HTMLElement;
    element.title = `status: ${state.workflowStatus ?? "idle"}`;

    return () => {
      element.removeAttribute("title");
    };
  }

  handler runWorkflow {
    update {
      workflowStatus: "running",
      workflowMessage: "Processing queue...",
      lastRun: "starting"
    }

    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 900));

    update {
      workflowStatus: "complete",
      workflowMessage: "Queue processed successfully",
      lastRun: new Date().toLocaleTimeString()
    }
  }

  handler updateFilter {
    update {
      activeFilter: event.target.value,
      workflowMessage: "Filter changed"
    }
  }

  handler resetWorkspace {
    update {
      workflowStatus: "idle",
      workflowMessage: "Waiting for work",
      activeFilter: "all",
      lastRun: "never"
    }
  }

  div(isBoundary, className="capability capability-workspace") {
    h2("Operations workspace")
    WorkspaceSummary()
    div("Message: {workflowMessage:Waiting for work}")
    input(placeholder="filter queue", on:input=updateFilter)
    button("run workflow", on:click=runWorkflow)
    button("reset", on:click=resetWorkspace)
  }
}
