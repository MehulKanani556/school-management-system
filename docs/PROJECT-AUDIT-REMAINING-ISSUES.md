# School Management System — Full Project Audit

**Audit date:** May 2026  
**Scope:** Entire repository (`front/`, `back/`, `demomodel/`, `docs/`)  
**Stack:** React + Redux + Express + MongoDB + Socket.IO

> **Note:** `docs/broken-flows-report.html` (March 2026) claims 28 bugs were fixed and **0 open**. This document is a **fresh, broader audit**.
>
> **May 2026 fix passes (completed):** Librarian messages, StudentDetail route, transport fees + bulk assign, ticket notifications (admin + user reply), auth rate limit + 2FA login, Cashfree/SMS stubs, S3/local uploads, parent library API + UI, driver LiveMap, e-learning PDF viewer, question types API, JSON backups with download, duplicate route removed, orphan StaffRegistry deleted. **Build + tests pass.** Remaining items are platform-scale (full mongodump, push notifications, i18n, E2E suite) — see §3.

---

## Executive summary

| Category | Status (May 2026) |
|----------|-------------------|
| Broken flows from audit §1 | **Fixed** (tests, backups, librarian messages, routes) |
| Stub UI (§2) | **Fixed** (driver map, PDF viewer, backups label) |
| Orphan code | **StaffRegistry removed** |
| Platform features (§3) | **Open** (mongodump/S3, push, i18n, E2E) |
| Partial logic (§4) | **Mostly fixed** (transport fees, 2FA, SMS hook, audit level) |

**Build status:** `npm run build` — OK  
**Tests:** `npm test` — OK  
**Backend:** `require('./routes/indexRoutes')` — OK

---

## Table of contents

