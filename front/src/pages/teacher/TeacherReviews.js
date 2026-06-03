import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherReviews } from '../../redux/slice/teacher.slice';
import { Star, MessageCircle, User, Calendar, Activity, Quote, Award, CheckCircle2, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherReviews = () => {
    const dispatch = useDispatch();
    const { reviews, loading } = useSelector(state => state.teacher);
    const { activeAcademicYearId } = useSelector(state => state.academicYear || {});

    useEffect(() => {
        dispatch(fetchTeacherReviews());
    }, [dispatch, activeAcademicYearId]);

    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
        : "0.0";

    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (totalReviews > 0) {
        reviews.forEach(rev => {
            if (distribution[rev.rating] !== undefined) {
                distribution[rev.rating]++;
            }
        });
    }

    const getRatingLabel = (rating) => {
        if (rating >= 4.8) return 'Outstanding';
        if (rating >= 4.0) return 'Excellent';
        if (rating >= 3.0) return 'Satisfactory';
        return 'Needs Review';
    };

    const getBadgeStyle = (rating) => {
        if (rating === 5) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (rating === 4) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (rating === 3) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    };

    const getBadgeLabel = (rating) => {
        if (rating === 5) return 'Excellent';
        if (rating === 4) return 'Very Good';
        if (rating === 3) return 'Satisfactory';
        return 'Needs Attention';
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
            <Activity className="w-12 h-12 text-brand-primary animate-spin opacity-50" />
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse font-outfit">Loading Reviews...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-12">
            {/* Header Module */}
            <header className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
                <div className="space-y-4 flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                            <Award className="text-brand-primary" size={24} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-outfit text-white leading-none">
                            Reviews & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-indigo-400">Feedback</span>
                        </h1>
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] max-w-xl leading-relaxed">
                        View your performance ratings and official reviews from school administrators.
                    </p>
                </div>

                {/* Overall Rating Card & Star Distribution */}
                <div className="bg-slate-900/50 p-6 md:p-8 rounded-md border border-slate-800/80 shadow-2xl backdrop-blur-3xl flex flex-col sm:flex-row gap-8 items-center min-w-[280px] sm:min-w-[450px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-all duration-1000" />
                    
                    {/* Left: Score Card */}
                    <div className="text-center sm:text-left flex flex-col items-center sm:items-start shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2 italic">Overall Rating</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black text-white font-outfit tracking-tighter">{averageRating}</span>
                            <span className="text-xs font-black text-slate-600">/ 5.0</span>
                        </div>
                        <div className="flex text-luxury-amber my-2.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={15} fill={i < Math.round(Number(averageRating)) ? 'currentColor' : 'none'} />
                            ))}
                        </div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/60 px-3 py-1.5 rounded-md border border-slate-800/60 font-outfit">
                            {getRatingLabel(Number(averageRating))} ({totalReviews} Verified {totalReviews === 1 ? 'Review' : 'Reviews'})
                        </span>
                    </div>

                    {/* Divider (visible only on sm screens and up) */}
                    <div className="hidden sm:block w-px bg-slate-800/80 self-stretch" />

                    {/* Right: Distribution Bars */}
                    <div className="flex-1 w-full space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => {
                            const count = distribution[stars] || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={stars} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-500 font-outfit">
                                    <span className="w-12 text-left">{stars} Stars</span>
                                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-brand-primary to-indigo-500 rounded-full"
                                        />
                                    </div>
                                    <span className="w-6 text-right text-slate-400">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                    {reviews.map((rev, idx) => (
                        <motion.div
                            key={rev._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                            className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-md backdrop-blur-3xl shadow-xl hover:border-brand-primary/30 hover:bg-slate-900/60 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between"
                        >
                            {/* Decorative background quote icon */}
                            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                                <Quote size={140} className="text-white transform rotate-180" />
                            </div>

                            <div className="space-y-6 relative z-10">
                                {/* Review Card Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {/* Circular Avatar Frame */}
                                        <div className={`w-14 h-14 rounded-full border-2 p-0.5 shadow-xl relative overflow-hidden shrink-0 ${rev.rating >= 4 ? 'border-brand-primary/40' : 'border-slate-800'}`}>
                                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
                                                {rev.reviewerId?.photo ? (
                                                    <img src={rev.reviewerId.photo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-slate-600" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <h3 className="text-base font-black text-white uppercase tracking-tight font-outfit leading-none mb-1">
                                                {rev.reviewerId?.firstName} {rev.reviewerId?.lastName}
                                            </h3>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-outfit">
                                                    {rev.reviewerId?.role?.replace('_', ' ') || 'Administrator'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date Badge */}
                                    <div className="flex items-center gap-2 bg-slate-950/60 px-3.5 py-2 rounded-md border border-slate-800/60 shadow-inner shrink-0">
                                        <Calendar size={12} className="text-slate-600" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-outfit italic">
                                            {new Date(rev.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Review Sub-Header (Rating & Category Badge) */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/55">
                                    <div className="flex text-luxury-amber">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                    <span className={`px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest font-outfit ${getBadgeStyle(rev.rating)}`}>
                                        {getBadgeLabel(rev.rating)}
                                    </span>
                                </div>

                                {/* Review comments block */}
                                <div className="bg-slate-950/40 border border-slate-800/40 p-6 rounded-md italic relative shadow-inner">
                                    <MessageCircle size={16} className="text-brand-primary/10 absolute -top-2.5 -left-2" />
                                    <p className="text-slate-300 text-sm font-bold leading-relaxed uppercase tracking-tight max-w-full">
                                        "{rev.comments}"
                                    </p>
                                </div>
                            </div>

                            {/* Card Footer Stamp */}
                            <div className="pt-6 mt-6 border-t border-slate-800/55 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-600 font-outfit relative z-10">
                                <span className="font-mono">RECORD: #{rev._id?.toString().slice(-6).toUpperCase()}</span>
                                <span className="flex items-center gap-1.5 text-emerald-500/80 uppercase font-black">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    Verified Review
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {totalReviews === 0 && (
                    <div className="col-span-1 lg:col-span-2 py-40 text-center space-y-6 opacity-30 italic">
                        <Activity className="w-16 h-16 mx-auto mb-6 animate-pulse text-slate-500" />
                        <h3 className="text-xl font-black text-white uppercase tracking-[0.4em]">No Reviews Found</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest max-w-sm mx-auto">
                            You don't have any performance reviews yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherReviews;
