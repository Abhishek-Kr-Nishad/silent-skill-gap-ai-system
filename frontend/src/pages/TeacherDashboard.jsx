import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Code2, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../components/ThemeProvider';

const classPerformance = [
    { topic: 'Algorithms', avg_score: 72 },
    { topic: 'Data Structures', avg_score: 65 },
    { topic: 'System Design', avg_score: 42 },
    { topic: 'Databases', avg_score: 80 },
];

const students = [
    { id: 1, name: 'Alex Johnson', course: 'Advanced Python', gap: 'High', strength: 'Databases', weak: 'System Design', action: 'Assign System Design Basics' },
    { id: 2, name: 'Sarah Williams', course: 'Advanced Python', gap: 'Low', strength: 'Algorithms', weak: 'Dynamic Prog', action: 'View Report' },
    { id: 3, name: 'Michael Chen', course: 'C++ Masterclass', gap: 'Moderate', strength: 'Data Structs', weak: 'Pointers', action: 'Assign Pointers Quiz' },
];

export default function TeacherDashboard() {
    const { isDark } = useTheme();

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-extrabold text-light-text dark:text-dark-text tracking-tight"
                        >
                            Instructor <span className="text-gradient">Portal</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                            className="text-light-muted dark:text-dark-muted mt-2 text-lg"
                        >
                            Manage your courses, exams, and monitor cohort analytics.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="flex space-x-4 w-full md:w-auto"
                    >
                        <button className="btn-secondary flex-1 md:flex-none flex items-center justify-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>New Course</span>
                        </button>
                        <button className="btn-primary flex-1 md:flex-none flex items-center justify-center space-x-2 shadow-glow">
                            <Code2 className="w-4 h-4" />
                            <span>New Exam</span>
                        </button>
                    </motion.div>
                </div>

                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Students', value: '142', icon: <Users className="text-blue-500" />, sub: 'Active this month' },
                        { label: 'Courses Taught', value: '4', icon: <FileText className="text-purple-500" />, sub: '2 upcoming' },
                        { label: 'Exams Created', value: '18', icon: <Code2 className="text-emerald-500" />, sub: '5 require manual grading' },
                        { label: 'Class Gap Avg', value: 'Moderate', icon: <TrendingUp className="text-amber-500" />, sub: 'System Design is lowest' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            className="premium-card p-6 flex flex-col group overflow-hidden relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            {/* Decorative background glow */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                            <div className="p-3 bg-slate-50 dark:bg-white/5 border border-light-border dark:border-white/10 rounded-2xl w-fit mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                {stat.icon}
                            </div>
                            <h3 className="text-4xl font-black text-light-text dark:text-dark-text mb-1 tracking-tighter relative z-10">{stat.value}</h3>
                            <p className="text-sm font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider relative z-10">{stat.label}</p>
                            <p className="text-xs text-light-muted/80 dark:text-dark-muted/80 mt-3 pt-3 border-t border-light-border dark:border-white/5 relative z-10">{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Class Skill Overview (Bar Chart) */}
                    <motion.div
                        className="premium-card p-6 lg:col-span-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">Class Skill Overview</h3>
                        <p className="text-sm font-medium text-light-muted dark:text-dark-muted mb-6">Average performance across all active cohorts.</p>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={classPerformance} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#1E293B' : '#E2E8F0'} />
                                    <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: isDark ? '#64748B' : '#94A3B8' }} />
                                    <YAxis type="category" dataKey="topic" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#64748B' : '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                                    <RechartsTooltip cursor={{ fill: isDark ? '#1E293B' : '#F1F5F9', opacity: 0.5 }} contentStyle={{ backgroundColor: isDark ? '#131A2A' : '#ffffff', border: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0', borderRadius: '12px' }} />
                                    <Bar dataKey="avg_score" radius={[0, 6, 6, 0]} barSize={20}>
                                        {classPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.avg_score < 50 ? '#f43f5e' : entry.avg_score > 75 ? '#10b981' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        <div className="flex justify-center flex-wrap gap-4 pt-4 border-t border-light-border dark:border-white/5 mt-2">
                            <div className="flex items-center text-xs font-bold text-light-muted uppercase tracking-wider"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500 mr-2"></span>Risk Area</div>
                            <div className="flex items-center text-xs font-bold text-light-muted uppercase tracking-wider"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500 mr-2"></span>Average</div>
                            <div className="flex items-center text-xs font-bold text-light-muted uppercase tracking-wider"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-2"></span>Strong</div>
                        </div>
                    </motion.div>

                    {/* Right: Student Action Table */}
                    <motion.div
                        className="premium-card lg:col-span-2 overflow-hidden flex flex-col"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-light-border dark:border-white/5">
                            <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Intervention Required</h3>
                            <button className="text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center group transition-colors">
                                View All Directory <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="overflow-x-auto flex-grow p-0">
                            <table className="w-full text-left whitespace-nowrap border-collapse">
                                <thead className="bg-slate-50/50 dark:bg-white/[0.02]">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Gap Risk</th>
                                        <th className="px-6 py-4 text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Weakest Topic</th>
                                        <th className="px-6 py-4 text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider text-right">Recommended Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-light-border dark:divide-white/5">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-brand-50/30 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-accent-400 flex items-center justify-center text-white font-bold shadow-sm mr-4">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-light-text dark:text-dark-text">{student.name}</p>
                                                        <p className="text-xs font-semibold text-light-muted dark:text-dark-muted mt-0.5">{student.course}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${student.gap === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' :
                                                        student.gap === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                                    }`}>
                                                    {student.gap} Risk
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-semibold text-light-muted dark:text-dark-muted">
                                                {student.weak}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                                                    {student.action}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
