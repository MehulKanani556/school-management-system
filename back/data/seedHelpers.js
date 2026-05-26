const bcrypt = require('bcrypt');
const { fakerEN_IN: faker } = require('@faker-js/faker');

const MALE_FIRST = ['Arjun', 'Rohan', 'Vikram', 'Aditya', 'Karan', 'Dev', 'Aarav', 'Kabir', 'Nikhil', 'Siddharth', 'Yash', 'Harsh', 'Om', 'Pranav', 'Rahul'];
const FEMALE_FIRST = ['Priya', 'Ananya', 'Isha', 'Neha', 'Kavya', 'Sneha', 'Diya', 'Riya', 'Aisha', 'Pooja', 'Shruti', 'Tanvi', 'Myra', 'Aditi', 'Nandini'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Desai', 'Joshi', 'Kulkarni', 'Mehta', 'Reddy', 'Iyer', 'Nair', 'Gupta', 'Verma', 'Rao', 'Pillai', 'Chavan'];

const TEACHER_SUBJECTS = {
  Mathematics: ['M.Sc Mathematics', 'B.Ed'],
  Science: ['M.Sc Physics', 'B.Ed'],
  English: ['M.A English Literature', 'B.Ed'],
  Hindi: ['M.A Hindi', 'B.Ed'],
  'Social Studies': ['M.A History', 'B.Ed'],
  'Computer Science': ['MCA', 'B.Ed'],
  'Physical Education': ['B.P.Ed'],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function indianPhone() {
  const prefixes = ['98', '97', '96', '95', '94', '93', '91', '90', '89', '88', '87', '86', '85', '84', '83', '82', '81', '80', '79', '78', '77', '76', '75', '74', '73', '72', '70'];
  return pick(prefixes) + faker.string.numeric(8);
}

function personName(gender) {
  const first = gender === 'female' ? pick(FEMALE_FIRST) : pick(MALE_FIRST);
  const last = pick(LAST_NAMES);
  return { firstName: first, lastName: last, gender: gender || pick(['male', 'female']) };
}

function schoolEmail(firstName, lastName, role, domain, index = 0) {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z.]/g, '');
  const suffix = index ? `.${index}` : '';
  const roleTag = role ? `.${role.toLowerCase().replace(/_/g, '')}` : '';
  return `${base}${suffix}${roleTag}@${domain}`;
}

function avatarUrl(firstName, lastName) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName}+${lastName}`)}&background=0D8ABC&color=fff&size=128`;
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

function puneAddress() {
  const areas = ['Baner', 'Aundh', 'Kothrud', 'Viman Nagar', 'Kalyani Nagar', 'Hadapsar', 'Wakad', 'Hinjewadi'];
  const area = pick(areas);
  return `${faker.location.buildingNumber()}, ${faker.location.street()}, ${area}, Pune, Maharashtra 4110${faker.number.int({ min: 1, max: 9 })}`;
}

function schoolDaysInRange(start, end, count) {
  const days = [];
  const d = new Date(start);
  while (d <= end && days.length < count) {
    const day = d.getDay();
    if (day !== 0) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function periodTimes() {
  return [
    { start: '08:00', end: '08:45' },
    { start: '08:45', end: '09:00', type: 'Short Break' },
    { start: '09:00', end: '09:45' },
    { start: '09:45', end: '10:30' },
    { start: '10:30', end: '10:45', type: 'Short Break' },
    { start: '10:45', end: '11:30' },
    { start: '11:30', end: '12:15' },
    { start: '12:15', end: '13:00', type: 'Long Break' },
    { start: '13:00', end: '13:45' },
    { start: '13:45', end: '14:30' },
    { start: '14:30', end: '15:15' },
  ];
}

function marksForStudent(level) {
  const base = 55 + level * 2;
  return Math.min(98, Math.max(32, base + faker.number.int({ min: -12, max: 18 })));
}

/** Class level for a student in academic year slot: 0=previous, 1=current, 2=next */
function enrollmentLevel(baseLevel, yearIndex) {
  // yearIndex: 0 = previous year, 1 = current year, 2 = next year
  // baseLevel: student's grade in current year (yearIndex 1)
  
  if (yearIndex === 0) {
    // Previous year: student was in lower grade (or didn't exist yet)
    const prevLevel = baseLevel - 1;
    if (prevLevel < 1) return null; // Student didn't exist yet
    return prevLevel;
  }
  if (yearIndex === 1) return baseLevel; // Current year
  return Math.min(12, baseLevel + 1); // Next year: promoted
}

function academicYearStartYear(acYr) {
  return parseInt(String(acYr.name).split('-')[0], 10);
}

/** School days inside an academic year's calendar (Apr–Mar India pattern) */
function schoolDaysInAcademicYear(acYr, count = 12, preferRecent = false) {
  const start = new Date(acYr.startDate);
  const end = new Date(acYr.endDate);
  const now = new Date();
  const effectiveEnd = end > now && preferRecent ? now : end;
  if (effectiveEnd <= start) return [];

  let rangeStart = start;
  let rangeEnd = effectiveEnd;
  if (preferRecent) {
    rangeStart = new Date(effectiveEnd);
    rangeStart.setDate(rangeStart.getDate() - 45);
    if (rangeStart < start) rangeStart = start;
  } else if (!preferRecent && effectiveEnd < now) {
    const mid = new Date(start.getTime() + (effectiveEnd.getTime() - start.getTime()) / 2);
    rangeStart = new Date(mid);
    rangeStart.setDate(rangeStart.getDate() - 20);
    rangeEnd = new Date(mid);
    rangeEnd.setDate(rangeEnd.getDate() + 20);
    if (rangeStart < start) rangeStart = start;
    if (rangeEnd > effectiveEnd) rangeEnd = effectiveEnd;
  }

  return schoolDaysInRange(rangeStart, rangeEnd, count);
}

function feePaymentStatusForYear(yearIndex) {
  if (yearIndex === 0) return pick(['paid', 'paid', 'partially_paid']);
  if (yearIndex === 1) return pick(['paid', 'pending', 'partially_paid']);
  return pick(['pending', 'pending']);
}

module.exports = {
  faker,
  pick,
  indianPhone,
  personName,
  schoolEmail,
  avatarUrl,
  hashPassword,
  puneAddress,
  schoolDaysInRange,
  periodTimes,
  marksForStudent,
  enrollmentLevel,
  academicYearStartYear,
  schoolDaysInAcademicYear,
  feePaymentStatusForYear,
  TEACHER_SUBJECTS,
  MALE_FIRST,
  FEMALE_FIRST,
  LAST_NAMES,
};
