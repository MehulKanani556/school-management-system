# School Management System

Multi-role school operations platform: React frontend, Express/MongoDB backend, Socket.IO real-time.

## Roles

Super Admin, School Admin, Teacher, Student, Parent, Accountant, Librarian, Transport Manager, Driver

## Seed realistic demo data

```bash
cd back
npm run seed
```

See [docs/SEED-DATA.md](docs/SEED-DATA.md) for login emails and password (`Password@123`).

## Quick start

```bash
# Backend
cd back
cp .env.example .env   # create from your template if present
npm install
npm start

# Frontend (separate terminal)
cd front
npm install
npm start
```

## Required environment (backend)

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` or `MONGODB_URI` | MongoDB connection |
| `JWT_SECRET` | Auth tokens |
| `CLIENT_URL` | CORS / payment return URL (e.g. `http://localhost:3000`) |
| `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY` | Parent online fees (optional) |

## Documentation

- [docs/PROJECT-AUDIT-REMAINING-ISSUES.html](docs/PROJECT-AUDIT-REMAINING-ISSUES.html) — audit report
- [docs/school-management-system-flow.html](docs/school-management-system-flow.html) — feature flows
- [docs/broken-flows-report.html](docs/broken-flows-report.html) — March 2026 fix log

## Notes

- Super Admin **backups** are simulation-only until mongodump/S3 is wired.
- **SMS**, **2FA**, and **subdomain routing** settings exist but are not fully implemented.
- `demomodel/` is legacy schema reference — not used at runtime.
