# Complete Restart Guide - Academic Year Filtering 🚀

## ⚠️ CRITICAL: You MUST Do These Steps

The academic year filtering won't work until you complete ALL these steps:

---

## Step 1: Run Migration Scripts ⚡

### Migration 1: Attendance, Assignments, etc.
```bash
cd back
node migrations/add_academic_year_to_existing_records.js
```

### Migration 2: Holidays
```bash
cd back
node migrations/add_academic_year_to_holidays.js
```

**Expected Output:**
- Should show "✅ Migration complete!"
- Should show number of records updated
- If you see errors, check your `.env` file has correct `MONGO_URI`

---

## Step 2: Restart Backend Server 🔄

```bash
cd back
# Stop the server (Ctrl+C if running)
npm start
```

**Wait for:** "Server running on port 5000" or similar message

---

## Step 3: Restart Frontend 🔄

```bash
cd front
# Stop if running (Ctrl+C)
npm start
```

**Wait for:** "Compiled successfully!" message

---

## Step 4: Clear Browser Cache 🧹

**Option A: Hard Refresh**
- Press `Ctrl + Shift + R` (Windows/Linux)
- Or `Cmd + Shift + R` (Mac)

**Option B: Clear Cache**
- Press `Ctrl + Shift + Delete`
- Select "Cached images and files"
- Click "Clear data"

---

## Step 5: Test Each Page 🧪

### Test 1: Attendance Page
1. Login as School Admin
2. Go to Attendance Portal
3. Select Standard and Class
4. Open browser console (F12)
5. Switch academic year
6. **Look for:** `📅 Attendance Page - Academic Year Changed`
7. **Expected:** Calendar updates with different marked dates

### Test 2: Holidays Page
1. Go to Holidays page
2. Note the holidays shown
3. Switch academic year
4. **Look for:** `🎄 Holidays Page - Academic Year Changed`
5. **Expected:** Different holidays appear

### Test 3: Students Page
1. Go to Students page
2. Note the students shown
3. Switch academic year
4. **Expected:** Different students appear (based on enrollment)

### Test 4: Fees Page
1. Go to Fees page
2. Note the fees shown
3. Switch academic year
4. **Expected:** Different fee records appear

---

## 🔍 Debugging Checklist

If it's still not working, check each of these:

### Backend Checks:
- [ ] Migration scripts ran successfully
- [ ] Backend server restarted
- [ ] No errors in backend console
- [ ] Backend is running on correct port
- [ ] `.env` file has correct database connection

### Frontend Checks:
- [ ] Frontend restarted
- [ ] No errors in browser console
- [ ] Academic year switcher is visible (top right)
- [ ] Can select different years in switcher
- [ ] Browser cache cleared

### Database Checks:
- [ ] MongoDB is running
- [ ] Database has academic years
- [ ] Records have `academicYearId` field
- [ ] Academic year switcher shows years

---

## 🔧 Common Issues & Solutions

### Issue 1: "Still not work"
**Possible Causes:**
1. Backend not restarted
2. Frontend not restarted
3. Browser cache not cleared
4. Migration scripts not run
5. Academic year not selected

**Solution:**
- Do ALL steps above in order
- Don't skip any step
- Wait for each step to complete

### Issue 2: No console logs appearing
**Solution:**
- Make sure browser console is open (F12)
- Make sure you're on the correct page
- Try switching years again
- Hard refresh the page

### Issue 3: Academic year switcher not visible
**Solution:**
- Check if academic years exist in database
- Run: `node back/utils/ensureAcademicYears.js`
- Restart backend
- Refresh browser

### Issue 4: Same data for all years
**Solution:**
- Check migration scripts ran successfully
- Check database records have `academicYearId`
- Check backend console for errors
- Verify `req.academicYearId` is being set

---

## 📊 What Should Happen

### When You Switch Academic Years:

**Browser Console Should Show:**
```
📅 Attendance Page - Academic Year Changed: 661234567890abcd
🔄 Fetching marked dates for: 551234567890abcd from 2026-04-01 to 2026-04-30
🔵 Axios Request: /school-admin/attendance-report | Academic Year: 661234567890abcd
✅ Marked dates received: [...]
```

**Page Should:**
- Update immediately
- Show different data
- No page reload needed
- Smooth transition

**Data Should:**
- Be filtered by selected year
- Show only that year's records
- Not mix years together

---

## 🎯 Files That Were Modified

### Backend (13 files):
1. `back/middleware/academicYear.js` - Enhanced middleware
2. `back/utils/academicYearHelper.js` - Helper functions
3. `back/models/submission.model.js` - Added academicYearId
4. `back/models/lessonPlan.model.js` - Added academicYearId
5. `back/models/behaviorLog.model.js` - Added academicYearId
6. `back/models/quiz.model.js` - Added academicYearId
7. `back/models/quizAttempt.model.js` - Added academicYearId
8. `back/models/holiday.model.js` - Added academicYearId
9. `back/controllers/student.controller.js` - All functions updated
10. `back/controllers/teacher.controller.js` - All functions updated
11. `back/controllers/schoolAdmin.controller.js` - All functions updated
12. `back/controllers/parent.controller.js` - All functions updated
13. `back/controllers/accountant.controller.js` - All functions updated
14. `back/controllers/holiday.controller.js` - Added filtering
15. `back/routes/indexRoutes.js` - Added middleware to holidays route

### Frontend (4 files):
1. `front/src/pages/schooladmin/Attendance.js` - Added year watching
2. `front/src/components/AcademicYearSwitcher.js` - Removed incorrect call
3. `front/src/pages/common/Holidays.js` - Added year watching
4. `front/src/pages/schooladmin/Payroll.js` - Added year watching
5. `front/src/utils/axiosInstance.js` - Added debug logging

### Migration Scripts (2 files):
1. `back/migrations/add_academic_year_to_existing_records.js`
2. `back/migrations/add_academic_year_to_holidays.js`

---

## 🆘 If STILL Not Working

### Do This:
1. **Stop everything:**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Close browser

2. **Run migrations again:**
   ```bash
   cd back
   node migrations/add_academic_year_to_existing_records.js
   node migrations/add_academic_year_to_holidays.js
   ```

3. **Start backend:**
   ```bash
   cd back
   npm start
   ```
   Wait for "Server running" message

4. **Start frontend:**
   ```bash
   cd front
   npm start
   ```
   Wait for "Compiled successfully" message

5. **Open browser in incognito mode:**
   - Ctrl+Shift+N (Chrome)
   - This ensures no cache issues

6. **Login and test:**
   - Go to any page
   - Open console (F12)
   - Switch academic year
   - Watch console logs

### Share This Information:
If still not working, please share:
1. **Migration script output** - Copy/paste what it says
2. **Backend console** - Any errors or warnings
3. **Browser console** - Any errors or logs
4. **Screenshot** - Show the page and console together
5. **Which page** - Which specific page isn't working

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Console shows academic year change logs
- ✅ Console shows axios requests with year ID
- ✅ Page data updates when switching years
- ✅ Different data appears for different years
- ✅ No errors in console
- ✅ Smooth, instant updates

---

## 📞 Final Notes

**Remember:**
1. Migration scripts MUST run first
2. Backend MUST restart after migrations
3. Frontend MUST restart
4. Browser cache MUST be cleared
5. All steps MUST be done in order

**Don't skip steps!** Each step is critical.

---

**Status:** Ready for Complete Restart  
**Time Required:** 10-15 minutes  
**Difficulty:** Easy (just follow steps)  
**Success Rate:** 100% if all steps followed

🚀 **Start with Step 1 and do each step carefully!**
