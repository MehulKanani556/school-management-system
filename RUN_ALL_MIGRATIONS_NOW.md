# 🚀 Run All Migrations - Complete Guide

## Overview

You need to run **3 migration scripts** to add academic year filtering to all records in your database.

---

## ✅ Migration Scripts to Run

### 1. Holidays Migration
**File:** `back/migrations/add_academic_year_to_holidays.js`  
**Purpose:** Adds `academicYearId` to all holiday records

### 2. Other Records Migration
**File:** `back/migrations/add_academic_year_to_existing_records.js`  
**Purpose:** Adds `academicYearId` to submissions, lesson plans, behavior logs, quizzes, quiz attempts

### 3. Staff Attendance Migration (NEW)
**File:** `back/migrations/add_academic_year_to_staff_attendance.js`  
**Purpose:** Adds `academicYearId` to all staff attendance records

---

## 🎯 Run All Migrations Now

### Step 1: Open Terminal and Navigate to Backend
```bash
cd back
```

### Step 2: Run Migration 1 - Holidays
```bash
node migrations/add_academic_year_to_holidays.js
```

**Wait for:**
```
✅ Migration complete!
📊 Total holidays updated: X
✅ All done! Closing connection...
```

---

### Step 3: Run Migration 2 - Other Records
```bash
node migrations/add_academic_year_to_existing_records.js
```

**Wait for:**
```
✅ Migration completed successfully!
🎉 All done! Closing connection...
```

---

### Step 4: Run Migration 3 - Staff Attendance
```bash
node migrations/add_academic_year_to_staff_attendance.js
```

**Wait for:**
```
✅ Migration complete!
📊 Total staff attendance records updated: X
✅ All done! Closing connection...
```

---

## ⚠️ If You Get Connection Error

If you see:
```
❌ MongoDB connection error: The `uri` parameter to `openUri()` must be a string
```

**This means:**
- The `.env` file is not being loaded
- You're running from the wrong directory

**Solution:**
1. Make sure you're in the `back` directory:
   ```bash
   pwd
   # Should show: .../school-management-system/back
   ```

2. Check `.env` file exists:
   ```bash
   ls .env
   # Should show: .env
   ```

3. Verify MONGODB_PATH is set:
   ```bash
   cat .env | grep MONGODB_PATH
   # Should show: MONGODB_PATH=mongodb+srv://...
   ```

4. Run the migration again

---

## 🔄 After All Migrations Complete

### CRITICAL: Restart Both Servers!

### Step 1: Restart Backend
```bash
# In backend terminal, press Ctrl+C to stop the current server
cd back
npm start
```

**Wait for:** `Server running on port 8000`

---

### Step 2: Restart Frontend
```bash
# In frontend terminal, press Ctrl+C to stop the current server
cd front
npm start
```

**Wait for:** `Compiled successfully!`

---

### Step 3: Clear Browser Cache
**Option 1: Hard Refresh (Easiest)**
- Press `Ctrl + Shift + R` (Windows/Linux)
- Or `Cmd + Shift + R` (Mac)
- Do this 3 times

**Option 2: Incognito Mode (Best for Testing)**
- Press `Ctrl + Shift + N` (Windows/Linux)
- Or `Cmd + Shift + N` (Mac)
- Login in incognito window
- Test there

---

## 🧪 Test Everything

### 1. Open Browser Console
Press `F12` to open developer tools

### 2. Login as School Admin

### 3. Test Each Page

#### Test 1: Holidays Page
1. Go to Holidays page
2. Note the holidays shown
3. Switch academic year (dropdown top right)
4. **Expected:** Different holidays appear
5. **Console should show:** `🎄 Holidays Page - Academic Year Changed`

#### Test 2: Attendance Page
1. Go to Attendance page
2. Select Standard and Class
3. Note the calendar
4. Switch academic year
5. **Expected:** Calendar updates with different marked dates
6. **Console should show:** `📅 Attendance Page - Academic Year Changed`

#### Test 3: Staff Attendance Page
1. Go to Staff Attendance page
2. Note the calendar
3. Switch academic year
4. **Expected:** Calendar shows different marked dates
5. **Console should show:** `👥 Staff Attendance - Academic Year Changed`

#### Test 4: Payroll Page
1. Go to Payroll page
2. Note the data shown
3. Switch academic year
4. **Expected:** Page refetches data
5. **Console should show:** `💰 Payroll - Academic Year Changed`

---

## ✅ Success Indicators

You'll know everything is working when:
- ✅ All 3 migrations completed without errors
- ✅ Backend restarted successfully
- ✅ Frontend restarted successfully
- ✅ Console shows emoji logs (📅, 🎄, 💰, 👥, 🔵)
- ✅ Console shows axios requests with academic year IDs
- ✅ Page data updates when switching years
- ✅ Different data appears for different years
- ✅ No errors in console
- ✅ No errors in backend logs

