import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [role, setRole] = useState('student');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Map role string to backend enum format (e.g. 'student' -> 'STUDENT')
        const result = await registerUser(name, username, email, password, role.toUpperCase());
        if (result.success) {
            navigate(`/${role}`); // navigate to /student or /teacher
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg transition-colors duration-300">

            {/* Left Branding Sidebar (Hidden on small screens) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-bg">
                {/* Deep, rich gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-dark-bg to-accent-900 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=1000')] opacity-20 mix-blend-overlay z-0 bg-cover bg-center"></div>

                {/* Animated glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob z-0"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>

                <div className="relative z-10 flex flex-col justify-between p-16 h-full w-full">
                    <Link to="/" className="flex items-center space-x-3 group w-fit">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center shadow-glow">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-400 group-hover:to-accent-400 transition-all duration-300">
                            SilentSkillGap
                        </span>
                    </Link>

                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="text-5xl font-extrabold text-white mb-6 leading-tight"
                        >
                            Start analyzing <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">your true potential.</span>
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            className="space-y-4 mt-8"
                        >
                            {[
                                'Free AI diagnostic exam upon entry',
                                'Personalized growth curriculum',
                                'HackerRank-style isolated execution',
                                'Actionable gap-closure feedback'
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-center text-slate-300 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3" />
                                    {benefit}
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <p className="text-sm font-semibold text-slate-400">Powered by advanced Machine Learning</p>
                    </div>
                </div>
            </div>

            {/* Right Form Area */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-light-bg dark:bg-dark-card transition-colors relative overflow-y-auto">
                <div className="w-full max-w-md py-12">

                    <div className="text-center lg:text-left mb-10">
                        {/* Mobile Logo */}
                        <Link to="/" className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center shadow-glow">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-light-text dark:text-dark-text">SilentSkillGap</span>
                        </Link>

                        <h2 className="text-3xl font-extrabold text-light-text dark:text-dark-text mb-2">Create Account</h2>
                        <p className="text-light-muted dark:text-dark-muted font-medium">Join us to bridge your skill gaps.</p>
                    </div>

                    <motion.form
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {error && (
                            <div className="p-3 text-sm font-semibold text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                                {error}
                            </div>
                        )}
                        {/* Role Selection Tabs */}
                        <div className="bg-slate-100 dark:bg-[#0F1523] p-1.5 rounded-2xl flex border border-light-border dark:border-white/5 relative mb-8">
                            <button
                                type="button"
                                className={`relative flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 z-10 ${role === 'student' ? 'text-white' : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'}`}
                                onClick={() => setRole('student')}
                            >
                                Engineering Student
                            </button>
                            <button
                                type="button"
                                className={`relative flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 z-10 ${role === 'teacher' ? 'text-white' : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'}`}
                                onClick={() => setRole('teacher')}
                            >
                                Course Instructor
                            </button>

                            {/* Sliding Background */}
                            <div
                                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-brand-600 to-accent-500 rounded-xl transition-transform duration-300 ease-out shadow-md`}
                                style={{ transform: role === 'student' ? 'translateX(0)' : 'translateX(calc(100% + 12px))' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-light-muted dark:text-dark-muted mb-2 uppercase tracking-wider">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-light-muted dark:text-dark-muted group-focus-within:text-brand-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input-premium pl-12 h-14"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-light-muted dark:text-dark-muted mb-2 uppercase tracking-wider">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-light-muted dark:text-dark-muted group-focus-within:text-brand-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input-premium pl-12 h-14"
                                    placeholder="johndoe123"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-light-muted dark:text-dark-muted mb-2 uppercase tracking-wider">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-light-muted dark:text-dark-muted group-focus-within:text-brand-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="input-premium pl-12 h-14"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-light-muted dark:text-dark-muted mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-light-muted dark:text-dark-muted group-focus-within:text-brand-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="input-premium pl-12 h-14"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <p className="mt-2 text-xs font-semibold text-light-muted dark:text-dark-muted">Must be at least 8 characters long.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-14 text-lg flex items-center justify-center group mt-4 shadow-glow disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                            {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </motion.form>

                    <p className="mt-8 text-center text-sm font-medium text-light-muted dark:text-dark-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
