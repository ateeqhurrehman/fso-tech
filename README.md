# MTS FSO - Field Technician (v3.5 demo)

iPad-first technician PWA prototype implementing the v3.5 user stories
(`USER-STORIES-MTS-FSO-v3_5-TECH`). Mock IndexedDB seeded with demo work
orders across all statuses (Upcoming, Live Job, Completed, Rejected, Withdrawn).

## Run

```
npm install
npm run dev
```

Then open `http://localhost:5174` — best viewed at iPad resolution (1024×768
or 1180×820).

## Stack

- React 18 + Vite + TypeScript
- React Router v6
- Zustand store, persisted to IndexedDB via `idb`
- CSS Modules + CSS variables (MTS red `#C8102E`, dark-mode toggle)
- `signature_pad` for customer signature capture

## Implemented

| Story | Coverage |
| --- | --- |
| US-FIELD-001 | 4-section home (Upcoming / Live Job / Completed / Withdrawn) with filters |
| US-FIELD-002 | Accepted (vehicle details, ETA locked at Accept Job, SLA ack) → En Route driver-safe view → Service Started |
| US-FIELD-003 | Service Tasks (read-only line items, tire detail fields), service notes |
| US-FIELD-004 | Post-service photos/notes/documents, customer signature at Service Completed, Leave Site |
| US-FIELD-005 | Left_Site Review screen with inline edits, Complete Job, image-only edit lock, rejection-resubmission loop |
| US-FIELD-006 | 48×48 touch targets, high contrast, dark mode toggle |
| US-FIELD-007 | "Call dispatcher" affordance + notification-then-manual-refresh pattern |
| US-FIELD-009 | Profile (read-only) |
| US-FIELD-010 | Comments timeline (latest-only display per Gap G) |
| US-SYS-001..004 | Notification stub, offline indicator, sync trigger |

## Mock data

Seeded on first load — clear via the **Profile → Reset Demo Data** action.
