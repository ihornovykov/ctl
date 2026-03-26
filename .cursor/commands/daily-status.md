Generate a **Daily Status** summary of completed work for standup or async updates.

## Rules

- **Scope:** Describe work done **today** and **yesterday**. If it's Monday, include **only today**.
- **Tone:** Use **non-technical**, outcome-focused language (what was delivered, not implementation details).
- **Structure:**
  - Group items by **ticket/issue ID** when applicable (e.g. `CRM-38 Client list`).
  - Under each ticket: one short title line, then **indented bullet points** for specific accomplishments.
  - Items without a ticket can be listed as plain bullets under Today or Yesterday.
- **Format:** Plain markdown with `Daily Status` as title, then `Today` and `Yesterday` sections.

## Example

```md 
Daily Status
Today

CRM-38 Client list
Moved shared ui, utils, constants to shared package within monorepo

CRM-87 Client Details
Implemented client details modal with tabs
Introduced functionality to adjust SMS usage, manage subscriptions and refresh Mindbody token

CRM-91 Settings
Added RBAC system to manage access to features for admins and supports
```