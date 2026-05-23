import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CodingTests() {
    const { user } = useAuth();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await api.get('/shared/coding-tests/');
            setTests(res.data);
        } catch (error) {
            console.error("Failed to fetch coding tests", error);
            // Mock data
            setTests([
                { id: 1, title: 'Weekly Contest 350', description: 'Test your problem-solving skills with 4 new algorithmic challenges.', duration_minutes: 90, created_at: new Date().toISOString(), status: 'upcoming' },
                { id: 2, title: 'Data Structures Assessment', description: 'Mid-term assessment for Arrays, Linked Lists, and Trees.', duration_minutes: 120, created_at: new Date(Date.now() - 86400000).toISOString(), status: 'active' },
                { id: 3, title: 'Dynamic Programming Challenge', description: 'Advanced DP problems for placement preparation.', duration_minutes: 60, created_at: new Date(Date.now() - 500000000).toISOString(), status: 'completed' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-2xl"
                >
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-4">
                        <BookOpen className="w-4 h-4" />
                        <span>Assessments</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-light-text dark:text-dark-text tracking-tight mb-4">
                        Coding <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">Contests & Tests</span>
                    </h1>
                    <p className="text-lg text-light-muted dark:text-dark-muted">
                        Participate in timed contests and official assessments to prove your skills.
                    </p>
                </motion.div>
                
                {user?.role === 'TEACHER' || user?.role === 'ADMIN' ? (
                    <motion.button 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="btn-primary shadow-glow shrink-0"
                    >
                        Create New Test
                    </motion.button>
                ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-light-muted dark:text-dark-muted">Loading tests...</div>
                ) : tests.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-light-muted dark:text-dark-muted">No tests available right now.</div>
                ) : (
                    tests.map((test, index) => (
                        <motion.div 
                            key={test.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-light-border dark:border-white/5 hover:shadow-premium hover:border-brand-500/30 transition-all group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-light-text dark:text-dark-text group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                    {test.title}
                                </h3>
                                {test.status === 'active' && (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shrink-0 ml-2">
                                        Live
                                    </span>
                                )}
                                {test.status === 'completed' && (
                                    <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider shrink-0 ml-2">
                                        Ended
                                    </span>
                                )}
                            </div>
                            
                            <p className="text-sm text-light-muted dark:text-dark-muted mb-6 flex-1 line-clamp-3">
                                {test.description}
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-light-text dark:text-dark-text font-medium">
                                    <Clock className="w-4 h-4 mr-3 text-brand-500" />
                                    {test.duration_minutes} minutes
                                </div>
                                <div className="flex items-center text-sm text-light-text dark:text-dark-text font-medium">
                                    <Calendar className="w-4 h-4 mr-3 text-brand-500" />
                                    {new Date(test.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <button 
                                disabled={test.status === 'completed'}
                                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center transition-all ${
                                    test.status === 'completed' 
                                    ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                                    : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                                }`}
                            >
                                {test.status === 'completed' ? 'Test Ended' : 'Enter Test'}
                                {test.status !== 'completed' && <ArrowRight className="w-4 h-4 ml-2" />}
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
