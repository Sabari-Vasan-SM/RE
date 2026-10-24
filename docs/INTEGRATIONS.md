# FocusFlow — Integrations Architecture & Providers

## 1. Overview
FocusFlow provides an extensible integrations hub for synchronizing tasks and schedules with external issue management systems and calendar feeds.

---

## 2. Supported Integration Providers

### 2.1 GitHub Issues & Pull Requests
- **Protocol**: GitHub REST API v3 / GraphQL.
- **Authentication**: Personal Access Token (PAT) with `repo` or `read:org` scopes.
- **Capabilities**:
  - Search and filter issues assigned to user or matching query `is:open is:issue assignee:@me`.
  - Import issues directly as FocusFlow tasks with remote links and labels mapped to tags.
  - Sync issue completion status when task is finished.
  - Work log estimation and comment sync.

### 2.2 Atlassian Jira
- **Protocol**: Jira REST API v2 / v3.
- **Authentication**: Basic Auth with Jira API Token (`email:apiToken`) or OAuth 2.0 (3LO).
- **Capabilities**:
  - JQL search queries (e.g. `assignee = currentUser() AND statusCategory != Done`).
  - Import issues with story points mapped to `timeEstimate`.
  - Log work logs to Jira issues directly from tracked time in FocusFlow.

### 2.3 GitLab
- **Protocol**: GitLab REST API v4.
- **Authentication**: Personal Access Token with `read_api` / `api` scopes.
- **Capabilities**:
  - Filter assigned issues and merge requests.
  - Import milestone and estimate information.

### 2.4 CalDAV & iCal Calendars
- **Protocol**: CalDAV / RFC 4791 & RFC 5545 (iCalendar).
- **Authentication**: Basic / Digest credentials or public `.ics` subscription URL.
- **Capabilities**:
  - Fetch calendar events for the active day / week.
  - Display events as overlay blocks on the FocusFlow Schedule timeline.
  - Prevent accidental duplicate imports via unique UID tracking.

---

## 3. Security & Credential Isolation
- Credentials and API tokens are saved in local storage or encrypted browser storage.
- Never transmitted to third-party telemetry servers.
- A connection verification test (`testConnection()`) must be completed before an integration is marked active.
