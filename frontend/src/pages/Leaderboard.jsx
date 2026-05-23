import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Search, Flame } from 'lucide-react';
import api from '../utils/api';

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // In a real app, you would fetch from a specific leaderboard API
        // For now we mock it to demonstrate the UI
        setTimeout(() => {
            setUsers([
                { id: 1, name: 'Alice Smith', username: 'alices', score: 1450, solved: 145, streak: 12 },
                { id: 2, name: 'Bob Jones', username: 'bobj', score: 1320, solved: 130, streak: 5 },
                { id: 3, name: 'Charlie Day', username: 'cday', score: 1250, solved: 110, streak: 3 },
                { id: 4, name: 'David Lee', username: 'dlee', score: 980, solved: 85, streak: 1 },
                { id: 5, name: 'Eva Green', username: 'evag', score: 950, solved: 80, streak: 7 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-full mb-4"
                >
                    <Trophy className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-extrabold text-light-text dark:text-dark-text tracking-tight mb-4"
                >
                    Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-accent-500">Leaderboard</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-light-muted dark:text-dark-muted max-w-2xl mx-auto"
                >
                    Compete with peers, solve problems, and climb the ranks.
                </motion.p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-light-border dark:border-white/5 mb-8"
            >
                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-muted dark:text-dark-muted" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-light-text dark:text-dark-text transition-all"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/5 border-y border-light-border dark:border-white/5">
                                <th className="px-6 py-4 text-sm font-semibold text-light-muted dark:text-dark-muted w-20 text-center">Rank</th>
                                <th className="px-6 py-4 text-sm font-semibold text-light-muted dark:text-dark-muted">User</th>
                                <th className="px-6 py-4 text-sm font-semibold text-light-muted dark:text-dark-muted text-right">Score</th>
                                <th className="px-6 py-4 text-sm font-semibold text-light-muted dark:text-dark-muted text-right">Problems Solved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-light-muted dark:text-dark-muted">
                                        Loading rankings...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-light-muted dark:text-dark-muted">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <motion.tr 
                                        key={user.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-light-border dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4 text-center">
                                            {index === 0 ? <Medal className="w-6 h-6 text-yellow-400 mx-auto" /> :
                                             index === 1 ? <Medal className="w-6 h-6 text-slate-300 mx-auto" /> :
                                             index === 2 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" /> :
                                             <span className="text-lg font-bold text-light-muted dark:text-dark-muted">{index + 1}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold shadow-inner">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-light-text dark:text-dark-text group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                        {user.name}
                                                    </div>
                                                    <div className="flex items-center text-xs text-light-muted dark:text-dark-muted mt-1 space-x-2">
                                                        <span>@{user.username}</span>
                                                        {user.streak > 2 && (
                                                            <span className="flex items-center text-orange-500 font-semibold">
                                                                <Flame className="w-3 h-3 mr-0.5" />
                                                                {user.streak} day streak
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
                                                {user.score.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-light-text dark:text-dark-text">
                                            {user.solved}
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
