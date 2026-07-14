# Floatask — Floating Task App Design

**Date:** 2026-07-14
**Stack:** Tauri + React (TypeScript)
**Platform:** macOS

---

## Overview

Floatask is a macOS desktop app that floats on-screen as a small circular bubble and expands into a clean minimal card when clicked. It holds a persistent task list with checkboxes, a quick-add input, and a daily carry-over prompt that appears on first open each day when incomplete tasks exist.

---

## Architecture

The app is a single Tauri window — frameless, always-on-top — that morphs between two visual states (Bubble and Card) via CSS transitions.

**Rust backend (Tauri):**
- Reads/writes task data to `~/Library/Application Support/floatask/tasks.json`
- Manages window size transitions when switching states
- Checks `lastOpenedDate` on launch to determine whether to trigger the carry-over prompt
- Exposes four commands to the frontend: `load_tasks`, `save_tasks`, `get_last_opened_date`, `update_last_opened_date`

**React frontend:**
- Owns all UI state: current mode (bubble/card), task list, quick-add visibility, carry-over dialog
- Calls Tauri `invoke` commands for all data operations
- Handles all animations via CSS transitions

**State flow on launch:**
1. Rust loads tasks and checks last-opened date
2. If new day and incomplete tasks exist → frontend shows carry-over dialog
3. User resolves dialog → lands on bubble state
4. Click bubble → expands to card
5. Click collapse or click away → returns to bubble

---

## UI & States

### Bubble State
- 56×56px circular frameless window, always-on-top, draggable
- Displays a badge with the count of incomplete tasks
- Single click → expands to card
- Right-click → context menu with "Quit" (and optional "Launch at Login" toggle)
- Expand animation: CSS scale + fade, ~200ms

### Card State
- 320×480px rounded card, expandable up to ~600px if tasks overflow
- Style: white background (light mode) / dark slate (dark mode), 16px padding, macOS system font (SF Pro)
- Draggable via header bar only
- Collapse button (↙) in header returns to bubble

**Header:** App name "Floatask" | collapse button (↙) | add-task button (+)

**Task list:**
- Each row: checkbox + task text + delete button (×, visible on hover)
- Incomplete tasks shown first, completed tasks below with strikethrough and muted color
- Scrollable when tasks exceed visible height

### Quick-Add Popup
- Triggered by (+) in the card header
- Inline input slides down below the header (no separate window)
- Enter → adds task; Escape → cancels

### Carry-Over Dialog
- Modal overlay on the card, shown on first open of a new day when incomplete tasks exist
- Message: "You have X incomplete tasks from a previous day. What would you like to do?"
- Buttons: "Keep them" (tasks remain) | "Clear them" (incomplete tasks deleted)
- After either action, `lastOpenedDate` is updated to today

---

## Data & Storage

**File:** `~/Library/Application Support/floatask/tasks.json`

**Schema:**
```json
{
  "lastOpenedDate": "2026-07-14",
  "windowPosition": { "x": 1800, "y": 980 },
  "tasks": [
    {
      "id": "uuid-v4",
      "text": "Buy groceries",
      "completed": false,
      "createdAt": "2026-07-14T09:00:00Z"
    }
  ]
}
```

**Tauri commands:**
| Command | Description |
|---|---|
| `load_tasks` | Returns full file contents on app start |
| `save_tasks` | Writes full task list to disk (called after every mutation) |
| `get_last_opened_date` | Returns `lastOpenedDate` |
| `update_last_opened_date` | Sets `lastOpenedDate` to today |

**Carry-over logic:**
On launch, Rust compares `lastOpenedDate` to today's date. If different and incomplete tasks exist, a flag is returned to the frontend to show the carry-over dialog. "Clear them" removes all incomplete tasks; "Keep them" is a no-op on the task list. Either way, `lastOpenedDate` is updated to today.

---

## Window Behavior & Lifecycle

**Window config (`tauri.conf.json`):**
- `decorations: false`
- `transparent: true`
- `always_on_top: true`
- `activation_policy: "Accessory"` (no dock icon)

**Sizing:**
- Bubble: 56×56px
- Card: 320×480px (max height ~600px)
- Tauri `set_size` called on each state toggle

**Position:**
- Default: bottom-right of primary screen, 24px margin
- Persisted in `tasks.json` under `windowPosition`
- Restored on next launch

**Dragging:**
- Bubble: entire element is `data-tauri-drag-region`
- Card: header bar only is `data-tauri-drag-region`

**App lifecycle:**
- No dock icon, no menu bar icon — bubble is the sole entry point
- "Quit" only accessible via right-click context menu on bubble
- Optional "Launch at Login" via macOS `launchd` plist, toggled from context menu

---

## Out of Scope (v1)

- Cloud sync
- Multiple task lists
- Task due dates or reminders
- Notifications / alerts
- Windows support
