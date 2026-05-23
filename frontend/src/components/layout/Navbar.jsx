import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Sun, Moon, LogOut, User as UserIcon,
    Menu, X, ChevronDown, LayoutDashboard, Target,
    Code2, Trophy, Sparkles, Bot
} from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: 'Problems', path: '/problems', icon: Code2 },
        { name: 'Resume AI', path: '/resume-analyzer', icon: Sparkles },
    ];

    if (user) {
        navLinks.push(
            { name: 'Coding Tests', path: '/coding-tests', icon: Brain },
            { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
            { name: 'AI Tutor', path: '/ai-assistant', icon: Bot },
            { name: 'Mock Interview', path: '/interview-prep', icon: Target }
        );
        const role = user.role.toLowerCase();
        if (role === 'student') {
            navLinks.push({ name: 'Dashboard', path: '/student' });
            navLinks.push({ name: 'AI Report', path: '/student/skill-gap-report' });
        } else if (role === 'teacher') {
            navLinks.push({ name: 'Dashboard', path: '/teacher' });
        } else if (role === 'admin') {
            navLinks.push({ name: 'Dashboard', path: '/admin' });
        }
    }

    const isActive = (path) => location.pathname === path;

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl shadow-premium dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-light-border dark:border-white/5 py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow group-hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-light-text dark:text-dark-text group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-500 group-hover:to-accent-500 transition-all duration-300">
                            SilentSkillGap
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isActive(link.path)
                                    ? 'text-brand-600 dark:text-brand-400'
                                    : 'text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                {link.name}
                                {isActive(link.path) && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-brand-500 to-accent-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center space-x-4">

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full text-light-muted hover:text-brand-600 hover:bg-brand-50 dark:text-dark-muted dark:hover:text-brand-400 dark:hover:bg-brand-900/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            aria-label="Toggle Theme"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={isDark ? 'dark' : 'light'}
                                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </motion.div>
                            </AnimatePresence>
                        </button>

                        {/* Auth Buttons / Profile */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center space-x-2 p-1.5 pr-3 rounded-full border border-light-border dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center shadow-inner">
                                        <UserIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-semibold text-light-text dark:text-dark-text group-hover:text-brand-500 transition-colors">
                                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.username && !user.username.includes('@') ? user.username : user?.email?.split('@')[0] || 'User')}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-light-muted dark:text-dark-muted transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {profileDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-3 w-56 rounded-2xl bg-white/90 dark:bg-dark-card/95 backdrop-blur-xl border border-light-border dark:border-white/10 shadow-premium dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-light-border dark:border-white/10">
                                                <p className="text-sm font-bold text-light-text dark:text-dark-text truncate">{user.email ? user.email.split('@')[0] : 'User'}</p>
                                                <p className="text-xs text-light-muted dark:text-dark-muted truncate">{user.email || 'No email provided'}</p>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <Link to={`/${user.role.toLowerCase()}`} className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-light-text dark:text-dark-text transition-colors">
                                                    <LayoutDashboard className="w-4 h-4 mr-3 text-brand-500" />
                                                    Dashboard
                                                </Link>
                                                <Link to="/profile" className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-light-text dark:text-dark-text transition-colors">
                                                    <UserIcon className="w-4 h-4 mr-3 text-brand-500" />
                                                    My Profile
                                                </Link>
                                                {user.role.toLowerCase() === 'student' && (
                                                    <Link to="/student/skill-gap-report" className="flex items-center px-3 py-2 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-light-text dark:text-dark-text transition-colors">
                                                        <Target className="w-4 h-4 mr-3 text-accent-500" />
                                                        My AI Report
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="p-2 border-t border-light-border dark:border-white/10">
                                                <button
                                                    onClick={logout}
                                                    className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4 mr-3" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-light-text dark:text-dark-text hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                                    Log in
                                </Link>
                                <Link to="/register" className="btn-primary py-2.5 text-sm shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                                    Sign up free
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleTheme}
                            className="p-2 mr-2 rounded-full text-light-muted dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-light-text dark:text-dark-text hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-light-border dark:border-white/10 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2 max-w-7xl mx-auto mt-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${isActive(link.path)
                                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                                        : 'text-light-text dark:text-dark-text hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {!user && (
                                <div className="pt-4 border-t border-light-border dark:border-white/10 flex flex-col space-y-3 px-4">
                                    <Link to="/login" className="w-full text-center py-3 rounded-xl font-semibold text-light-text dark:text-dark-text border border-light-border dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="btn-primary w-full text-center shadow-glow">
                                        Sign up free
                                    </Link>
                                </div>
                            )}

                            {user && (
                                <div className="pt-4 border-t border-light-border dark:border-white/10 flex flex-col space-y-3 px-4">
                                    <button
                                        onClick={logout}
                                        className="w-full text-center py-3 rounded-xl font-semibold text-rose-600 dark:text-rose-400 border border-light-border dark:border-white/20 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
