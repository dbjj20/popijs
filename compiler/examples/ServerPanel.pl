component ServerDataPanel {
  handler loadUsers {
    update {
      serverStatus: "loading",
      serverMessage: "Requesting users...",
      userCount: "...",
      userList: ""
    }

    try {
      const response = await fetch("/api/mock/users");
      const payload = await response.json();
      const users = payload.users || [];

      update {
        serverStatus: "loaded",
        serverMessage: payload.message,
        userCount: users.length,
        userList: users.map((user) => `${user.name} - ${user.role}`).join(" | ")
      }
    } catch (error) {
      update {
        serverStatus: "error",
        serverMessage: error.message,
        userCount: 0,
        userList: ""
      }
    }
  }

  handler clearUsers {
    update {
      serverStatus: "idle",
      serverMessage: "No request yet",
      userCount: 0,
      userList: ""
    }
  }

  div(isBoundary, className="capability capability-server") {
    h2("Server data panel")
    div("Status: {serverStatus:idle}")
    div("Message: {serverMessage:No request yet}")
    div("Users: {userCount:0}")
    div("{userList:}")
    button("load users", on:click=loadUsers)
    button("refresh", on:click=loadUsers)
    button("clear", on:click=clearUsers)
  }
}
