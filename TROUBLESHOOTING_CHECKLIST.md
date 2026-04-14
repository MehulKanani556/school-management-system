# Troubleshooting Checklist - Academic Year Not Working

## ⚠️ CRITICAL: Have You Done These?

Please check each item carefully:

---

## ✅ Step 1: Migration Scripts (DONE ✅)
- [x] Ran `add_academic_year_to_holidays.js` - 17 holidays updated
- [x] Ran `add_academic_year_to_existing_records.js` - Completed

---

## ❓ Step 2: Backend Server Restart

**Did you restart the backend server AFTER running migrations?**

### To Restart Backend:
1. Go to the terminal running the backend
2. Press `Ctrl + C` to stop it
3. Run: `npm start`
4. Wait for "Server running on port 8000"

### How to Check if Backend Restarted:
- Look at backend terminal
- Should show recent timestamp
- Should say "Server running on port 8000"

**If you didn't restart backend, the new code is NOT loaded!**

---

## ❓ Step 3: Frontend Restart

**Did you restart the frontend AFTER the backend restart?**

### To Restart Frontend:
1. Go to the terminal running the frontend
2. Press `Ctrl + C` to stop it
3. Run: `npm start`
4. Wait for "Compiled successfully!"

### How to Check if Frontend Restarted:
- Look at frontend terminal
- Should show recent timestamp
- Should say "webpack compiled successfully"

**If you didn't restart frontend, the new code is NOT loaded!**

---

## ❓ Step 4: Browser Cache Clear

**Did you clear your browser cache?**

### Option 1: Hard Refresh (Easiest)
- Press `Ctrl + Shift + R` (Windows/Linux)
- Or `Cmd + Shift + R` (Mac)
- Do this 2-3 times

### Option 2: Clear Cache
- Press `Ctrl + Shift + Delete`
- Select "Cached images and files"
- Click "Clear data"

### Option 3: Incognito Mode (Best for Testing)
- Press `Ctrl + Shift + N`
- Login in incognito window
- Test there

**If you didn't clear cache, browser is using OLD JavaScript!**

---

## ❓ Step 5: Console Check

**Did you open the browser console?**

### To Open Console:
- Press `F12`
- Or right-click → "Inspect" → "Console" tab

### What to Look For:
When you switch academic year, you should see:
```
👥 Staff Attendance - Academic Year Changed: [some-id]
🔵 Axios Request: /school-admin/staff-for-attendance | Academic Year: [some-id]
```

**If you don't see these logs, the code is not running!**

---

## 🔍 Diagnostic Steps

### Test 1: Check if Code is Loaded
1. Open browser console (F12)
2. Go to Staff Attendance page
3. Type: `localStorage.getItem('activeAcademicYearId')`
4. Press Enter
5. **Should show:** A long ID string
6. **If null:** Academic year not selected

### Test 2: Check if Year Switcher Works
1. Look at top right corner
2. Should see academic year dropdown
3. Click it
4. Should show list of years
5. Select a different year
6. **Should see:** Console logs appear

### Test 3: Check Backend is Running
1. Open new browser tab
2. Go to: `http://localhost:8000`
3. **Should see:** Some response (not "can't connect")
4. **If error:** Backend not running

### Test 4: Check Frontend is Running
1. Look at the page
2. **Should see:** School management interface
3. **If blank/error:** Frontend not running

---

## 🚨 Common Mistakes

### Mistake 1: Didn't Restart Servers
**Problem:** Code changes not loaded
**Solution:** Restart BOTH backend and frontend

### Mistake 2: Restarted Only One Server
**Problem:** Only half the code is updated
**Solution:** Restart BOTH servers

### Mistake 3: Didn't Clear Cache
**Problem:** Browser using old JavaScript
**Solution:** Hard refresh (Ctrl+Shift+R) or use incognito

### Mistake 4: Didn't Wait for Restart
**Problem:** Servers still starting up
**Solution:** Wait for "Server running" and "Compiled successfully"

### Mistake 5: Console Not Open
**Problem:** Can't see if it's working
**Solution:** Press F12 to open console

---

## 📋 Complete Restart Procedure

**Do these steps IN ORDER:**

### 1. Stop Everything
```bash
# In backend terminal: Ctrl+C
# In frontend terminal: Ctrl+C
# Close browser
```

### 2. Start Backend
```bash
cd back
npm start
# Wait for "Server running on port 8000"
```

### 3. Start Frontend
```bash
cd front
npm start
# Wait for "Compiled successfully!"
```

### 4. Open Browser Fresh
- Open browser in incognito mode (Ctrl+Shift+N)
- Or clear cache first (Ctrl+Shift+Delete)

### 5. Login and Test
- Login as School Admin
- Open console (F12)
- Go to Staff Attendance page
- Switch academic year
- Watch console for logs

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Console shows: `👥 Staff Attendance - Academic Year Changed`
- ✅ Console shows: `🔵 Axios Request: ... | Academic Year: ...`
- ✅ No errors in console
- ✅ Page updates when switching years

---

## 🆘 Still Not Working?

If you've done ALL the steps above and it still doesn't work:

### Share This Information:

1. **Backend Terminal Output:**
   ```
   Copy/paste the last 20 lines from backend terminal
   ```

2. **Frontend Terminal Output:**
   ```
   Copy/paste the last 20 lines from frontend terminal
   ```

3. **Browser Console:**
   ```
   Press F12, switch year, copy/paste ALL console output
   ```

4. **Screenshot:**
   - Show the page with console open
   - Show what happens when you switch years

5. **Confirm These:**
   - [ ] Backend restarted? (Yes/No)
   - [ ] Frontend restarted? (Yes/No)
   - [ ] Browser cache cleared? (Yes/No)
   - [ ] Console open? (Yes/No)
   - [ ] Can see academic year dropdown? (Yes/No)

---

## 🎯 Most Likely Issue

**90% of the time, the issue is:**
1. Servers not restarted
2. Browser cache not cleared
3. Console not open to see logs

**Solution:**
1. Stop both servers (Ctrl+C)
2. Start backend: `cd back && npm start`
3. Start frontend: `cd front && npm start`
4. Open browser in incognito mode
5. Login and test with console open (F12)

---

**Please go through this checklist carefully and confirm each step!**
