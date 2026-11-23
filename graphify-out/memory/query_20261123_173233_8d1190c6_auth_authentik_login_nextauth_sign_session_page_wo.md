---
type: "query"
date: "2026-11-23T17:32:33.450110+00:00"
question: "auth authentik login nextauth sign session page workspace role api"
contributor: "graphify"
outcome: "useful"
source_nodes: ["auth.ts", "LoginPage()", "AutoSubmitForm()", "WorkspacePage()", "signIn"]
---

# Q: auth authentik login nextauth sign session page workspace role api

## Answer

Expanded from graph vocabulary and identified auth.ts, LoginPage(), AutoSubmitForm(), WorkspacePage(), and application launch redirect as the authentication handoff path. The forced prompt=login parameter was removed so an existing Authentik session is reused.

## Outcome

- Signal: useful

## Source Nodes

- auth.ts
- LoginPage()
- AutoSubmitForm()
- WorkspacePage()
- signIn