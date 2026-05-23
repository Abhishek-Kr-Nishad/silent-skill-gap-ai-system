import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Brain, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/student'); // default redirect for now
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
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000')] opacity-20 mix-blend-overlay z-0 bg-cover bg-center"></div>

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
                            Sign in to your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">learning hub.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            className="text-lg text-slate-400 max-w-md leading-relaxed font-medium"
                        >
                            Access your personalized curriculums, dive into your HackerRank-style coding sandbox, and view your diagnostic reports.
                        </motion.p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-dark-bg bg-gradient-to-br ${i === 1 ? 'from-purple-400 to-purple-600' :
                                    i === 2 ? 'from-blue-400 to-blue-600' :
                                        i === 3 ? 'from-emerald-400 to-emerald-600' :
                                            'from-amber-400 to-amber-600'
                                    } z-${10 - i} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Join 50k+ Engineers</span>
                    </div>
                </div>
            </div>

            {/* Right Form Area */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-light-bg dark:bg-dark-card transition-colors relative">
                <div className="w-full max-w-md">

                    <div className="text-center lg:text-left mb-10">
                        {/* Mobile Logo */}
                        <Link to="/" className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center shadow-glow">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-light-text dark:text-dark-text">SilentSkillGap</span>
                        </Link>

                        <h2 className="text-3xl font-extrabold text-light-text dark:text-dark-text mb-2">Welcome Back</h2>
                        <p className="text-light-muted dark:text-dark-muted font-medium">Please enter your details to sign in.</p>
                    </div>

                    <motion.form
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {error && (
                            <div className="p-3 text-sm font-semibold text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-light-muted dark:text-dark-muted mb-2 uppercase tracking-wider">Email or Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-light-muted dark:text-dark-muted group-focus-within:text-brand-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input-premium pl-12 h-14"
                                    placeholder="name@company.com or johndoe123"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Password</label>
                                <div className="text-sm">
                                    <a href="#" className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>
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
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 bg-light-bg dark:bg-[#0F1523] border-light-border dark:border-white/10 rounded focus:ring-2 focus:ring-brand-500 text-brand-500 cursor-pointer transition-colors"
                            />
                            <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-light-muted dark:text-dark-muted cursor-pointer">
                                Remember my device
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-14 text-lg flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                            {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </motion.form>

                    <p className="mt-10 text-center text-sm font-medium text-light-muted dark:text-dark-muted">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
