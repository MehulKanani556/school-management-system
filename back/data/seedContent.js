/** Realistic static content for database seeding (Indian school context). */

const SCHOOL = {
  name: 'Vidya Mandir Senior Secondary School',
  subdomain: 'vidya-mandir-pune',
  address: 'Survey No. 42, Baner Road, Baner, Pune, Maharashtra 411045',
  contact: '020-2729-4581',
  adminEmail: 'principal@vidyamandir.edu.in',
  domain: 'vidyamandir.edu.in',
};

const ANNOUNCEMENTS = [
  {
    title: 'Annual Day Rehearsal Schedule — Classes VI to X',
    content:
      'Rehearsals will be held in the main auditorium from 2:00 PM to 5:00 PM on weekdays. Students must wear practice costumes as instructed by class teachers. Transport for day-scholars will leave at 5:30 PM.',
    targetRole: 'Student',
  },
  {
    title: 'Parent–Teacher Meeting (PTM) — Term II',
    content:
      'PTMs are scheduled for Saturday, 15 March 2026. Slot booking opens on the parent portal from 1 March. Please carry your child’s ID card and fee receipt if applicable.',
    targetRole: 'Parent',
  },
  {
    title: 'Staff Meeting: CBSE Curriculum Updates',
    content:
      'All teaching staff are requested to attend the curriculum alignment session on Friday at 3:30 PM in Conference Room B. Department heads will share assessment rubrics for Term II.',
    targetRole: 'Teacher',
  },
  {
    title: 'Fee Reminder — Term II Installment',
    content:
      'The last date for Term II fee payment without late fee is 31 March 2026. Online payment is available on the parent portal. For queries, contact the accounts office between 9 AM and 2 PM.',
    targetRole: 'Parent',
  },
  {
    title: 'Science Exhibition — Registration Open',
    content:
      'Students of Classes VIII–X may register project titles with their science teachers by 20 February. Working models and research posters will be judged on 28 February.',
    targetRole: 'Student',
  },
];

/** Build holidays for academic year starting in `startYear` (e.g. 2025 → session 2025-26) */
function holidaysForAcademicYear(startYear) {
  const y = startYear;
  const y2 = startYear + 1;
  return [
    { title: 'Independence Day', start: `${y}-08-15`, end: `${y}-08-15`, description: 'National holiday.' },
    { title: 'Gandhi Jayanti', start: `${y}-10-02`, end: `${y}-10-02`, description: 'National holiday.' },
    { title: 'Diwali Vacation', start: `${y}-10-20`, end: `${y}-10-29`, description: 'School closed for Diwali.' },
    { title: 'Christmas & Winter Break', start: `${y}-12-24`, end: `${y2}-01-02`, description: 'Winter vacation.' },
    { title: 'Republic Day', start: `${y2}-01-26`, end: `${y2}-01-26`, description: 'National holiday.' },
    { title: 'Holi', start: `${y2}-03-14`, end: `${y2}-03-14`, description: 'Festival holiday.' },
    { title: 'Summer Vacation', start: `${y2}-05-01`, end: `${y2}-05-15`, description: 'Annual summer break begins.' },
  ];
}

const YEAR_ANNOUNCEMENTS = (sessionLabel) => [
  {
    title: `Academic Session ${sessionLabel} — Commencement`,
    content: `Welcome to session ${sessionLabel}. Timetables and fee structures are published on the portal. Orientation for new admissions on the first Saturday of April.`,
    targetRole: 'All',
  },
  {
    title: `Term I Assessments — ${sessionLabel}`,
    content: `Unit tests for Classes VI–X will be held as per the shared assessment calendar. Students must carry school ID and stationery kit.`,
    targetRole: 'Student',
  },
  {
    title: `Fee Schedule — Session ${sessionLabel}`,
    content: `Term-wise fee instalments are due on 15 June, 15 October, and 15 January. Late fee applies after 7 days. Contact accounts for sibling concessions.`,
    targetRole: 'Parent',
  },
];

