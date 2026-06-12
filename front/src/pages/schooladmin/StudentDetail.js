import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentDetail, downloadReportCard } from '../../redux/slice/schoolAdmin.slice';


import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, GraduationCap, 
  User, CheckCircle, XCircle, FileText, DollarSign, Clock,
  ChevronRight, Award, BarChart3, BookOpen, AlertCircle
} from 'lucide-react';
import moment from 'moment';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { studentDetail, loading } = useSelector((s) => s.schoolAdmin);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchStudentDetail(id));
  }, [dispatch, id]);

  if (loading && !studentDetail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading Student Profile...</p>
        </div>
      </div>
    );
  }

  if (!studentDetail) return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="w-16 h-16 rounded bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shadow-lg">
         <AlertCircle size={32} />
      </div>
      <div>
        <h3 className="text-xl font-black uppercase text-white font-outfit">Student Not Found</h3>
        <p className="text-slate-500 text-sm">The specified student could not be located in our records.</p>
      </div>
      <button 
        onClick={() => navigate('/school-admin/students')}
        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-black text-[10px] uppercase tracking-widest transition-all"
      >
        Back to Students
      </button>
    </div>
  );

  const { student, attendance, exams, fees, submissions } = studentDetail;

  const stats = [
    { label: 'Attendance', value: `${attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100) : 0}%`, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Avg Grade', value: `${exams.length > 0 ? Math.round(exams.reduce((acc, e) => acc + (e.score / e.maxMarks), 0) / exams.length * 100) : 0}%`, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Fee Status', value: fees.every(f => f.status === 'paid') ? 'Cleared' : 'Pending', icon: DollarSign, color: fees.every(f => f.status === 'paid') ? 'text-schooladmin-primary' : 'text-amber-400', bg: fees.every(f => f.status === 'paid') ? 'bg-schooladmin-primary/10' : 'bg-amber-400/10' },
    { label: 'Avg Attendance', value: `${attendance.filter(a => a.status === 'Present').length} / ${attendance.length}`, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'performance', label: 'Grades', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'financials', label: 'Fees', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/school-admin/students')}
          className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-md text-slate-400 hover:text-white transition-all shadow-lg"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">Student Profile</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">ID: {id}</p>
        </div>
      </div>

      {/* Profile Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <img 
                src={student.photo || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random&size=200`}
                className="w-32 h-32 md:w-40 md:h-40 rounded-md object-cover border-2 border-brand-border shadow-2xl"
                alt="Profile"
              />
              <div className="absolute -bottom-2 -right-2 bg-brand-primary px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider shadow-lg">
                Active student
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-1 font-outfit">{student.firstName} {student.lastName}</h2>
                <p className="text-brand-primary font-black uppercase tracking-[0.2em] text-[10px]">Admission No: {student.admissionNumber}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                <div className="flex items-center gap-3 text-slate-400">
                  <GraduationCap size={16} className="text-slate-600" />
                  <span className="text-sm font-medium">Grade {student.standard?.level || 'N/A'}-{student.classSection?.sectionLabel || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar size={16} className="text-slate-600" />
                  <span className="text-sm font-medium">Born: {moment(student.dateOfBirth).format('DD MMM YYYY')}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail size={16} className="text-slate-600" />
                  <span className="text-sm font-medium">{student.guardianEmail || 'No Email Linked'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone size={16} className="text-slate-600" />
                  <span className="text-sm font-medium">{student.guardianContact || 'No Contact Provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 md:col-span-2">
                  <MapPin size={16} className="text-slate-600" />
                  <span className="text-sm font-medium">{student.address || 'Address not registered'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md p-4 flex flex-col justify-between group hover:border-brand-primary/40 transition-all">
              <div className={`w-8 h-8 rounded ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white font-outfit">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-1 bg-brand-surface/20 p-1 rounded-md border border-brand-border/20 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-wider transition-all
              ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-brand-border/40 pb-4 mb-6 flex items-center gap-3">
                  <User size={16} className="text-brand-primary" /> Guardian Details
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Guardian Name</p>
                      <p 
                        className={`font-bold transition-all ${student.parentId ? 'text-white hover:text-brand-primary cursor-pointer hover:italic' : 'text-white'}`}
                        onClick={() => student.parentId && navigate(`/school-admin/profile/${student.parentId?._id || student.parentId}`)}
                      >
                        {student.guardianName || '—'}
                        {student.parentId && <span className="ml-2 text-[8px] px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded uppercase tracking-tighter">Verified Parent</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Guardian Phone</p>
                      <p className="text-white font-bold">{student.guardianContact || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Email Address</p>
                      <p className="text-white font-bold">{student.guardianEmail || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-brand-border/40 pb-4 mb-6 flex items-center gap-3">
                  <AlertCircle size={16} className="text-brand-primary" /> Quick Actions
                </h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => dispatch(downloadReportCard({ id: student._id, name: `${student.firstName}_${student.lastName}` }))}
                    className="w-full flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-md group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <FileText size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-widest text-white">Download report card</p>
                        <p className="text-[10px] text-slate-500 font-medium">Export grade summary as PDF</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                  </button>

                  <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-md">
                    <p className="text-xs text-brand-primary leading-relaxed">
                      System Note: All changes are logged for security auditing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-border/30">
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Assessment</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Score</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Max</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Percentage</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No academic records found.</td></tr>
                  ) : exams.map((exam, i) => (
                    <tr key={i} className="border-b border-brand-border/20 hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-white text-sm">{exam.title}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{exam.subject}</td>
                      <td className="px-6 py-4 text-center font-black text-brand-primary">{exam.score}</td>
                      <td className="px-6 py-4 text-center text-slate-500">{exam.maxMarks}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black
                          ${(exam.score/exam.maxMarks) >= 0.8 ? 'bg-emerald-500/10 text-emerald-400' : 
                            (exam.score/exam.maxMarks) >= 0.4 ? 'bg-schooladmin-primary/10 text-schooladmin-primary' : 'bg-red-500/10 text-red-400'}`}>
                          {exam.maxMarks > 0 ? Math.round((exam.score / exam.maxMarks) * 100) : 0}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs italic">{exam.remarks || 'No remarks recorded'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-border/30">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Log Date</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr><td colSpan={2} className="px-6 py-12 text-center text-slate-500 italic">No attendance records found.</td></tr>
                    ) : attendance.map((att, i) => (
                      <tr key={i} className="border-b border-brand-border/20 hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-300">{moment(att.date).format('DD MMMM YYYY')}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                            ${att.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 
                              att.status === 'Absent' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>
                            {att.status === 'Present' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-6">
                <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md p-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Attendance Summary</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Presents</span>
                    <span className="text-xs text-emerald-400 font-black">{attendance.filter(a => a.status === 'Present').length}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400">Absents</span>
                    <span className="text-xs text-red-400 font-black">{attendance.filter(a => a.status === 'Absent').length}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                      style={{ width: `${attendance.length > 0 ? (attendance.filter(a => a.status === 'Present').length / attendance.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-800/20 border border-brand-border/20 rounded-md text-center">
                  <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    Attendance records display details from the last 90 days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="bg-brand-surface/40 backdrop-blur-xl border border-brand-border/40 rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-border/30">
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Transaction ID</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Fee Component</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Due Date</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Paid</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No fee records found.</td></tr>
                  ) : fees.map((fee, i) => (
                    <tr key={i} className="border-b border-brand-border/20 hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{fee._id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-bold text-white text-sm">{fee.title}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{moment(fee.dueDate).format('DD MMM YYYY')}</td>
                      <td className="px-6 py-4 text-center text-white font-black">₹{fee.totalAmount}</td>
                      <td className="px-6 py-4 text-center text-brand-primary">₹{fee.paidAmount}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest
                          ${fee.status === 'paid' ? 'bg-schooladmin-primary/10 text-schooladmin-primary border border-schooladmin-primary/20' : 
                            fee.status === 'overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {fee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StudentDetail;
