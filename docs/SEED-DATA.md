# Database seed — realistic school data

Populates **all major collections** with believable Indian school data (names, addresses, announcements, library titles, transport routes in Pune, fees, attendance, marks, etc.).

## Run

```bash
cd back
npm run seed
```

Requires a working `MONGODB_PATH` in `back/.env` (MongoDB Atlas or local).

**Warning:** This clears and re-seeds data for the school `vidya-mandir-pune`. It does **not** remove Super Admin users.

## Default password

All seeded accounts use:

```
Password@123
```

## Login accounts (after seed)

| Role | Email |
|------|--------|
| Super Admin | `superadmin@edumanage.in` |
| School Admin (Principal) | `principal@vidyamandir.edu.in` |
| Accountant | `meera.kulkarni.accountant@vidyamandir.edu.in` |
| Librarian | `sanjay.patil.librarian@vidyamandir.edu.in` |
| Transport Manager | `ganesh.more.transportmanager@vidyamandir.edu.in` |
| Teacher (example) | `*.teacher@vidyamandir.edu.in` (18 teachers) |
| Student (example) | `student.6a.01@vidyamandir.edu.in` |
| Parent | `*.parent@vidyamandir.edu.in` |
| Driver | `*.driver@vidyamandir.edu.in` |

## What gets created

- **School:** Vidya Mandir Senior Secondary School, Baner, Pune
- **3 academic sessions** (previous, current, next year) — each with its own:
  - Student enrollments (class progression: e.g. Class 6 → 7 → 8 across years)
  - Holidays, attendance, fee payments, exams, marks
  - Assignments, quizzes, lesson plans, behavior logs, staff attendance, trip logs
  - Session-specific announcements
- **Classes:** 1–10, sections A & B, **10 students per section** (~200 students)
- **Parents** linked to students
- **18 teachers**, payroll per session months
- **Library:** 10 real book titles (NCERT, R.D. Sharma, etc.) + issue/return records
- **Transport:** 3 routes, vehicles, drivers, GPS-style stops
- **Assignments, submissions, quizzes, timetables, holidays, PTMs**
- **Tickets, notifications, payroll, admissions enquiries, behavior logs**

## Do not use `seed:smart` for demo data

`npm run seed:smart` runs the old generic filler (`smart_seeder.js`) which creates lorem-style placeholder text. Use **`npm run seed`** only for realistic data.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ECONNREFUSED` / DNS | Check internet, Atlas IP whitelist, or use local MongoDB in `.env` |
| Duplicate key | Re-run `npm run seed` (script clears school data first) |
