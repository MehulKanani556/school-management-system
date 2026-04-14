# Testing Guide: Academic Year Filtering

## Quick Test Checklist

### Prerequisites
1. ✅ Backend server running
2. ✅ Frontend server running
3. ✅ At least 2 academic years created
4. ✅ Students enrolled in different years

---

## Test Scenarios

### 1. Create Academic Years

**Steps:**
1. Login as School Admin
2. Navigate to Academic Year Management
3. Create Year 1: "2024-2025" (Mark as Current)
4. Create Year 2: "2025-2026"

**Expected:**
- Both years appear in academic year dropdown
- "2024-2025" shows "Global Active Node" badge

---

### 2. Enroll Students in Different Years

**Steps:**
1. Go to Students page
2. Add Student A to Class 1-A for Year 2024-2025
3. Add Student B to Class 1-A for Year 2025-2026
4. Add Student C to Class 2-B for Year 2024-2025

**Expected:**
- Students created successfully
- Each student linked to specific academic year

---

### 3. Test Student List Filtering (School Admin)

**Steps:**
1. Login as School Admin
2. Go to Students page
3. Select Year "2024-2025" from dropdown
4. Verify only Student A and C appear
5. Switch to Year "2025-2026"
6. Verify only Student B appears

**Expected:**
- ✅ Student list updates automatically
- ✅ Console shows: "👨‍🎓 Students Page - Academic Year Changed: [yearId]"
- ✅ Only students enrolled in selected year appear

---

### 4. Test Class Students Filtering (Teacher)

**Steps:**
1. Login as Teacher assigned to Class 1-A
2. Go to Assigned Classes
3. Click on Class 1-A
4. Select Year "2024-2025" from dropdown
5. Verify only Student A appears
6. Switch to Year "2025-2026"
7. Verify only Student B appears

**Expected:**
- ✅ Class student list updates automatically
- ✅ Console shows: "👥 Class Students - Academic Year Changed: [yearId]"
- ✅ Only students enrolled in selected year appear

---

### 5. Test Attendance Filtering

**Steps:**
1. Login as Teacher
2. Mark attendance for Class 1-A on Date X for Year 2024-2025
3. Switch to Year 2025-2026
4. Check attendance for same date
5. Verify Year 2024-2025 attendance doesn't show

**Expected:**
- ✅ Attendance records isolated by year
- ✅ Console shows: "📅 Attendance Page - Academic Year Changed: [yearId]"
- ✅ No cross-year data leakage

---

### 6. Test Assignment Filtering

**Steps:**
1. Login as Teacher
2. Create Assignment for Class 1-A in Year 2024-2025
3. Switch to Year 2025-2026
4. Verify assignment doesn't appear
5. Switch back to Year 2024-2025
6. Verify assignment reappears

**Expected:**
- ✅ Assignments filter by year
- ✅ Console shows: "📝 Assignments - Academic Year Changed: [yearId]"
- ✅ Data refetches on year change

---

### 7. Test Fee Filtering

**Steps:**
1. Login as School Admin or Accountant
2. Create fee payment for Student A in Year 2024-2025
3. Switch to Year 2025-2026
4. Verify fee payment doesn't appear
5. Switch back to Year 2024-2025
6. Verify fee payment reappears

**Expected:**
- ✅ Fee payments filter by year
- ✅ Console shows: "💰 Fees Page - Academic Year Changed: [yearId]"
- ✅ Fee summary updates correctly

---

### 8. Test Exam & Marks Filtering

**Steps:**
1. Login as Teacher
2. Create exam for Class 1-A in Year 2024-2025
3. Add marks for Student A
4. Switch to Year 2025-2026
5. Verify exam and marks don't appear
6. Switch back to Year 2024-2025
7. Verify exam and marks reappear

**Expected:**
- ✅ Exams filter by year
- ✅ Marks filter by year
- ✅ Data isolated per academic year

---

### 9. Test Roll Number Generation

