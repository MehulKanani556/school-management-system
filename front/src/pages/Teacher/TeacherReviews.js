import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherReviews } from '../../redux/slice/teacher.slice';
import { Star, MessageCircle, User, Calendar, Activity, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherReviews = () => {
    const dispatch = useDispatch();
    const { reviews, loading } = useSelector(state => state.teacher);

    useEffect(() => {
        dispatch(fetchTeacherReviews());
    }, [dispatch]);

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <Activity className="w-12 h-12 text-brand-primary animate-spin opacity-50" />
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse">Retrieving Institutional Feedback</p>
        </div>
    );

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-[2px] w-12 bg-brand-primary rounded-md"></div>
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.45em] italic">Professional Archive</span>
                    </div>
                    <h1 className="text-4xl text-left font-black text-white italic uppercase tracking-tighter leading-none font-outfit">Reviews & Feedback</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest max-w-xl italic">Archived performance evaluations and institutional directives from authorized administrators.</p>
                </div>

                <div className="bg-slate-900/60 p-8 rounded-md border border-slate-800/80 shadow-2xl backdrop-blur-3xl min-w-[250px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-all"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 italic">Institutional Index</p>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-black text-white italic">{averageRating}</span>
                        <div className="flex flex-col">
                            <div className="flex text-luxury-amber mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < Math.round(averageRating) ? 'currentColor' : 'none'} />
                                ))}
                            </div>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{reviews.length} Validated Records</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <AnimatePresence mode="popLayout">
                    {reviews.map((rev, idx) => (
                        <motion.div
                            key={rev._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-900/40 border border-slate-800/60 p-10 rounded-md backdrop-blur-3xl shadow-xl hover:border-brand-primary/20 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Quote size={120} className="text-white" />
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-10 relative z-10">
                                <div className="space-y-6">
                                    <div className="w-20 h-20 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden">
                                        {rev.reviewerId?.photo ? <img src={rev.reviewerId.photo} className="w-full h-full object-cover" /> : <User size={30} className="text-slate-700" />}
                                        <div className="absolute top-0 left-0 w-full h-full bg-brand-primary/5"></div>
                                    </div>
                                    <div className="flex text-luxury-amber">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} className="shadow-glow" />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{rev.reviewerId?.firstName} {rev.reviewerId?.lastName}</h3>
                                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] italic">Authority: {rev.reviewerId?.role?.replace('_', ' ')}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-950/60 px-4 py-2 rounded-md border border-slate-800/60 shadow-inner">
                                            <Calendar size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{new Date(rev.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/40 border border-slate-800/40 p-8 rounded-md italic relative">
                                        <MessageCircle size={20} className="text-brand-primary/20 absolute -top-3 -left-3" />
                                        <p className="text-slate-300 text-lg font-bold leading-relaxed uppercase tracking-tight">{rev.comments}</p>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-slate-700">
                                        <span>Institutional Verification Protocol ST-99</span>
                                        <span className="group-hover:text-brand-primary transition-colors">Digital Signature Validated</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {reviews.length === 0 && (
                    <div className="py-40 text-center space-y-6 opacity-30 italic">
                        <Activity className="w-16 h-16 mx-auto mb-6 animate-pulse" />
                        <h3 className="text-xl font-black text-white uppercase tracking-[0.4em]">No Evaluative Records</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest max-w-sm mx-auto">Archival logs are currently empty. Awaiting institutional performance review cycle.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherReviews;
