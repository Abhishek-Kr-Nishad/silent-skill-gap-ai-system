import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { BookOpen, Trophy, Target, TrendingUp, PlayCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

const performanceData = [
    { name: 'W1', score: 65 }, { name: 'W2', score: 68 },
    { name: 'W3', score: 75 }, { name: 'W4', score: 82 },
    { name: 'W5', score: 80 }, { name: 'W6', score: 85 }
];

const skillData = [
    { name: 'Algorithms', score: 85, ideal: 90 },
    { name: 'Data Structs', score: 70, ideal: 85 },
    { name: 'System Design', score: 45, ideal: 75 },
    { name: 'Databases', score: 60, ideal: 80 },
];

const gapDistribution = [
    { name: 'Critical Gap', value: 15, color: '#f43f5e' }, // rose-500
    { name: 'Moderate Gap', value: 35, color: '#f59e0b' }, // amber-500
    { name: 'On Track', value: 50, color: '#10b981' }, // emerald-500
];

export default function StudentDashboard() {
    const { user } = useAuth();
    const { isDark } = useTheme();

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-24 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-5xl font-extrabold text-light-text dark:text-dark-text tracking-tight leading-tight"
                        >
                            Welcome back, <span className="text-gradient hover:blur-[2px] transition-all">
                                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.username && !user.username.includes('@') ? user.username : user?.email?.split('@')[0] || 'Student')}
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                            className="text-light-muted dark:text-dark-muted mt-2 text-lg"
                        >
                            Your AI-driven learning overview for today.
                        </motion.p>
                    </div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <Link to="/student/skill-gap-report" className="btn-primary flex items-center space-x-2 group shadow-glow">
                            <Target className="w-4 h-4" />
                            <span>Full Gap Report</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Active Courses', value: '3', icon: <BookOpen className="text-brand-500" />, trend: '+1 this week' },
                        { label: 'Exams Attempted', value: '12', icon: <Trophy className="text-amber-500" />, trend: 'Top 20% of class' },
                        { label: 'Avg Accuracy', value: '78%', icon: <Target className="text-emerald-500" />, trend: '+5% improvement' },
                        { label: 'Current Gap Lvl', value: 'Moderate', icon: <TrendingUp className="text-rose-500" />, trend: 'Needs attention in System Design' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            className="premium-card p-6 flex flex-col group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-slate-50 dark:bg-white/5 border border-light-border dark:border-white/10 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    {stat.icon}
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-light-text dark:text-dark-text mb-1 tracking-tighter">{stat.value}</h3>
                            <p className="text-sm font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xs text-light-muted/80 dark:text-dark-muted/80 mt-3 pt-3 border-t border-light-border dark:border-white/5">{stat.trend}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Line Chart: Performance */}
                    <motion.div
                        className="premium-card p-6 lg:col-span-2 group"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Performance Trend</h3>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                                +15% M/M
                            </span>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#64748B' : '#94A3B8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#64748B' : '#94A3B8' }} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: isDark ? '#131A2A' : '#ffffff', border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0', borderRadius: '12px', color: isDark ? '#F8FAFC' : '#0F172A', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 'bold' }}
                                        cursor={{ stroke: isDark ? '#334155' : '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#131A2A' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Pie Chart: Gap Distribution */}
                    <motion.div
                        className="premium-card p-6 flex flex-col"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">Gap Analytics</h3>
                        <p className="text-sm text-light-muted dark:text-dark-muted mb-4 opacity-80">AI derivation from recent exams</p>
                        <div className="h-48 w-full flex-grow relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gapDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {gapDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: isDark ? '#131A2A' : '#ffffff', border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0', borderRadius: '12px', color: isDark ? '#F8FAFC' : '#0F172A' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-2">
                                <span className="text-3xl font-black text-light-text dark:text-dark-text">15%</span>
                                <span className="text-[10px] uppercase tracking-widest text-light-muted dark:text-dark-muted font-bold">Critical</span>
                            </div>
                        </div>
                        <div className="flex justify-center flex-wrap gap-4 mt-6">
                            {gapDistribution.map((entry, i) => (
                                <div key={i} className="flex items-center text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">
                                    <span className="w-2.5 h-2.5 rounded-sm mr-2" style={{ backgroundColor: entry.color }}></span>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Area: Bar Chart & Continue Learning */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Bar Chart: Skill vs Target */}
                    <motion.div
                        className="premium-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h3 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text">Current Skills vs Target</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={skillData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                                    <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: isDark ? '#64748B' : '#94A3B8' }} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#64748B' : '#94A3B8', fontSize: 11, fontWeight: 'bold' }} />
                                    <RechartsTooltip cursor={{ fill: isDark ? '#1E293B' : '#F1F5F9', opacity: 0.5 }} contentStyle={{ backgroundColor: isDark ? '#131A2A' : '#ffffff', border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0', borderRadius: '12px' }} />
                                    <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} name="Current" />
                                    <Bar dataKey="ideal" fill={isDark ? '#334155' : '#CBD5E1'} radius={[0, 4, 4, 0]} barSize={12} name="Target" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Continue Learning */}
                    <motion.div
                        className="premium-card p-6 flex flex-col"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <h3 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text">Active Pathways</h3>
                        <div className="space-y-4 flex-grow">
                            {[
                                { course: 'Advanced Python', topic: 'List Comprehensions', progress: 65, link: '/student/coding-exam/1' },
                                { course: 'System Design', topic: 'Load Balancing (Weakness)', progress: 20, link: '#' }
                            ].map((item, i) => (
                                <div key={i} className="p-5 rounded-2xl border border-light-border dark:border-white/10 bg-slate-50 dark:bg-dark-bg/50 group hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-colors shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-light-text dark:text-dark-text group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-500 group-hover:to-accent-500 transition-all duration-300">
                                                {item.course}
                                            </h4>
                                            <p className="text-sm text-light-muted dark:text-dark-muted mt-1 font-medium">{item.topic}</p>
                                        </div>
                                        <Link to={item.link} className="p-3 bg-white dark:bg-white/5 rounded-full text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/40 border border-light-border dark:border-white/10 shadow-sm transition-all group-hover:scale-110 group-hover:-rotate-12">
                                            <PlayCircle className="w-5 h-5" />
                                        </Link>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 relative overflow-hidden">
                                        <motion.div
                                            className={`absolute top-0 left-0 h-full rounded-full ${item.progress < 50 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-brand-600 to-accent-500 shadow-glow'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.progress}%` }}
                                            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
