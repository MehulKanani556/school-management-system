/**
 * Seeds the database with realistic Indian school data across all collections.
 * Run: node seed_all_real_data.js
 * Default password for all seeded users: Password@123
 */
const mongoose = require('mongoose');
require('dotenv').config();

const content = require('./data/seedContent');
const H = require('./data/seedHelpers');

const User = require('./models/user.model');
const School = require('./models/school.model');
const Teacher = require('./models/teacher.model');
const Student = require('./models/student.model');
const Standard = require('./models/standard.model');
const Subject = require('./models/subject.model');
const ClassSection = require('./models/classSection.model');
const AcademicYear = require('./models/academicYear.model');
const SystemSetting = require('./models/systemSetting.model');
const FeeStructure = require('./models/feeStructure.model');
const Exam = require('./models/exam.model');
const Announcement = require('./models/announcement.model');
const StudentEnrollment = require('./models/studentEnrollment.model');
const Attendance = require('./models/attendance.model');
const FeePayment = require('./models/feePayment.model');
const Book = require('./models/book.model');
const BookReservation = require('./models/bookReservation.model');
const IssueRecord = require('./models/issueRecord.model');
const Route = require('./models/route.model');
const Vehicle = require('./models/vehicle.model');
const Driver = require('./models/driver.model');
const Assignment = require('./models/assignment.model');
const Submission = require('./models/submission.model');
const Mark = require('./models/mark.model');
const Message = require('./models/message.model');
const Notification = require('./models/notification.model');
const Ticket = require('./models/ticket.model');
const Payroll = require('./models/payroll.model');
const Holiday = require('./models/holiday.model');
const Timetable = require('./models/timetable.model');
const Quiz = require('./models/quiz.model');
const Question = require('./models/question.model');
const QuizAttempt = require('./models/quizAttempt.model');
const QuestionBank = require('./models/questionBank.model');
const LessonPlan = require('./models/lessonPlan.model');
const BehaviorLog = require('./models/behaviorLog.model');
const Meeting = require('./models/meeting.model');
const AdmissionEnquiry = require('./models/admissionEnquiry.model');
const Review = require('./models/review.model');
const StaffAttendance = require('./models/staffAttendance.model');
const TripLog = require('./models/tripLog.model');
const Leave = require('./models/leave.model');
const PromotionHistory = require('./models/promotionHistory.model');
const AuditLog = require('./models/auditLog.model');
const Backup = require('./models/backup.model');
const ResourceLocker = require('./models/resourceLocker.model');

const DEFAULT_PASSWORD = 'Password@123';
const STUDENTS_PER_SECTION = 30;
const SECTIONS = ['A', 'B', 'C', 'D'];
const STANDARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

async function clearSchoolData(schoolId) {
  const bySchool = { schoolId };
  const models = [
    QuizAttempt, Submission, Mark, Attendance, FeePayment, IssueRecord, BookReservation,
    StaffAttendance, Leave, BehaviorLog, Meeting, Notification, Message, Ticket, Payroll,
    PromotionHistory, AuditLog, Backup, AdmissionEnquiry, Review, LessonPlan, Question,
    Quiz, Assignment, Exam, FeeStructure, StudentEnrollment, Holiday, Timetable,
    ResourceLocker, QuestionBank, Route, Book, Student, ClassSection, Standard, Teacher,
    Announcement, AcademicYear, Driver, Vehicle,
  ];
  for (const M of models) {
    try {
      if (M.schema.paths.schoolId) {
        const result = await M.deleteMany(bySchool);
        console.log(`  Cleared ${result.deletedCount} ${M.modelName} records`);
      }
    } catch (e) {
      console.warn(`Skip delete ${M.modelName}:`, e.message);
    }
  }
  const userResult = await User.deleteMany({
    schoolId,
    role: { $in: ['Teacher', 'Student', 'Parent', 'Accountant', 'Librarian', 'Transport_Manager', 'Driver'] },
  });
  console.log(`  Cleared ${userResult.deletedCount} User records`);
}