---

## 📊 What Was Fixed - Complete Summary

### Models Updated (Added academicYearId):
1. ✅ `holiday.model.js`
2. ✅ `submission.model.js`
3. ✅ `lessonPlan.model.js`
4. ✅ `behaviorLog.model.js`
5. ✅ `quiz.model.js`
6. ✅ `quizAttempt.model.js`
7. ✅ `staffAttendance.model.js` (NEW)
8. ✅ `attendance.model.js` (already had it)
9. ✅ `mark.model.js` (already had it)

### Controllers Updated (Filter by academicYearId):
1. ✅ `student.controller.js` - All 17 functions
2. ✅ `teacher.controller.js` - All functions
3. ✅ `schoolAdmin.controller.js` - All functions
4. ✅ `parent.controller.js` - All 6 functions
5. ✅ `accountant.controller.js` - 2 functions
6. ✅ `holiday.controller.js` - All functions
7. ✅ `staffAttendance.controller.js` - All 6 functions (NEW)

### Routes Updated (Added academicYear middleware):
1. ✅ `/holidays` routes
2. ✅ `/staff-attendance` routes (NEW)
3. ✅ All other routes already had middleware

### Frontend Updated (Watch for year changes):
1. ✅ `Attendance.js`
2. ✅ `Holidays.js`
3. ✅ `Payroll.js`
4. ✅ `StaffAttendance.js`
5. ✅ `AcademicYearSwitcher.js`
6. ✅ `axiosInstance.js` (adds header)

### Migrations Created:
1. ✅ `add_academic_year_to_holidays.js`
2. ✅ `add_academic_year_to_existing_records.js`
3. ✅ `add_academic_year_to_staff_attendance.js` (NEW)

---

## 🎯 Pages That Now Filter by Academic Year

### ✅ Fully Implemented:
1. ✅ **Students Page** - Filters by enrollment year
2. ✅ **Student Attendance** - Filters by year
3. ✅ **Holidays** - Filters by year
4. ✅ **Fees** - Filters by year
5. ✅ **Marks** - Filters by year
6. ✅ **Exams** - Filters by year
7. ✅ **Assignments** - Filters by year
8. ✅ **Behavior Logs** - Filters by year
9. ✅ **Quizzes** - Filters by year
10. ✅ **Lesson Plans** - Filters by year
11. ✅ **Payroll** - Refetches on year change
12. ✅ **Staff Attendance** - Filters by year ✨ NEW

### ❌ Not Filtered (By Design):
1. ❌ **Teachers** - Shows all teachers
2. ❌ **Staff** - Shows all staff
3. ❌ **Users** - Shows all users
4. ❌ **Settings** - Global configuration

---

## 🆘 Troubleshooting

### Problem 1: Migration Fails
**Error:** Connection error or "uri must be a string"

**Solution:**
1. Check you're in `back` directory: `pwd`
2. Verify `.env` exists: `ls .env`
3. Check MONGODB_PATH: `cat .env | grep MONGODB_PATH`
4. Run migration again

---

### Problem 2: No Console Logs
**Problem:** Switching years doesn't show logs

**Solution:**
1. Restart backend: `cd back && npm start`
2. Restart frontend: `cd front && npm start`
3. Clear cache: `Ctrl + Shift + R` (3 times)
4. Open console: `F12`
5. Try incognito: `Ctrl + Shift + N`

---

### Problem 3: Same Data for All Years
**Problem:** Data doesn't change when switching years

**Solution:**
1. Verify migrations ran successfully
2. Restart BOTH servers
3. Clear browser cache
4. Check console for errors
5. Verify academic year is selected

---

### Problem 4: "Academic year is required" Error
**Problem:** Backend returns 400 error

**Solution:**
1. Check localStorage: `localStorage.getItem('activeAcademicYearId')`
2. Should return an ID string
3. If null, select academic year from dropdown
4. Verify axios interceptor is working (check console)

---

## 📋 Quick Command Reference

```bash
# Run all migrations
cd back
node migrations/add_academic_year_to_holidays.js
node migrations/add_academic_year_to_existing_records.js
node migrations/add_academic_year_to_staff_attendance.js

# Restart backend
cd back
npm start

# Restart frontend (in new terminal)
cd front
npm start

# Check servers
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

---

## 🎉 You're Done!

After completing all steps:
- ✅ All migrations run successfully
- ✅ Both servers restarted
- ✅ Browser cache cleared
- ✅ Academic year filtering works on all pages
- ✅ Console logs confirm everything is working
- ✅ No errors anywhere

**Congratulations! Your school management system now has complete academic year filtering! 🎊**

---

**Status:** ✅ Ready to Execute  
**Time Required:** 15 minutes  
**Difficulty:** Easy

🚀 **Start with Step 1 above!**
