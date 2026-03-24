import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearAuthMessage, clearAuthError } from '../../redux/slice/auth.slice';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2, ArrowRight, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (message === 'Email Sent Successfully...') {
            toast.success('Security OTP sent to your email');
            navigate(`/verify-otp?email=${formik.values.email}`);
            dispatch(clearAuthMessage());
        }
        if (error) {
            toast.error(error);
            dispatch(clearAuthError());
        }
    }, [message, error, navigate, dispatch]);

    const formik = useFormik({
        initialValues: { email: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
        }),
        onSubmit: (values) => {
            dispatch(forgotPassword(values.email));
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 py-10 px-4 font-inter">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white mb-6 shadow-lg shadow-blue-500/20">
                            <Key size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Lost Key?</h2>
                        <p className="text-slate-400 text-sm">Initiate secure identity recovery. Enter your registered email to receive a temporary access code.</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 ml-1">Registered Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    {...formik.getFieldProps('email')}
                                    className="w-full bg-slate-800/50 border border-white/5 focus:border-blue-500 outline-none rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 transition-all shadow-inner"
                                    placeholder="name@institution.edu"
                                />
                            </div>
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider ml-1">{formik.errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-slate-950 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Generate OTP <ArrowRight size={18} /></>}
                        </button>

                        <div className="text-center mt-6">
                            <Link to="/login" className="text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-bold">Back to Identification</Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