const LIBRARY_BOOKS = [
  { title: 'Mathematics for Class X', author: 'R.D. Sharma', isbn: '978-8177091874', category: 'Mathematics', publisher: 'Dhanpat Rai', year: 2023 },
  { title: 'Science Textbook — Class IX', author: 'NCERT Editorial Board', isbn: '978-8174504940', category: 'Science', publisher: 'NCERT', year: 2024 },
  { title: 'India and the Contemporary World', author: 'NCERT', isbn: '978-8174506364', category: 'Social Studies', publisher: 'NCERT', year: 2023 },
  { title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', isbn: '978-8173711468', category: 'Biography', publisher: 'Universities Press', year: 2015 },
  { title: 'The Guide', author: 'R.K. Narayan', isbn: '978-8185986000', category: 'Literature', publisher: 'Indian Thought', year: 2012 },
  { title: 'Computer Applications — Class VIII', author: 'Sumita Arora', isbn: '978-8178558965', category: 'Computer Science', publisher: 'Dhanpat Rai', year: 2024 },
  { title: 'Physical Education Handbook', author: 'S.K. Uppal', isbn: '978-8121904521', category: 'Sports', publisher: 'Sultan Chand', year: 2022 },
  { title: 'Hindi Vyakaran aur Rachna', author: 'Laxmi Publications', isbn: '978-8131804523', category: 'Hindi', publisher: 'Laxmi', year: 2023 },
  { title: 'Objective Physics for JEE', author: 'D.C. Pandey', isbn: '978-9352514210', category: 'Reference', publisher: 'Arihant', year: 2024 },
  { title: 'English Grammar in Use', author: 'Raymond Murphy', isbn: '978-1108457651', category: 'English', publisher: 'Cambridge', year: 2019 },
];

const TRANSPORT_ROUTES = [
  {
    name: 'Route 1 — Baner to Campus',
    fee: 18000,
    stops: [
      { name: 'Baner Gaon', order: 1, estimatedTime: '07:15', lat: 18.559, lng: 73.7869 },
      { name: 'Aundh Bridge', order: 2, estimatedTime: '07:28', lat: 18.563, lng: 73.801 },
      { name: 'University Road', order: 3, estimatedTime: '07:40', lat: 18.567, lng: 73.812 },
      { name: 'Vidya Mandir Gate', order: 4, estimatedTime: '07:55', lat: 18.571, lng: 73.82 },
    ],
  },
  {
    name: 'Route 2 — Kothrud to Campus',
    fee: 16500,
    stops: [
      { name: 'Kothrud Depot', order: 1, estimatedTime: '07:10', lat: 18.507, lng: 73.807 },
      { name: 'Paud Road Junction', order: 2, estimatedTime: '07:22', lat: 18.518, lng: 73.815 },
      { name: 'Pashan', order: 3, estimatedTime: '07:35', lat: 18.535, lng: 73.805 },
      { name: 'Vidya Mandir Gate', order: 4, estimatedTime: '07:55', lat: 18.571, lng: 73.82 },
    ],
  },
  {
    name: 'Route 3 — Viman Nagar to Campus',
    fee: 19500,
    stops: [
      { name: 'Viman Nagar Square', order: 1, estimatedTime: '07:00', lat: 18.5679, lng: 73.9143 },
      { name: 'Kalyani Nagar', order: 2, estimatedTime: '07:18', lat: 18.548, lng: 73.905 },
      { name: 'Yerawada', order: 3, estimatedTime: '07:32', lat: 18.545, lng: 73.88 },
      { name: 'Vidya Mandir Gate', order: 4, estimatedTime: '07:55', lat: 18.571, lng: 73.82 },
    ],
  },
];

const ADMISSION_ENQUIRIES = [
  { studentName: 'Aarav Mehta', parentName: 'Rajesh Mehta', previousSchool: 'Delhi Public School, Pune', source: 'Referral', status: 'Follow-up' },
  { studentName: 'Isha Deshmukh', parentName: 'Sunita Deshmukh', previousSchool: 'St. Mary\'s Convent', source: 'Online', status: 'Enquired' },
  { studentName: 'Kabir Joshi', parentName: 'Anil Joshi', previousSchool: 'Podar International', source: 'Direct', status: 'Admitted' },
  { studentName: 'Myra Kulkarni', parentName: 'Pradeep Kulkarni', previousSchool: 'Symbiosis School', source: 'Social Media', status: 'Enquired' },
];

const ASSIGNMENT_TITLES = [
  { title: 'Quadratic Equations — Problem Set 3', subject: 'Mathematics', description: 'Solve questions 1–15 from chapter 4. Show all steps.' },
  { title: 'Photosynthesis Lab Report', subject: 'Science', description: 'Submit handwritten report with diagram and observations from practical class.' },
  { title: 'Essay: Role of Youth in Nation Building', subject: 'English', description: '300–400 words. Typed or neat handwriting.' },
  { title: 'Map Work — Indian Freedom Movement', subject: 'Social Studies', description: 'Mark important sites and write a short note on each.' },
];

const TICKETS = [
  { subject: 'Parent portal not showing Term I marks', category: 'Technical', priority: 'High', status: 'In_Progress' },
  { subject: 'Request for duplicate fee receipt', category: 'Billing', priority: 'Medium', status: 'Open' },
  { subject: 'Add bulk SMS for bus delay alerts', category: 'Feature_Request', priority: 'Low', status: 'Open' },
];

const BEHAVIOR_LOGS = [
  { type: 'Positive', category: 'Academic', description: 'Represented school in district science quiz — secured 2nd place.' },
  { type: 'Positive', category: 'Discipline', description: 'Volunteered for library duty for four weeks without reminder.' },
  { type: 'Warning', category: 'Uniform', description: 'Incomplete uniform on three occasions; parents informed via SMS.' },
  { type: 'Negative', category: 'Conduct', description: 'Disruptive behavior during assembly; counselled by class teacher.' },
];

const PTM_TITLES = [
  'Term II Progress Discussion',
  'Mathematics Remedial Plan',
  'Behaviour and Attendance Review',
  'Board Exam Preparation — Class X',
];

const QUIZ_TOPICS = [
  { title: 'Algebra — Linear Equations', description: 'Chapter test: one variable equations and word problems.' },
  { title: 'Chemical Reactions — Quick Quiz', description: 'Balancing equations and reaction types.' },
  { title: 'Grammar: Tenses and Voice', description: '20 MCQs from Term II syllabus.' },
];

module.exports = {
  SCHOOL,
  ANNOUNCEMENTS,
  holidaysForAcademicYear,
  YEAR_ANNOUNCEMENTS,
  HOLIDAYS: holidaysForAcademicYear(new Date().getFullYear()),
  LIBRARY_BOOKS,
  TRANSPORT_ROUTES,
  ADMISSION_ENQUIRIES,
  ASSIGNMENT_TITLES,
  TICKETS,
  BEHAVIOR_LOGS,
  PTM_TITLES,
  QUIZ_TOPICS,
};