**Steps:**
1. Login as Teacher
2. Go to Class 1-A students
3. Select Year 2024-2025
4. Click "Sync Roll Sequence"
5. Verify only Student A gets roll number
6. Switch to Year 2025-2026
7. Click "Sync Roll Sequence"
8. Verify only Student B gets roll number

**Expected:**
- ✅ Roll numbers generated only for current year students
- ✅ No cross-year roll number conflicts
- ✅ Sorting works correctly (girls first, then alphabetical)

---

### 10. Test Academic Year Switcher Visibility

**Steps:**
1. Login as School Admin
2. Verify academic year switcher in header
3. Login as Teacher
4. Verify academic year switcher in header
5. Login as Accountant
6. Verify academic year switcher in header

**Expected:**
- ✅ Switcher visible in all layouts
- ✅ Shows current active year
- ✅ Dropdown works smoothly
- ✅ Visual feedback on selection

---

## Console Logging Verification

Open browser console and verify these logs appear when switching years:

```
🔵 Axios Request: /school-admin/students | Academic Year: [yearId]
📚 Assigned Classes - Academic Year Changed: [yearId]
👥 Class Students - Academic Year Changed: [yearId]
📝 Assignments - Academic Year Changed: [yearId]
👨‍🎓 Students Page - Academic Year Changed: [yearId]
📅 Attendance Page - Academic Year Changed: [yearId]
💰 Payroll Page - Academic Year Changed: [yearId]
👥 Staff Attendance - Academic Year Changed: [yearId]
🎄 Holidays Page - Academic Year Changed: [yearId]
```

---

## Edge Cases to Test

### 1. No Academic Year Selected
**Test:** Clear localStorage and reload
**Expected:** System falls back to current year

### 2. Academic Year Deleted
**Test:** Delete selected academic year
**Expected:** System switches to current year

### 3. Multiple Tabs Open
**Test:** Switch year in one tab, check other tab
**Expected:** Other tab updates on next action

### 4. Student Promoted
**Test:** Promote student from Year 1 to Year 2
**Expected:** Student appears in both years with correct enrollment status

### 5. Concurrent Year Data
**Test:** Create data in Year 1, switch to Year 2, create similar data
**Expected:** Data isolated, no conflicts

---

## Performance Testing

### 1. Large Dataset
- Create 1000+ students across 3 years
- Switch between years
- Verify response time < 2 seconds

### 2. Rapid Switching
- Switch years rapidly 10 times
- Verify no race conditions
- Check for memory leaks

### 3. Network Latency
- Throttle network to 3G
- Switch years
- Verify loading states work correctly

---

## Regression Testing

### Pages to Verify Still Work

- [ ] Dashboard (all roles)
- [ ] Student Profile
- [ ] Teacher Profile
- [ ] Class Management
- [ ] Subject Management
- [ ] Timetable Creation
- [ ] Holiday Management
- [ ] Staff Attendance
- [ ] Payroll Generation
- [ ] Reports
- [ ] Notifications
- [ ] Messages
- [ ] Announcements

---

## Bug Reporting Template

If you find issues, report using this format:

```
**Issue:** [Brief description]
**Page:** [Page name and URL]
**Role:** [User role]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Console Errors:** [Any errors in console]
**Academic Year:** [Selected year]
**Browser:** [Browser and version]
```

---

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Data properly isolated by year
✅ Automatic refetching works
✅ Visual indicators clear
✅ Performance acceptable
✅ No data leakage between years

---

## Automated Testing (Future)

Consider adding these automated tests:

```javascript
describe('Academic Year Filtering', () => {
  it('should filter students by enrollment year', async () => {
    // Test implementation
  });

  it('should refetch data when year changes', async () => {
    // Test implementation
  });

  it('should isolate attendance by year', async () => {
    // Test implementation
  });

  it('should generate roll numbers only for current year', async () => {
    // Test implementation
  });
});
```

---

**Happy Testing! 🎉**

If all tests pass, the academic year filtering system is production-ready.
