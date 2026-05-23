import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, Circle, ArrowRight, Code2 } from 'lucide-react';
import api from '../utils/api';

export default function Problems() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            // Simulated API call if backend isn't ready, but let's try real first
            const res = await api.get('/shared/problems/');
            const data = res.data;
            if (Array.isArray(data)) {
                setProblems(data);
            } else if (data && Array.isArray(data.results)) {
                setProblems(data.results);
            } else {
                setProblems([]);
            }
        } catch (error) {
            console.error("Failed to fetch problems", error);
            // Fallback mock data for visual presentation if DB is empty/failing
            setProblems([
                { id: 1, title: 'Two Sum', difficulty: 'Easy', category: 'Arrays', tags: 'Hash Table', status: 'Solved' },
                { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', category: 'Linked List', tags: 'Math', status: 'Attempted' },
                { id: 3, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', category: 'Arrays', tags: 'Binary Search', status: 'Unsolved' },
                { id: 4, title: 'Longest Palindromic Substring', difficulty: 'Medium', category: 'Strings', tags: 'Dynamic Programming', status: 'Unsolved' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
        return matchesSearch && matchesDiff;
    });

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'Easy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'Hard': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-2xl"
                >
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-4">
                        <Code2 className="w-4 h-4" />
                        <span>Practice Coding</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-light-text dark:text-dark-text tracking-tight mb-4">
                        Coding <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">Problems</span>
                    </h1>
                    <p className="text-lg text-light-muted dark:text-dark-muted">
                        Enhance your skills with our curated list of problems spanning DSA, DBMS, OS, and more.
                    </p>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-light-border dark:border-white/5 mb-8 flex flex-col md:flex-row gap-4"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted dark:text-dark-muted" />
                    <input 
                        type="text" 
                        placeholder="Search problems..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-light-text dark:text-dark-text transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <select 
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-light-text dark:text-dark-text transition-all"
                    >
                        <option value="All">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    <button className="flex items-center space-x-2 px-4 py-2.5 bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-light-text dark:text-dark-text font-medium">
                        <Filter className="w-4 h-4" />
                        <span>More Filters</span>
                    </button>
                </div>
            </motion.div>

            {/* Problem List */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-light-border dark:border-white/5 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-light-border dark:border-white/5">
                                <th className="px-6 py-4 text-sm font-semibold text-light-muted dark:text-dark-muted">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-light-muted dark:text-dark-muted">Title</th>
                                <th className="px-6 py-4 text-sm font-semibold text-light-muted dark:text-dark-muted">Difficulty</th>
                                <th className="px-6 py-4 text-sm font-semibold text-light-muted dark:text-dark-muted">Category</th>
                                <th className="px-6 py-4 text-sm font-semibold text-light-muted dark:text-dark-muted text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-light-muted dark:text-dark-muted">
                                        Loading problems...
                                    </td>
                                </tr>
                            ) : filteredProblems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-light-muted dark:text-dark-muted">
                                        No problems found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredProblems.map((problem, index) => (
                                    <motion.tr 
                                        key={problem.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-light-border dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            {problem.status === 'Solved' ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            ) : problem.status === 'Attempted' ? (
                                                <Circle className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/problems/${problem.id}`} className="text-base font-semibold text-light-text dark:text-dark-text hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                                {problem.title}
                                            </Link>
                                            <div className="text-xs text-light-muted dark:text-dark-muted mt-1">
                                                {problem.tags}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-light-muted dark:text-dark-muted font-medium">
                                            {problem.category}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                to={`/problems/${problem.id}`}
                                                className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-light-text dark:text-dark-text hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 transition-all group-hover:scale-110"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