async function seed() {
  const ctx = {
    school: null,
    schoolAdmin: null,
    academicYears: [],
    currentYear: null,
    subjects: [],
    teachers: [],
    teacherUsers: [],
    standards: [],
    sections: [],
    students: [],
    studentUsers: [],
    parents: [],
    books: [],
    routes: [],
    vehicles: [],
    drivers: [],
    exams: [],
    examsByYear: {},
    feeStructuresByYear: {},
    staff: {},
  };

  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB\n');

    const hashedDefault = await H.hashPassword(DEFAULT_PASSWORD);

    // ─── Super Admin ─────────────────────────────────────────────
    let superAdmin = await User.findOne({ role: 'Super_Admin' });
    if (!superAdmin) {
      superAdmin = await User.create({
        firstName: 'Ramesh',
        lastName: 'Kapoor',
        email: 'superadmin@edumanage.in',
        password: hashedDefault,
        role: 'Super_Admin',
        phoneNumber: H.indianPhone(),
        photo: H.avatarUrl('Ramesh', 'Kapoor'),
      });
      console.log('Created Super_Admin: superadmin@edumanage.in');
    }

    // ─── School & School Admin ───────────────────────────────────
    let school = await School.findOne({ subdomain: content.SCHOOL.subdomain });
    if (school) {
      console.log('Deleting existing school and users to ensure clean recreation...');
      await clearSchoolData(school._id);
      await User.deleteMany({ schoolId: school._id });
      await School.deleteOne({ _id: school._id });
      school = null;
    }
    if (!school) {
      school = await School.create({
        name: content.SCHOOL.name,
        subdomain: content.SCHOOL.subdomain,
        address: content.SCHOOL.address,
        contact: content.SCHOOL.contact,
        adminEmail: content.SCHOOL.adminEmail,
        isActive: true,
        settings: {
          emailNotifications: true,
          smsNotifications: true,
          libraryFinePerDay: 5,
          gradingScale: [
            { grade: 'A+', minPercent: 90 },
            { grade: 'A', minPercent: 80 },
            { grade: 'B+', minPercent: 70 },
            { grade: 'B', minPercent: 60 },
            { grade: 'C', minPercent: 50 },
            { grade: 'D', minPercent: 40 },
          ],
        },
      });
    }
    ctx.school = school;
    const schoolId = school._id;

    console.log('Clearing existing school data...');
    await clearSchoolData(schoolId);
    
    // Extra cleanup to ensure no orphaned records
    await ClassSection.deleteMany({ schoolId });
    await Student.deleteMany({ schoolId });
    await Teacher.deleteMany({ schoolId });
    console.log('Additional cleanup completed.\n');

    let schoolAdmin = await User.findOne({ role: 'School_Admin', schoolId });
    if (!schoolAdmin) {
      schoolAdmin = await User.create({
        firstName: 'Sunita',
        lastName: 'Deshmukh',
        email: content.SCHOOL.adminEmail,
        password: hashedDefault,
        role: 'School_Admin',
        schoolId,
        phoneNumber: content.SCHOOL.contact.replace(/\D/g, '').slice(-10) || H.indianPhone(),
        photo: H.avatarUrl('Sunita', 'Deshmukh'),
      });
    } else {
      await User.updateOne({ _id: schoolAdmin._id }, { $set: { password: hashedDefault } });
    }
    ctx.schoolAdmin = schoolAdmin;

    // ─── Support staff ───────────────────────────────────────────
    const staffRoles = [
      { role: 'Accountant', first: 'Meera', last: 'Kulkarni', emp: 'EMP-ACC-001' },
      { role: 'Librarian', first: 'Sanjay', last: 'Patil', emp: 'EMP-LIB-001' },
      { role: 'Transport_Manager', first: 'Ganesh', last: 'More', emp: 'EMP-TRN-001' },
    ];
    for (const s of staffRoles) {
      const email = H.schoolEmail(s.first, s.last, s.role, content.SCHOOL.domain);
      const u = await User.create({
        firstName: s.first,
        lastName: s.last,
        email,
        password: hashedDefault,
        role: s.role,
        schoolId,
        phoneNumber: H.indianPhone(),
        employeeId: s.emp,
        baseSalary: H.faker.number.int({ min: 22000, max: 45000 }),
        photo: H.avatarUrl(s.first, s.last),
      });
      ctx.staff[s.role] = u;
    }

    // ─── Academic years ──────────────────────────────────────────
    const y = new Date().getFullYear();
    for (const yr of [y - 1, y, y + 1]) {
      const ay = await AcademicYear.create({
        schoolId,
        name: `${yr}-${yr + 1}`,
        startDate: new Date(`${yr}-04-01`),
        endDate: new Date(`${yr + 1}-03-31`),
        isCurrent: yr === y,
      });
      ctx.academicYears.push(ay);
      if (yr === y) ctx.currentYear = ay;
    }

    // ─── System settings ─────────────────────────────────────────
    const settings = [
      { key: 'school_name', value: content.SCHOOL.name, description: 'Display name' },
      { key: 'currency', value: 'INR', description: 'Fee currency' },
      { key: 'timezone', value: 'Asia/Kolkata', description: 'Timezone' },
      { key: `QUESTION_TYPES_${schoolId}`, value: ['MCQ', 'FillInBlank', 'TrueFalse', 'ShortAnswer'], description: 'Question types' },
      { key: 'AUDIT_LOGGING_LEVEL', value: 'standard', description: 'Audit verbosity' },
    ];
    for (const s of settings) {
      await SystemSetting.updateOne({ key: s.key }, { $set: s }, { upsert: true });
    }

    // ─── Subjects ────────────────────────────────────────────────
    const subjectDefs = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Science', code: 'SCI' },
      { name: 'English', code: 'ENG' },
      { name: 'Hindi', code: 'HIN' },
      { name: 'Social Studies', code: 'SST' },
      { name: 'Computer Science', code: 'CS' },
      { name: 'Physical Education', code: 'PE' },
    ];
    for (const sub of subjectDefs) {
      ctx.subjects.push(
        await Subject.create({
          schoolId,
          name: sub.name,
          code: sub.code,
          description: `${sub.name} — CBSE aligned syllabus`,
        })
      );
    }

    // ─── Teachers (one lead per subject + extras) ────────────────
    const subjectNames = ctx.subjects.map((s) => s.name);
    const numTeachersNeeded = STANDARDS.length * SECTIONS.length; // One teacher per section
    for (let i = 0; i < numTeachersNeeded; i++) {
      const subName = subjectNames[i % subjectNames.length];
      const { firstName, lastName, gender } = H.personName(i % 3 === 0 ? 'female' : 'male');
      const email = H.schoolEmail(firstName, lastName, 'teacher', content.SCHOOL.domain, i + 1);
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedDefault,
        role: 'Teacher',
        schoolId,
        phoneNumber: H.indianPhone(),
        employeeId: `EMP-TCH-${String(i + 1).padStart(3, '0')}`,
        baseSalary: H.faker.number.int({ min: 28000, max: 62000 }),
        photo: H.avatarUrl(firstName, lastName),
      });
      const teacher = await Teacher.create({
        schoolId,
        schoolAdminId: schoolAdmin._id,
        userId: user._id,
        firstName,
        lastName,
        email,
        phone: user.phoneNumber,
        qualifications: H.TEACHER_SUBJECTS[subName] || ['B.Ed'],
        joiningDate: H.faker.date.past({ years: 8 }),
        baseSalary: user.baseSalary,
      });
      ctx.teachers.push({ teacher, user, subjectName: subName });
      ctx.teacherUsers.push(user);
    }

    // ─── Standards, sections, students, parents ──────────────────
    let parentIndex = 0;
    let teacherIndex = 0; // Track teacher assignment sequentially
    for (const level of STANDARDS) {
      const standard = await Standard.create({
        schoolId,
        level,
        name: level <= 8 ? `Class ${level}` : `Class ${level}`,
        subjects: ctx.subjects.map((s) => s._id),
      });
      ctx.standards.push(standard);

      for (const acYr of ctx.academicYears) {
        const fsDoc = await FeeStructure.create({
          schoolId,
          standardId: standard._id,
          academicYearId: acYr._id,
          dueDate: new Date(`${acYr.name.split('-')[0]}-06-15`),
          feeItems: [
            { name: 'Tuition Fee', amount: 22000 + level * 1500 + (H.academicYearStartYear(acYr) - y) * 500 },
            { name: 'Development Fee', amount: 3500 },
            { name: 'Examination Fee', amount: 1200 },
            { name: 'Library Fee', amount: 800 },
          ],
        });
        const fsKey = acYr._id.toString();
        if (!ctx.feeStructuresByYear[fsKey]) ctx.feeStructuresByYear[fsKey] = [];
        ctx.feeStructuresByYear[fsKey].push(fsDoc);
        for (const type of ['unit_test', 'midterm', 'final']) {
          const exam = await Exam.create({
            schoolId,
            name: `${type === 'unit_test' ? 'Unit Test' : type === 'midterm' ? 'Half Yearly' : 'Annual'} — Class ${level} (${acYr.name})`,
            type,
            standardId: standard._id,
            maxMarks: 100,
            date: H.faker.date.between({ from: acYr.startDate, to: acYr.endDate }),
            isPublished: true,
            academicYearId: acYr._id,
          });
          const key = acYr._id.toString();
          if (!ctx.examsByYear[key]) ctx.examsByYear[key] = [];
          ctx.examsByYear[key].push(exam);
          if (acYr._id.equals(ctx.currentYear._id)) ctx.exams.push(exam);
        }
      }

      for (const secLabel of SECTIONS) {
        const classTeacher = ctx.teachers[teacherIndex % ctx.teachers.length].teacher;
        teacherIndex++;
        let currentSection = null;
        for (const acYr of ctx.academicYears) {
          const section = await ClassSection.create({
            schoolId,
            academicYearId: acYr._id,
            standardId: standard._id,
            sectionLabel: secLabel,
            classTeacher: classTeacher._id,
            subjects: ctx.subjects.map((s) => s._id),
          });
          ctx.sections.push({ section, standard, level, academicYearId: acYr._id });
          if (acYr._id.equals(ctx.currentYear._id)) currentSection = section;
        }

        for (let s = 0; s < STUDENTS_PER_SECTION; s++) {
          const gender = s % 2 === 0 ? 'male' : 'female';
          const { firstName, lastName } = H.personName(gender);
          const roll = String(s + 1).padStart(2, '0');
          const studentEmail = `student.${level}${secLabel.toLowerCase()}.${roll}@${content.SCHOOL.domain}`;
          
          const dob = H.faker.date.birthdate({ min: 5 + level, max: 6 + level, mode: 'age' });
          const day = String(dob.getDate()).padStart(2, '0');
          const month = String(dob.getMonth() + 1).padStart(2, '0');
          const year = String(dob.getFullYear());
          const plainPassword = `${day}${month}${year}`;
          const hashedPassword = await H.hashPassword(plainPassword);

          const studentUser = await User.create({
            firstName,
            lastName,
            email: studentEmail,
            password: hashedPassword,
            role: 'Student',
            schoolId,
            photo: H.avatarUrl(firstName, lastName),
          });

          const parentFirst = s % 3 === 0 ? firstName : H.pick(gender === 'male' ? H.MALE_FIRST : H.FEMALE_FIRST);
          const parentLast = lastName;
          const parentEmail = H.schoolEmail(parentFirst, parentLast, 'parent', content.SCHOOL.domain, parentIndex++);
          let parentUser = ctx.parents.find((p) => p.email === parentEmail);
          if (!parentUser) {
            parentUser = await User.create({
              firstName: parentFirst,
              lastName: parentLast,
              email: parentEmail,
              password: hashedDefault,
              role: 'Parent',
              schoolId,
              phoneNumber: H.indianPhone(),
              photo: H.avatarUrl(parentFirst, parentLast),
            });
            ctx.parents.push(parentUser);
          }

          const student = await Student.create({
            createdBy: schoolAdmin._id,
            schoolId,
            schoolAdminId: schoolAdmin._id,
            firstName,
            lastName,
            email: studentEmail,
            password: hashedPassword,
            rollNumber: roll,
            dateOfBirth: dob,
            gender,
            guardianName: `${parentFirst} ${parentLast}`,
            guardianContact: parentUser.phoneNumber,
            guardianEmail: parentEmail,
            parentId: parentUser._id,
            address: H.puneAddress(),
            photo: studentUser.photo,
            standard: standard._id,
            classSection: currentSection._id,
          });

          ctx.students.push({ student, studentUser, section: currentSection, standard, level, parentUser });

          for (let yearIndex = 0; yearIndex < ctx.academicYears.length; yearIndex++) {
            const acYr = ctx.academicYears[yearIndex];
            const effLevel = H.enrollmentLevel(level, yearIndex);
            
            // Skip if student didn't exist in this year (null means not enrolled yet)
            if (effLevel === null) continue;
            
            const effStandard = ctx.standards.find((st) => st.level === effLevel);
            if (!effStandard) continue;
            
            // Find the appropriate section for this grade level and section label
            const effSection = ctx.sections.find(
              (s) => s.standard._id.equals(effStandard._id) && s.section.sectionLabel === secLabel && s.academicYearId.equals(acYr._id)
            );
            if (!effSection) continue;
            
            const yearStart = H.academicYearStartYear(acYr);
            await StudentEnrollment.create({
              schoolId,
              studentId: student._id,
              academicYearId: acYr._id,
              standardId: effStandard._id,
              classSectionId: effSection.section._id,
              rollNumber: `${yearStart}-${effLevel}${secLabel}-${roll}`,
              status: yearIndex === 2 && level === 12 ? 'Graduated' : 'Active',
              isPromoted: yearIndex > 1,
            });
          }
        }
      }
      console.log(`  Class ${level} — ${SECTIONS.length} sections × ${STUDENTS_PER_SECTION} students`);
    }

    const acId = ctx.currentYear._id;

    // ─── Announcements (session-specific + general) ─────────────
    for (const acYr of ctx.academicYears) {
      for (const a of content.YEAR_ANNOUNCEMENTS(acYr.name)) {
        await Announcement.create({
          schoolId,
          authorId: schoolAdmin._id,
          title: a.title,
          content: a.content,
          targetRole: a.targetRole,
          isPublished: true,
          expiresAt: new Date(acYr.endDate),
          academicYearId: acYr._id,
        });
      }
    }
    for (const a of content.ANNOUNCEMENTS) {
      await Announcement.create({
        schoolId,
        authorId: schoolAdmin._id,
        title: a.title,
        content: a.content,
        targetRole: a.targetRole,
        isPublished: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        academicYearId: ctx.currentYear._id,
      });
    }

    // ─── Library ─────────────────────────────────────────────────
    for (const b of content.LIBRARY_BOOKS) {
      const copies = H.faker.number.int({ min: 8, max: 25 });
      const book = await Book.create({
        schoolId,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        totalCopies: copies,
        availableCopies: H.faker.number.int({ min: 2, max: copies }),
        type: 'Physical',
        publisher: b.publisher,
        publicationYear: b.year,
        location: `Rack ${b.category.slice(0, 1)}-${H.faker.number.int({ min: 1, max: 12 })}`,
      });
      ctx.books.push(book);
    }

    const sampleStudents = ctx.students.slice(0, 40);
    for (let i = 0; i < 15; i++) {
      const { student, studentUser } = sampleStudents[i % sampleStudents.length];
      const book = ctx.books[i % ctx.books.length];
      const issueDate = H.faker.date.recent({ days: 30 });
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 14);
      const returned = i % 3 === 0;
      await IssueRecord.create({
        schoolId,
        bookId: book._id,
        borrowerId: studentUser._id,
        borrowerModel: 'User',
        issueDate,
        dueDate,
        returnDate: returned ? H.faker.date.between({ from: issueDate, to: new Date() }) : null,
        status: returned ? 'returned' : i % 5 === 0 ? 'overdue' : 'issued',
        fine: returned && i % 4 === 0 ? 25 : 0,
        fineStatus: returned ? 'paid' : 'unpaid',
      });
      if (!returned && book.availableCopies > 0) book.availableCopies -= 1;
    }
    for (const b of ctx.books) await b.save();

    for (let i = 0; i < 8; i++) {
      const { studentUser } = sampleStudents[i];
      await BookReservation.create({
        schoolId,
        bookId: ctx.books[i]._id,
        studentId: studentUser._id,
        status: H.pick(['pending', 'fulfilled', 'cancelled']),
      });
    }

    // ─── Transport ───────────────────────────────────────────────
    const drivers = [
      { name: 'Suresh Pawar', license: 'MH-12-2015-004521' },
      { name: 'Ramesh Jadhav', license: 'MH-12-2018-009812' },
      { name: 'Mahesh Gaikwad', license: 'MH-12-2020-011203' },
    ];
    for (let i = 0; i < drivers.length; i++) {
      const d = drivers[i];
      const [first, ...rest] = d.name.split(' ');
      const last = rest.join(' ') || 'Driver';
      const email = H.schoolEmail(first, last, 'driver', content.SCHOOL.domain, i + 1);
      const user = await User.create({
        firstName: first,
        lastName: last,
        email,
        password: hashedDefault,
        role: 'Driver',
        schoolId,
        phoneNumber: H.indianPhone(),
        employeeId: `EMP-DRV-${String(i + 1).padStart(3, '0')}`,
        photo: H.avatarUrl(first, last),
      });
      const driver = await Driver.create({
        schoolId,
        name: d.name,
        contact: user.phoneNumber,
        licenseNumber: d.license,
        licenseExpiry: new Date('2028-06-30'),
        emergencyContact: H.indianPhone(),
        performanceRating: H.faker.number.int({ min: 4, max: 5 }),
        status: 'active',
        userId: user._id,
      });
      ctx.drivers.push({ driver, user });

      const vehicle = await Vehicle.create({
        schoolId,
        registrationNumber: `MH-12-${H.faker.string.alpha({ length: 2, casing: 'upper' })}-${1000 + i}`,
        capacity: 45,
        fuelType: i === 2 ? 'CNG' : 'Diesel',
        insuranceExpiry: new Date('2026-12-31'),
        lastServiceDate: H.faker.date.recent({ days: 60 }),
        maintenanceHistory: [
          { date: H.faker.date.recent({ days: 90 }), serviceType: 'Oil change & brake check', cost: 4500, notes: 'Authorized service centre, Baner' },
        ],
        fuelLogs: [
          { date: H.faker.date.recent({ days: 7 }), fuelQuantity: 65, cost: 5850, odometerReading: 45200 + i * 1000, notes: 'Full tank' },
        ],
        currentLocation: { lat: 18.571 + i * 0.002, lng: 73.82 + i * 0.001, updatedAt: new Date() },
        status: 'active',
        driverId: driver._id,
      });
      ctx.vehicles.push(vehicle);
    }

    for (let r = 0; r < content.TRANSPORT_ROUTES.length; r++) {
      const def = content.TRANSPORT_ROUTES[r];
      const routeStudents = ctx.students
        .filter((_, idx) => idx % content.TRANSPORT_ROUTES.length === r)
        .slice(0, 25)
        .map((s, idx) => ({
          studentId: s.student._id,
          pickupStop: def.stops[0].name,
          dropoffStop: def.stops[def.stops.length - 1].name,
          seatNumber: idx + 1,
        }));

      const route = await Route.create({
        schoolId,
        name: def.name,
        stops: def.stops,
        vehicleId: ctx.vehicles[r]._id,
        assignedStudents: routeStudents,
        fee: def.fee,
        status: 'active',
      });
      ctx.routes.push(route);

      for (const rs of routeStudents.slice(0, 15)) {
        await Student.updateOne(
          { _id: rs.studentId },
          { transportStatus: 'Active', transportRouteId: route._id }
        );
      }
    }

    const sectionGroups = {};
    for (const s of ctx.students) {
      const key = s.section._id.toString();
      if (!sectionGroups[key]) sectionGroups[key] = { section: s.section, standard: s.standard, students: [] };
      sectionGroups[key].students.push({ student: s.student, level: s.level });
    }

    const enrollments = await StudentEnrollment.find({ schoolId }).lean();

    // ─── Per academic year: holidays, attendance, fees, marks, work ─
    for (let yearIndex = 0; yearIndex < ctx.academicYears.length; yearIndex++) {
      const acYr = ctx.academicYears[yearIndex];
      const acYrId = acYr._id;
      const acKey = acYrId.toString();
      const isCurrent = acYr._id.equals(ctx.currentYear._id);
      const yearStart = H.academicYearStartYear(acYr);
      console.log(`  Seeding session ${acYr.name}...`);

      for (const h of content.holidaysForAcademicYear(yearStart)) {
        await Holiday.create({
          schoolId,
          academicYearId: acYrId,
          title: h.title,
          startDate: new Date(h.start),
          endDate: new Date(h.end),
          description: h.description,
        });
      }

      if (yearIndex < 2) {
        const attDays = H.schoolDaysInAcademicYear(acYr, isCurrent ? 15 : 10, isCurrent);
        for (const day of attDays) {
          for (const g of Object.values(sectionGroups)) {
            const yearEnrolls = enrollments.filter(
              (e) =>
                e.academicYearId.toString() === acKey &&
                e.classSectionId?.toString() === g.section._id.toString()
            );
            if (!yearEnrolls.length) continue;
            const records = yearEnrolls.map((e) => ({
              studentId: e.studentId,
              status: H.faker.helpers.arrayElement(['Present', 'Present', 'Present', 'Absent', 'Late']),
              arrivalTime: '08:05',
              departureTime: '14:35',
            }));
            await Attendance.create({
              schoolId,
              standardId: g.standard._id,
              classSection: g.section._id,
              date: day,
              academicYearId: acYrId,
              submittedBy: H.pick(ctx.teacherUsers)._id,
              records,
            }).catch(() => {});
          }
        }
      }

      const feeStructures = ctx.feeStructuresByYear[acKey] || [];
      const yearEnrollments = enrollments.filter((e) => e.academicYearId.toString() === acKey);
      for (const enr of yearEnrollments) {
        const fs = feeStructures.find((f) => f.standardId.toString() === enr.standardId.toString());
        if (!fs) continue;
        const tuition = fs.feeItems.find((i) => i.name === 'Tuition Fee')?.amount || 25000;
        const statusChoice = H.feePaymentStatusForYear(yearIndex);
        let paid = 0;
        if (statusChoice === 'paid') paid = tuition;
        else if (statusChoice === 'partially_paid') paid = Math.floor(tuition * 0.5);
        await FeePayment.create({
          schoolId,
          studentId: enr.studentId,
          amount: tuition,
          totalAmount: tuition,
          paidAmount: paid,
          category: 'Tuition Fee',
          paymentMethod: paid ? H.pick(['online', 'cash', 'bank_transfer']) : undefined,
          status: statusChoice,
          dueDate: new Date(`${yearStart}-06-15`),
          paidDate: paid >= tuition ? H.faker.date.between({ from: acYr.startDate, to: acYr.endDate }) : undefined,
          transactionId: paid ? `TXN${yearStart}${H.faker.string.alphanumeric(8).toUpperCase()}` : undefined,
          academicYearId: acYrId,
          feeStructureId: fs._id,
          submittedBy: ctx.staff.Accountant?._id,
        }).catch(() => {});

        if (isCurrent && yearIndex === 1) {
          const devFee = fs.feeItems.find((i) => i.name === 'Development Fee')?.amount || 3500;
          await FeePayment.create({
            schoolId,
            studentId: enr.studentId,
            amount: devFee,
            totalAmount: devFee,
            paidAmount: H.faker.helpers.arrayElement([0, devFee]),
            category: 'Development Fee',
            status: H.pick(['paid', 'pending']),
            dueDate: new Date(`${yearStart}-10-15`),
            academicYearId: acYrId,
            feeStructureId: fs._id,
          }).catch(() => {});
        }
      }

      for (const rs of ctx.routes) {
        for (const a of rs.assignedStudents.slice(0, 5)) {
          await FeePayment.create({
            schoolId,
            studentId: a.studentId,
            amount: rs.fee,
            totalAmount: rs.fee,
            paidAmount: yearIndex === 0 ? rs.fee : yearIndex === 1 ? H.faker.helpers.arrayElement([0, rs.fee]) : 0,
            category: 'Transport Fee',
            paymentMethod: H.pick(['online', 'cash']),
            status: yearIndex === 0 ? 'paid' : H.pick(['paid', 'pending', 'partially_paid']),
            dueDate: new Date(`${yearStart}-08-01`),
            academicYearId: acYrId,
          }).catch(() => {});
        }
      }

      const yearExams = (ctx.examsByYear[acKey] || []).filter((e) => ['midterm', 'final'].includes(e.type));
      for (const exam of yearExams) {
        const stdStudents = enrollments
          .filter((e) => e.academicYearId.toString() === acKey && e.standardId.toString() === exam.standardId.toString())
          .map((e) => e.studentId);
        const stdMeta = ctx.students.filter((s) => stdStudents.some((id) => id.toString() === s.student._id.toString()));
        for (const s of stdMeta) {
          await Mark.create({
            schoolId,
            examId: exam._id,
            studentId: s.student._id,
            marksObtained: H.marksForStudent(s.level),
            remarks: H.faker.helpers.arrayElement(['Good effort', 'Can improve', 'Excellent', '']),
            academicYearId: acYrId,
            submittedBy: H.pick(ctx.teacherUsers)._id,
          }).catch(() => {});
        }
      }

      const assignCount = yearIndex === 2 ? 1 : 2;
      for (const { section, standard, level } of ctx.sections.filter((s) => s.level >= 5).slice(0, 8)) {
        for (let ai = 0; ai < assignCount; ai++) {
          const a = content.ASSIGNMENT_TITLES[ai % content.ASSIGNMENT_TITLES.length];
          const teacher = H.pick(ctx.teachers);
          const assignment = await Assignment.create({
            schoolId,
            classSection: section._id,
            title: `${a.title} (${acYr.name})`,
            description: a.description,
            subject: a.subject,
            dueDate: H.faker.date.between({ from: acYr.startDate, to: acYr.endDate }),
            academicYearId: acYrId,
            createdBy: teacher.user._id,
          });
          const enrInSection = enrollments.filter(
            (e) =>
              e.academicYearId.toString() === acKey &&
              e.classSectionId?.toString() === section._id.toString()
          );
          for (const enr of enrInSection.slice(0, 5)) {
            if (yearIndex === 2) continue;
            await Submission.create({
              schoolId,
              assignmentId: assignment._id,
              studentId: enr.studentId,
              academicYearId: acYrId,
              fileUrl: '/uploads/documents/sample-homework.pdf',
              status: yearIndex === 0 ? 'Graded' : H.pick(['Submitted', 'Graded']),
              marks: H.faker.number.int({ min: 6, max: 10 }),
              feedback: 'Reviewed — neat presentation.',
              submittedAt: H.faker.date.between({ from: acYr.startDate, to: acYr.endDate }),
            }).catch(() => {});
          }
        }
      }

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for (const { section, standard, academicYearId } of ctx.sections) {
          if (!academicYearId.equals(acYrId)) continue;
          const schedule = days.map((day) => ({
            day,
            periods: H.periodTimes().map((p, idx) => {
              if (p.type && p.type.includes('Break')) {
                return { startTime: p.start, endTime: p.end, type: p.type };
              }
              const sub = ctx.subjects[idx % ctx.subjects.length];
              const t = ctx.teachers.find((tc) => tc.subjectName === sub.name) || ctx.teachers[0];
              return {
                startTime: p.start,
                endTime: p.end,
                type: 'Lecture',
                subject: sub._id,
                teacher: t.teacher._id,
                room: `Room ${H.faker.number.int({ min: 101, max: 315 })}`,
              };
            }),
          }));
          await Timetable.create({
            schoolId,
            standardId: standard._id,
            classSection: section._id,
            schedule,
            academicYearId: acYrId,
          }).catch(() => {});
        }

      for (const { section, standard, level } of ctx.sections.filter((s) => s.level >= 6).slice(0, 4)) {
        const qt = content.QUIZ_TOPICS[yearIndex % content.QUIZ_TOPICS.length];
        const teacher = ctx.teachers[0];
        const quiz = await Quiz.create({
          title: `${qt.title} — Class ${level} (${acYr.name})`,
          description: qt.description,
          subjectId: ctx.subjects[0]._id,
          classSection: section._id,
          standardId: standard._id,
          schoolId,
          academicYearId: acYrId,
          duration: 30,
          passingScore: 40,
          isPublished: yearIndex !== 2,
          createdBy: teacher.user._id,
        });
        const questions = [];
        for (let q = 0; q < 5; q++) {
          const qu = await Question.create({
            quizId: quiz._id,
            text: `Q${q + 1} (${acYr.name}): ${qt.title.split('—')[0].trim()}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: H.faker.number.int({ min: 0, max: 3 }),
            points: 10,
          });
          questions.push(qu._id);
        }
        quiz.questions = questions;
        await quiz.save();

        if (yearIndex < 2) {
          const enrInSection = enrollments.filter(
            (e) =>
              e.academicYearId.toString() === acKey &&
              e.classSectionId?.toString() === section._id.toString()
          );
          for (const enr of enrInSection.slice(0, 4)) {
            const score = H.faker.number.int({ min: 20, max: 50 });
            await QuizAttempt.create({
              quizId: quiz._id,
              studentId: enr.studentId,
              schoolId,
              academicYearId: acYrId,
              answers: [],
              score,
              totalPoints: 50,
              status: score >= 20 ? 'Passed' : 'Failed',
            }).catch(() => {});
          }
        }
      }

      for (let i = 0; i < 8; i++) {
        const st = H.pick(ctx.students);
        const bl = H.pick(content.BEHAVIOR_LOGS);
        await BehaviorLog.create({
          schoolId,
          studentId: st.student._id,
          teacherId: H.pick(ctx.teachers).teacher._id,
          academicYearId: acYrId,
          type: bl.type,
          category: bl.category,
          description: `${bl.description} (Session ${acYr.name})`,
          date: H.faker.date.between({ from: acYr.startDate, to: acYr.endDate }),
        }).catch(() => {});
      }

      for (const { section } of ctx.sections.slice(0, 3)) {
        await LessonPlan.create({
          schoolId,
          teacherId: ctx.teachers[0].teacher._id,
          classSection: section._id,
          subject: ctx.subjects[yearIndex % ctx.subjects.length]._id,
          academicYearId: acYrId,
          topic: `Unit ${yearIndex + 1} — ${acYr.name}`,
          subTopics: ['Introduction', 'Practice', 'Assessment'],
          date: H.faker.date.between({ from: acYr.startDate, to: acYr.endDate }),
          objectives: 'Complete chapter as per CBSE syllabus.',
          resources: ['NCERT', 'Worksheets'],
          status: yearIndex === 2 ? 'Draft' : 'Published',
        }).catch(() => {});
      }

      const attDaysStaff = H.schoolDaysInAcademicYear(acYr, 6, isCurrent);
      for (const day of attDaysStaff) {
        for (const { teacher } of ctx.teachers.slice(0, 5)) {
          await StaffAttendance.create({
            schoolId,
            academicYearId: acYrId,
            teacherId: teacher._id,
            date: day,
            status: 'Present',
            arrivalTime: '08:00',
            departureTime: '15:30',
          }).catch(() => {});
        }
      }

      for (const route of ctx.routes) {
        const vehicle = ctx.vehicles.find((v) => v._id.equals(route.vehicleId));
        const tripDate = H.faker.date.between({ from: acYr.startDate, to: acYr.endDate });
        tripDate.setHours(7, 0, 0, 0);
        await TripLog.create({
          schoolId,
          routeId: route._id,
          vehicleId: route.vehicleId,
          driverId: vehicle?.driverId,
          date: tripDate,
          type: 'Pickup',
          status: yearIndex === 2 ? 'Scheduled' : 'Completed',
          actualDepartureTime: tripDate,
          arrivalTime: yearIndex === 2 ? undefined : new Date(tripDate.getTime() + 75 * 60000),
          attendance: route.assignedStudents.slice(0, 5).map((a) => ({
            studentId: a.studentId,
            boarded: yearIndex !== 2,
            boardingTime: tripDate,
          })),
        }).catch(() => {});
      }
    }

    // ─── Messages & notifications ────────────────────────────────
    await Message.create({
      schoolId,
      sender: schoolAdmin._id,
      type: 'Announcement',
      targetRole: 'All',
      subject: 'Welcome to the new academic session',
      content: `Dear students and parents, ${content.SCHOOL.name} welcomes you to the ${ctx.currentYear.name} session. Please check the portal for timetables and fee schedules.`,
      isPinned: true,
    });

    for (let i = 0; i < 25; i++) {
      const recipient = H.pick([...ctx.teacherUsers, ...ctx.parents.slice(0, 30)]);
      await Notification.create({
        schoolId,
        recipient: recipient._id,
        sender: schoolAdmin._id,
        type: H.pick(['Fee', 'Attendance', 'Assignment', 'General']),
        title: H.pick(['Fee receipt generated', 'Attendance marked', 'New assignment posted', 'PTM reminder']),
        message: 'Please check your dashboard for details.',
        link: '/',
        isRead: i % 4 === 0,
      });
    }

    // ─── Tickets ─────────────────────────────────────────────────
    for (const t of content.TICKETS) {
      await Ticket.create({
        schoolId,
        openedBy: schoolAdmin._id,
        subject: t.subject,
        description: `${t.subject}. Reported via school admin portal.`,
        priority: t.priority,
        status: t.status,
        category: t.category,
        replies:
          t.status === 'In_Progress'
            ? [{ senderId: superAdmin._id, message: 'Our team is checking the marks sync module.', createdAt: new Date() }]
            : [],
      });
    }

    // ─── Payroll (per academic session months) ───────────────────
    for (const acYr of ctx.academicYears) {
      const yr = H.academicYearStartYear(acYr);
      for (const payrollMonth of [6, 10, 1]) {
        const calYear = payrollMonth === 1 ? yr + 1 : yr;
        for (const { teacher, user } of ctx.teachers.slice(0, 10)) {
          const basic = user.baseSalary || 35000;
          await Payroll.create({
            schoolId,
            teacherId: teacher._id,
            userId: user._id,
            month: payrollMonth,
            year: calYear,
            basicSalary: basic,
            bonus: payrollMonth === 10 ? 5000 : 1500,
            deductions: 1500,
            netSalary: basic + (payrollMonth === 10 ? 3500 : 0),
            status: acYr._id.equals(ctx.currentYear._id) && payrollMonth === 1 ? 'unpaid' : 'paid',
            paidAt: H.faker.date.between({ from: acYr.startDate, to: acYr.endDate }),
            paymentMethod: 'Bank Transfer',
            transactionId: `SAL${calYear}${payrollMonth}${H.faker.string.numeric(4)}`,
            submittedBy: schoolAdmin._id,
            remarks: `Salary — ${acYr.name}`,
          }).catch(() => {});
        }
      }
    }

    // ─── PTM, behavior, admissions, reviews ──────────────────────
    for (const title of content.PTM_TITLES) {
      const t = H.pick(ctx.teachers);
      const st = H.pick(ctx.students);
      await Meeting.create({
        schoolId,
        teacherId: t.teacher._id,
        studentId: st.student._id,
        parentId: st.parentUser._id,
        title,
        description: 'Please be on time. Carry student diary.',
        date: H.faker.date.soon({ days: 21 }),
        startTime: '10:00',
        endTime: '10:20',
        status: 'Scheduled',
        meetingType: H.pick(['Physical', 'Virtual']),
        scope: 'Individual',
        meetingLink: 'https://meet.example.com/ptm-slot',
      });
    }

    for (const enq of content.ADMISSION_ENQUIRIES) {
      await AdmissionEnquiry.create({
        schoolId,
        studentName: enq.studentName,
        parentName: enq.parentName,
        contactNumber: H.indianPhone(),
        email: H.schoolEmail(enq.parentName.split(' ')[0], enq.parentName.split(' ')[1] || 'Sharma', 'parent', content.SCHOOL.domain),
        standardApplied: ctx.standards[H.faker.number.int({ min: 0, max: 4 })]._id,
        academicYearId: ctx.currentYear._id,
        previousSchool: enq.previousSchool,
        source: enq.source,
        status: enq.status,
        notes: 'Counselling completed. Documents pending.',
        followUpDate: H.faker.date.soon({ days: 7 }),
        admissionAssignedTo: schoolAdmin._id,
      });
    }

    for (const { teacher } of ctx.teachers.slice(0, 5)) {
      await Review.create({
        schoolId,
        teacherId: teacher._id,
        reviewerId: schoolAdmin._id,
        rating: H.faker.number.int({ min: 4, max: 5 }),
        comments: 'Consistent lesson planning and good student engagement in Term I.',
      });
    }

    await Leave.create({
      schoolId,
      teacherId: ctx.teachers[0].teacher._id,
      type: 'sick',
      startDate: H.faker.date.soon({ days: 5 }),
      endDate: H.faker.date.soon({ days: 7 }),
      reason: 'Medical leave — fever',
      status: 'approved',
      actionedBy: schoolAdmin._id,
      actionedAt: new Date(),
    });

    await QuestionBank.create({
      schoolId,
      academicYearId: ctx.currentYear._id,
      teacherId: ctx.teachers[0].teacher._id,
      subject: ctx.subjects[0]._id,
      classLevel: '10',
      type: 'MCQ',
      content: 'The HCF of 12 and 18 is —',
      options: ['2', '3', '6', '9'],
      correctAnswer: '6',
      difficulty: 'Easy',
      marks: 1,
    });

    // ─── Promotion history (between sessions) ───────────────────
    for (let pi = 0; pi < ctx.academicYears.length - 1; pi++) {
      const fromAy = ctx.academicYears[pi];
      const toAy = ctx.academicYears[pi + 1];
      for (const st of ctx.students.filter((s) => s.level >= 2 && s.level <= 9).slice(0, 15)) {
        const fromLevel = H.enrollmentLevel(st.level, pi);
        const toLevel = H.enrollmentLevel(st.level, pi + 1);
        if (fromLevel >= toLevel) continue;
        await PromotionHistory.create({
          schoolId,
          studentId: st.student._id,
          fromStandard: ctx.standards.find((x) => x.level === fromLevel)?._id,
          toStandard: ctx.standards.find((x) => x.level === toLevel)?._id,
          fromAcademicYear: fromAy._id,
          toAcademicYear: toAy._id,
          promotedBy: schoolAdmin._id,
          status: 'Promoted',
          remarks: `Promoted from Class ${fromLevel} to Class ${toLevel} after ${fromAy.name} results.`,
        }).catch(() => {});
      }
    }

    await AuditLog.create({
      schoolId,
      userId: schoolAdmin._id,
      action: 'SEED_DATA',
      module: 'System',
      details: 'Database seeded with realistic demo data',
      ipAddress: '127.0.0.1',
    }).catch(() => {});

    await Backup.create({
      triggeredBy: superAdmin._id,
      fileSizeMB: 2.4,
      status: 'Relayed',
      downloadUrl: '/uploads/backups/sample-snapshot.json',
      type: 'Full',
      completedAt: new Date(),
      checksum: H.faker.string.hexadecimal({ length: 64 }),
    }).catch(() => {});

    await ResourceLocker.create({
      schoolId,
      teacherId: ctx.teachers[0].teacher._id,
      classSection: ctx.sections[0].section._id,
      subject: ctx.subjects[1]._id,
      title: 'Photosynthesis — Class VIII Notes',
      description: 'Chapter summary and diagram worksheet for Term II.',
      resourceType: 'PDF',
      fileUrl: '/uploads/documents/photosynthesis-notes.pdf',
    }).catch(() => {});

    // ─── Summary ─────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════');
    console.log('  SEED COMPLETE — Vidya Mandir, Pune');
    console.log('══════════════════════════════════════════════════');
    console.log(`  School:     ${content.SCHOOL.name}`);
    console.log(`  Subdomain:  ${content.SCHOOL.subdomain}`);
    console.log(`  Password:   ${DEFAULT_PASSWORD} (all users below)`);
    console.log('──────────────────────────────────────────────────');
    console.log(`  Super Admin:     superadmin@edumanage.in`);
    console.log(`  School Admin:    ${content.SCHOOL.adminEmail}`);
    console.log(`  Accountant:      ${ctx.staff.Accountant?.email}`);
    console.log(`  Librarian:       ${ctx.staff.Librarian?.email}`);
    console.log(`  Transport Mgr:   ${ctx.staff.Transport_Manager?.email}`);
    console.log(`  Sample student:  student.6a.01@${content.SCHOOL.domain}`);
    console.log(`  Sample parent:   (see parents with @${content.SCHOOL.domain})`);
    console.log(`  Sample teacher:  ${ctx.teachers[0]?.user?.email}`);
    console.log('──────────────────────────────────────────────────');
    console.log(`  Students:   ${ctx.students.length}`);
    console.log(`  Parents:    ${ctx.parents.length}`);
    console.log(`  Teachers:   ${ctx.teachers.length}`);
    console.log('══════════════════════════════════════════════════\n');

    console.log('  Academic sessions seeded:');
    for (const acYr of ctx.academicYears) {
      const id = acYr._id;
      const [enr, att, fees, marks, exams] = await Promise.all([
        StudentEnrollment.countDocuments({ schoolId, academicYearId: id }),
        Attendance.countDocuments({ schoolId, academicYearId: id }),
        FeePayment.countDocuments({ schoolId, academicYearId: id }),
        Mark.countDocuments({ schoolId, academicYearId: id }),
        Exam.countDocuments({ schoolId, academicYearId: id }),
      ]);
      console.log(`    ${acYr.name}: enrollments=${enr}, attendance=${att}, fees=${fees}, marks=${marks}, exams=${exams}`);
    }
    const counts = await Promise.all([
      Student.countDocuments({ schoolId }),
      StudentEnrollment.countDocuments({ schoolId }),
      FeePayment.countDocuments({ schoolId }),
      Attendance.countDocuments({ schoolId }),
      Assignment.countDocuments({ schoolId }),
      Holiday.countDocuments({ schoolId }),
    ]);
    console.log('  Totals:', {
      students: counts[0],
      enrollments: counts[1],
      feePayments: counts[2],
      attendance: counts[3],
      assignments: counts[4],
      holidays: counts[5],
    });
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seed();
}
