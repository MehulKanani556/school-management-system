# How to Apply the Students List Filter Fix

## The Issue
The students list is not filtering by academic year because the backend route needs to be updated and the server needs to be restarted.

## What Was Changed
✅ Updated route: `/school-admin/students` now includes `academicYear` middleware
✅ Updated controller: `getStudents` now filters by `req.academicYearId`

## Steps to Apply the Fix

### Step 1: Stop the Backend Server
Find and stop your running Node.js server:

**Option A: If running in terminal**
- Press `Ctrl + C` in the terminal where the server is running

**Option B: If running as background process**
```bash
# Find the process
Get-Process node

# Kill it (replace PID with actual process ID)
Stop-Process -Id <PID>
```

**Option C: Kill all Node processes (use with caution)**
```bash
taskkill /F /IM node.exe
```

### Step 2: Start the Backend Server
```bash
cd back
npm start
# or
npm run dev
```

### Step 3: Verify the Server Started
You should see:
```
Server + Socket.IO is running on port 8000
MongoDB connected successfully
```

### Step 4: Test the Fix

1. **Open your browser** and go to the school admin panel
2. **Login** as School Admin
3. **Go to Students page**
4. **Note the current students** (e.g., 50 students)
5. **Switch academic year** using the year switcher (top right)
6. **Watch the students list update** - it should show different students or different counts

### Step 5: Verify It's Working

**Test A: Check Network Tab**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Switch academic year
4. Look for request to `/school-admin/students`
5. Check the request headers - should include:
   ```
   x-academic-year-id: <some-id>
   ```

**Test B: Check Response**
1. In Network tab, click on the `/school-admin/students` request
2. Look at the Response
3. Students should be filtered by the selected year

**Test C: Visual Verification**
1. Switch to 2025-26 academic year
2. Note student count (e.g., 45 students)
3. Switch to 2026-27 academic year
4. Student count should change (e.g., 52 students)
5. Students in different grades should appear

## Troubleshooting

### Problem: Students list still not changing

**Solution 1: Clear Browser Cache**
```
Ctrl + Shift + Delete
Clear cached images and files
```

**Solution 2: Hard Refresh**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

**Solution 3: Check localStorage**
1. Open DevTools (F12)
2. Go to Application tab
3. Click on Local Storage
4. Find `activeAcademicYearId`
5. Verify it changes when you switch years

**Solution 4: Check Server Logs**
Look for:
```
No academic year found for request: /school-admin/students
```
If you see this, the middleware isn't working.

**Solution 5: Verify Route Change**
Check `back/routes/indexRoutes.js` line 67:
```javascript
router.get('/school-admin/students', ...schoolAdmin, sa.getStudents);
```
Should have `...schoolAdmin` (not just `auth, requireRole(...)`)

### Problem: Server won't start

**Check if port is in use:**
```bash
netstat -ano | findstr :8000
```

**Kill process on port 8000:**
```bash
taskkill /F /PID <PID>
```

### Problem: "Cannot find module" error

**Reinstall dependencies:**
```bash
cd back
npm install
```

## Expected Behavior After Fix

### Scenario 1: Current Year (2026-27)
- Shows: All students enrolled in 2026-27
- Count: ~50 students
- Grades: Mix of all grades

### Scenario 2: Previous Year (2025-26)
- Shows: Only students enrolled in 2025-26
- Count: ~45 students (some graduated, some not yet enrolled)
- Grades: Students in their 2025-26 grades

### Scenario 3: Promoted Student
**Student: John Doe**
- In 2025-26: Shows as Grade 9, Section A
- In 2026-27: Shows as Grade 10, Section B
- Correctly shows different grade in each year

## Quick Verification Script

Run this to check if everything is set up correctly:

```bash
# Check if route file has the change
grep -n "school-admin/students.*schoolAdmin" back/routes/indexRoutes.js

# Should output:
# 67:router.get('/school-admin/students', ...schoolAdmin, sa.getStudents);
```

## Files That Were Changed

1. ✅ `back/routes/indexRoutes.js` - Line 67
2. ✅ `back/controllers/schoolAdmin.controller.js` - `getStudents` function

## Summary

The fix is complete in the code. You just need to:
1. **Stop the server** (Ctrl+C or kill process)
2. **Start the server** (`npm start` in back folder)
3. **Refresh browser** (Ctrl+Shift+R)
4. **Test** by switching academic years

The students list should now filter correctly by academic year!

---

**Status**: ✅ Code Fixed - Needs Server Restart  
**Action Required**: Restart backend server  
**Expected Result**: Students list filters by selected academic year