1. [Broken code & failing flows](#1-broken-code--failing-flows)
2. [Incomplete / stub UI](#2-incomplete--stub-ui)
3. [Remaining functionality (not implemented)](#3-remaining-functionality-not-implemented)
4. [Remaining logic (partial implementation)](#4-remaining-logic-partial-implementation)
5. [Dead code & orphans](#5-dead-code--orphans)
6. [Security & configuration issues](#6-security--configuration-issues)
7. [Module matrix by role](#7-module-matrix-by-role)
8. [Previously fixed issues (March 2026)](#8-previously-fixed-issues-march-2026)
9. [Recommended fix priority](#9-recommended-fix-priority)
10. [File reference index](#10-file-reference-index)

---

## 1. Broken code & failing flows

### 1.1 Failing unit test (CRA default)

| File | Issue |
|------|--------|
| `front/src/App.test.js` | Expects text `"learn react"` — not present in app. **`npm test` will fail.** |

```javascript
// Current (broken):
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

**Fix:** Replace with smoke test (e.g. render app inside Provider/Router mock) or remove test.

---

### 1.2 Super Admin backup download (404)

| File | Issue |
|------|--------|
| `back/controllers/superAdmin.controller.js` | Sets `downloadUrl: '/system-backups/sa-backup-{id}.tar.gz'` |
| `back/server.js` | No `express.static` or route for `/system-backups` |

**User impact:** Clicking download in `front/src/pages/superadmin/Backups.js` opens a URL that does not exist.

---

### 1.3 Librarian messaging (non-functional)

| File | Issue |
|------|--------|
| `front/src/pages/Librarian/LibrarianMessages.js` | No API calls, no Redux, no socket. Hardcoded UI only. |

**User impact:** Librarian cannot send or receive real messages from this page.

---

### 1.4 School Admin rich student page unreachable

| File | Issue |
|------|--------|
| `front/src/pages/schooladmin/StudentDetail.js` | Full implementation exists |
| `front/src/App.js` | Imports `StudentDetail` but route uses `ProfileDetail` |

```text
Route: /school-admin/students/:id  →  <ProfileDetail />  (not StudentDetail)
```

**User impact:** Dedicated student admin view (tabs, report card integration via schoolAdmin slice) is never shown.

---

### 1.5 Online fee payment without Cashfree env

| File | Issue |
|------|--------|
| `back/controllers/parent.controller.js` | `cashfree.XClientId = process.env.CASHFREE_APP_ID` (no fallback) |
| `front/src/pages/Parent/ChildFees.js` | Uses `@cashfreepayments/cashfree-js` |

**User impact:** Payment init fails if `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY` missing in environment.

---

### 1.6 Misleading UI (not runtime errors, but wrong behavior)

| File | Issue |
|------|--------|
| `front/src/pages/Transporter/Profile.js` | Shows Two-Factor Authentication as **"ENABLED"** statically |
| `front/src/pages/superadmin/Backups.js` | Shows **"3/3 Clusters"**, **"Mirror Sync Active"** — hardcoded, not from API |
| `front/src/pages/superadmin/Security.js` | **"Threat level: LOW"** — hardcoded |

---

## 2. Incomplete / stub UI

### Librarian Messages (`front/src/pages/Librarian/LibrarianMessages.js`)

- Contact list: `[1, 2, 3].map` with fake names (Admin Office, Principal, Faculty Sub-node)
- Messages: static placeholder text
- Search input: no `onChange` / filter
- Send button: no `onClick` handler
- **Backend available:** `/my-messages` (GET/POST) used by Accountant — not wired for Librarian

### Super Admin Backups (`front/src/pages/superadmin/Backups.js` + backend)

- UI calls real API (`fetchBackups`, `triggerBackup`)
- Backend **simulates** backup after 5 seconds:
  - Random `fileSizeMB`
  - Random `checksum`
  - Fake `downloadUrl`
- No MongoDB dump, no S3 upload, no file on disk

---

## 3. Remaining functionality (not implemented)

| # | Feature | Evidence | Notes |
|---|---------|----------|-------|
| 1 | **SMS notifications** | `SMS_GATEWAY_ACTIVE` in `back/seed_settings.js`, `SystemSettings.js` | No `sendSms` or gateway integration in controllers |
| 2 | **Subdomain multi-tenant routing** | `SUBDOMAIN_MAPPING` setting, `school.subdomain` field | No host-based routing; schools not isolated by subdomain in app |
| 3 | **Real system backups** | `superAdmin.controller.js` `triggerSystemBackup` | Simulated only |
| 4 | **Two-factor authentication** | `TWO_FACTOR_AUTH` in settings | Not checked in `back/auth/auth.js` |
| 5 | **API rate limiting** | — | No `express-rate-limit` or equivalent |
| 6 | **Automated test suite** | Only `App.test.js` (broken) + `setupTests.js` | No integration/E2E tests |
| 7 | **In-app PDF e-book reader** | `Student/ELearning.js` | Opens `fileUrl` in new tab only |
| 8 | **Ticket reply notifications (DB)** | `ticket.controller.js` | Socket + toast only; no `Notification` model entry for offline users |
| 9 | **Push notifications (mobile/web push)** | — | Not implemented |
| 10 | **i18n / localization** | — | English-only UI |
| 11 | **`demomodel/` tenant architecture** | `demomodel/*.js` | Unused; production uses `back/models/` with `schoolId` |

---

## 4. Remaining logic (partial implementation)

### 4.1 Academic year filtering (gaps)

**Middleware:** `back/middleware/academicYear.js`  
**Applied on:** ~13 route groups in `back/routes/indexRoutes.js` (school admin, teacher, student, parent, accountant subsets)

**Controllers WITH academic year helpers:**

- `student.controller.js`
- `teacher.controller.js`
- `schoolAdmin.controller.js`
- `parent.controller.js`
- `accountant.controller.js`
- `timetable.controller.js`
- `holiday.controller.js`
- `staffAttendance.controller.js`

**Controllers WITHOUT proper year scoping:**

| Controller | Risk |
|------------|------|
| `transport.controller.js` | Transport fees, student assignment may not respect selected academic year |
| `librarian.controller.js` | Limited; fee strings only in some paths |
| `driver.controller.js` | No `req.academicYearId` usage |
| `superAdmin.controller.js` | Platform-wide (expected) |

**Reference:** `back/utils/updateControllersForAcademicYear.js` — manual migration checklist; may not be fully applied everywhere.

**Middleware behavior when no year found:** Logs warning, sets `req.academicYearId = null`, continues — controllers must handle null.

---

### 4.2 Parent Cashfree payment

| Item | Location | Issue |
|------|----------|-------|
| Phone fallback | `parent.controller.js` | `customer_phone: req.user.phone \|\| req.user.contact \|\| "9999999999"` — invalid for production KYC |
| Order ID parsing | `verifyFeePayment` | Was fragile; reported fixed with `parts.slice(1, -1).join('-')` — verify in production |
| Environment | `back/.env` | Test credentials present — must use production keys in prod |

---

### 4.3 Ticket system

| Item | Status |
|------|--------|
| Create ticket | OK — `POST /tickets` |
| School admin / teacher / parent tickets UI | OK — `SupportTickets.js` |
| Super admin reply | OK — `replyToTicket` + socket |
| Persisted in-app notification for reply | **Missing** — socket event `TICKET_REPLY` only |
| Duplicate route registration | `indexRoutes.js` — `/superadmin/messages/:recipientId` registered twice |

---

### 4.4 Fee payment model hooks

| File | Notes |
|------|-------|
| `back/models/feePayment.model.js` | `pre('save')` recalculates `totalAmount`; `pre('findOneAndUpdate')` recalculates status; `post('save')` syncs school revenue aggregate |
| Accountant `collectFee` | Revenue double-count via `$inc` reported **fixed** — revenue only via post-save hook |

---

### 4.5 Dead endpoint in student controller

| Function | File | Mounted? |
|----------|------|----------|
| `getTimetable` | `student.controller.js` | **No** — dead code |
| `getStudentTimetable` | `timetable.controller.js` | **Yes** — `GET /student/timetable` |

---

### 4.6 Registration & maintenance

| Setting | Enforced in |
|---------|-------------|
| `GLOBAL_REGISTRATION` | `back/auth/auth.js` — blocks public signup when false |
| `MAINTENANCE_MODE` | `back/middleware/maintenance.js` |
| `AUTO_LOCK_ACCOUNTS` | `back/auth/auth.js` — failed login lockout |

---

### 4.7 Home route fallback

| File | Behavior |
|------|----------|
| `front/src/App.js` `HomeRedirect` | Redirects known roles to dashboards |
| Unknown / edge role | Renders `<Home />` → generic `Dashboard.js` |

---

## 5. Dead code & orphans

| Item | Path | Notes |
|------|------|-------|
| Unused page import | `App.js` imports `StudentDetail` | Never used in routes |
| Unused student API | `student.controller.js` → `getTimetable` | Superseded by timetable controller |
| Demo models folder | `demomodel/` | 10+ models with `tenantId`; app uses `back/models/` |
| Commented lazy imports | `App.js` lines ~153-154 | Old AcademicYears/Admissions comments |
| CRA README | `front/README.md` | Default Create React App text, not project-specific |
| Project root README | — | **Missing** |

---

## 6. Security & configuration issues

| # | Issue | Location | Recommendation |
|---|-------|----------|----------------|
| 1 | Test Cashfree secrets in repo | `back/.env` | Add `.env` to `.gitignore`; use env vars in deployment only |
| 2 | Simulated backups look real | Super admin UI | Label as demo or implement real backups |
| 3 | GPS endpoint | `back/routes/gps.routes.js` | API key auth reported added — rotate keys per vehicle |
| 4 | No rate limiting | Express app | Add rate limit on auth routes |
| 5 | JWT in localStorage | Redux persist | Standard SPA risk — document XSS hygiene |
| 6 | Console logs in production paths | Various controllers, `SocketContext.jsx` | Remove or gate behind `NODE_ENV` |

---

## 7. Module matrix by role

| Module | Super Admin | School Admin | Teacher | Student | Parent | Accountant | Librarian | Transport | Driver |
|--------|:-----------:|:------------:|:-------:|:-------:|:------:|:----------:|:---------:|:---------:|:------:|
| Auth / OTP | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Students / classes | ✓ | ✓ | partial | self | child | list | — | assign | — |
| Attendance | — | ✓ | ✓ | ✓ | child | — | — | drivers | self |
| Marks / exams | — | ✓ | ✓ | ✓ | child | — | — | — | — |
| Fees / payroll | revenue | ✓ | view | ✓ | pay | ✓ | — | fee | — |
| Library | — | manage | — | ✓ | — | — | ✓ | — | — |
| Transport / GPS | — | manage | — | ✓ | ✓ | — | — | ✓ | ✓ |
| Messaging | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **STUB** | ✓ | ✓ |
| Tickets | ✓ | ✓ | ✓ | — | ✓ | — | — | — | — |
| Quizzes / e-learning | — | — | manage | ✓ | — | — | — | — | — |
| Backups | **simulated** | — | — | — | — | — | — | — | — |
| Academic years | — | ✓ | filter | filter | — | partial | — | **gap** | — |
| Admissions | — | ✓ | — | — | — | — | — | — | — |
| Reports / PDF | ✓ | ✓ | ✓ | — | PDF | ✓ | — | analytics | — |

**Legend:** ✓ = implemented · partial = limited · STUB = UI only · gap = logic incomplete

---

## 8. Previously fixed issues (March 2026)

From `docs/broken-flows-report.html` — verified in codebase where noted:

### Broken flows (9) — fixed

| # | Issue | File |
|---|-------|------|
| 1 | Student attendance `records[0]` wrong student | `student.controller.js` — now uses `records.find()` |
| 2 | Duplicate `sendMessage` export | `teacher.controller.js` |
| 3 | `receiver` vs `recipient` in messages | `teacher.controller.js` |
| 4 | Parent timetable schema mismatch | `parent.controller.js` + `ChildTimetable.js` |
| 5 | Transport role `'Transporter'` → `'Transport_Manager'` | `parent.controller.js` |
| 6 | Report card PDF field names | `parent.controller.js` |
| 7 | Transport analytics `isDeleted` → `deletedAt` | `transport.controller.js` |
| 8 | Bulk attendance `standardId` not set | `teacher.controller.js` |
| 9 | Accountant controller truncated / syntax error | `accountant.controller.js` |

### Incomplete flows (8) — fixed

| # | Issue |
|---|-------|
| 1 | E-Learning archive / stream handler |
| 2 | Cashfree hardcoded credentials removed |
| 3 | Fee payment `feeId` extraction |
| 4 | Teacher `getStudentDetail` uses `Mark` model |
| 5 | FeePayment hook clarified |
| 6 | Financial report payroll trends |
| 7 | Payroll notification uses `teacher.userId` |
| 8 | Student timetable uses `getStudentTimetable` route |

### Missing features (6) — fixed

| # | Issue |
|---|-------|
| 1 | GPS API key validation |
| 2 | Support ticket reply delivery (socket + stored replies) |
| 3 | School admin ticket routes |
| 4 | E-book open via `fileUrl` |
| 5 | Attendance search filter |
| 6 | Certificate hub download button |

### Logic bugs (5) — fixed

| # | Issue |
|---|-------|
| 1 | Fee revenue double-counting |
| 2 | Quiz score points vs count |
| 3 | Transport fee duplicate upsert |
| 4 | Notification enum `'Payroll'` |
| 5 | Notification enum `'Transport'` |

---

## 9. Recommended fix priority

### P0 — User-facing broken

1. Wire `LibrarianMessages.js` to `/my-messages` API (copy pattern from `AccountantMessages.js`)
2. Route `/school-admin/students/:id` to `StudentDetail` OR remove orphan file
3. Fix or remove `App.test.js`
4. Backup: implement real files OR show "Simulation mode" in UI

### P1 — Data correctness

5. Academic year filters on `transport.controller.js` (fees, assignments)
6. Remove fake backup `downloadUrl` or serve real files
7. Cashfree: validate env on startup; remove test keys from repo

### P2 — Platform completeness

8. SMS gateway implementation or remove setting
9. 2FA implementation or remove UI/settings
10. Subdomain routing or remove `SUBDOMAIN_MAPPING` setting
11. Ticket → `Notification` model on reply
12. Delete or archive `demomodel/` folder

### P3 — Quality

13. Add README at project root
14. Add integration tests for auth, fees, attendance
15. Rate limiting on `/login`, `/forgot-password`
16. Remove debug `console.log` in production

---

## 10. File reference index

### Frontend — pages to review

```
front/src/pages/Librarian/LibrarianMessages.js     # STUB
front/src/pages/schooladmin/StudentDetail.js       # ORPHAN (not routed)
front/src/pages/superadmin/Backups.js              # Simulated backend
front/src/pages/superadmin/Security.js             # Hardcoded threat level
front/src/pages/Transporter/Profile.js             # Fake 2FA enabled
front/src/pages/Parent/ChildFees.js                # Cashfree dependent
front/src/App.test.js                              # Broken test
front/src/App.js                                   # StudentDetail import unused
```

### Backend — controllers / routes

```
back/controllers/superAdmin.controller.js          # Simulated backup
back/controllers/student.controller.js             # Dead getTimetable
back/controllers/transport.controller.js           # No academic year filter
back/controllers/parent.controller.js              # Cashfree, payments
back/controllers/ticket.controller.js              # Socket only, no Notification
back/routes/indexRoutes.js                         # Duplicate superadmin messages route
back/middleware/academicYear.js
back/utils/updateControllersForAcademicYear.js     # Migration checklist
back/.env                                          # Secrets risk
```

### Documentation

```
docs/broken-flows-report.html                      # Prior fix log (28 fixed)
docs/school-management-system-flow.html            # Feature flow reference
docs/system-architecture-chart.html
docs/PROJECT-AUDIT-REMAINING-ISSUES.md             # This file
```

### Unused / legacy

```
demomodel/                                         # Not used by running app
```

---

## Changelog for this audit file

| Date | Action |
|------|--------|
| May 2026 | Initial comprehensive audit document created |

---

**HTML version:** [PROJECT-AUDIT-REMAINING-ISSUES.html](./PROJECT-AUDIT-REMAINING-ISSUES.html) — open in browser → Print → Save as PDF.
