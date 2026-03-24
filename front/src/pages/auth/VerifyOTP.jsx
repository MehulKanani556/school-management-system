import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, forgotPassword, clearAuthMessage, clearAuthError } from '../../redux/slice/auth.slice';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, ArrowRight, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const { loading, error, message } = useSelector((state) => state.auth);
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        if (!email) navigate('/forgot-password');
        
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        
        return () => clearInterval(countdown);
    }, [email, navigate]);

    useEffect(() => {
        if (message === 'Otp Verify SuccessFully...') {
            toast.success('Security identity verified');
            navigate(`/reset-password?email=${email}`);
            dispatch(clearAuthMessage());
        }
        if (error) {
            toast.error(error);
            dispatch(clearAuthError());
        }
    }, [message, error, navigate, dispatch, email]);

    const formik = useFormik({
        initialValues: { otp: '' },
        validationSchema: Yup.object({
            otp: Yup.string().length(6, 'Must be 6 digits').required('Required'),
        }),
        onSubmit: (values) => {
            dispatch(verifyOtp({ email, otp: values.otp }));
        },
    });

    const handleResend = () => {
        if (timer === 0) {
            dispatch(forgotPassword(email));
            setTimer(60);
            toast.success('Security OTP re-issued');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 py-10 px-4 font-inter">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white mb-6 shadow-lg shadow-emerald-500/20">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Verify DNA</h2>
                        <p className="text-slate-400 text-sm">A 6-digit cryptographic security code has been transmitted to <span className="text-emerald-500 font-mono text-xs">{email}</span>.</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Security OTP</label>
                                <span className={`text-[10px] uppercase tracking-widest font-bold ${timer > 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    {timer > 0 ? `Expiry: ${timer}s` : 'Expired'}
                                </span>
                            </div>
                            <input
                                type="text"
                                maxLength={6}
                                {...formik.getFieldProps('otp')}
                                className="w-full bg-slate-800/50 border border-white/5 focus:border-emerald-500 outline-none rounded-xl py-6 text-center text-4xl tracking-[0.5em] font-black text-white placeholder-slate-800 transition-all shadow-inner"
                                placeholder="000000"
                            />
                            {formik.touched.otp && formik.errors.otp && (
                                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider text-center">{formik.errors.otp}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-500 text-slate-950 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Validate Session <ArrowRight size={18} /></>}
                            </button>

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={timer > 0 || loading}
                                className="w-full bg-transparent text-slate-400 py-3 border border-white/5 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-all active:scale-95 disabled:opacity-30"
                            >
                                <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Resend Security Sequence
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;
