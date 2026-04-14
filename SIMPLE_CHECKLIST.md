# ✅ Simple Checklist - Fix Academic Year Filtering

## Do These Steps IN ORDER:

### ☐ Step 1: Run Migrations
```bash
cd back
node migrations/add_academic_year_to_holidays.js
node migrations/add_academic_year_to_existing_records.js
node migrations/add_academic_year_to_staff_attendance.js
```

**Wait for each to show:** `✅ All done! Closing connection...`

---

### ☐ Step 2: Restart Backend
```bash
cd back
# Press Ctrl+C to stop current server
npm start
```

**Wait for:** `Server running on port 8000`

---

### ☐ Step 3: Restart Frontend
```bash
cd front
# Press Ctrl+C to stop current server
npm start
```

**Wait for:** `Compiled successfully!`

---

### ☐ Step 4: Clear Browser Cache
- Press `Ctrl + Shift + R` three times
- Or open incognito: `Ctrl + Shift + N`

---

### ☐ Step 5: Test It
1. Press `F12` to open console
2. Login as School Admin
3. Go to Staff Attendance page
4. Switch academic year (dropdown top right)
5. Watch console for logs

**Should see:**
```
👥 Staff Attendance - Academic Year Changed: [id]
🔵 Axios Request: /staff-attendance/list | Academic Year: [id]
```

---

## ✅ Done!

If you see the console logs and the calendar updates, **it's working!**

---

## 🆘 If Not Working

1. Did all 3 migrations complete? (Check for errors)
2. Did you restart backend? (Check terminal timestamp)
3. Did you restart frontend? (Check terminal timestamp)
4. Did you clear cache? (Try incognito mode)
5. Is console open? (Press F12)

**If still not working, share:**
- Migration output
- Backend console output
- Frontend console output
- Browser console output (F12)

---

**That's it! Just 5 steps.** 🚀
