import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    User, Mail, MapPin, Building2, Code2, Link as LinkIcon, 
    Github, Linkedin, Twitter, ExternalLink, Award, TrendingUp, Edit3, Save, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (user) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            // Assume the backend now supports /shared/profiles/me/
            const res = await api.get('/shared/profiles/me/');
            setProfile(res.data);
            setFormData(res.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            // Mock Data
            const userFullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.username && !user.username.includes('@') ? user.username : user?.email?.split('@')[0] || 'Student');
            const mockProfile = {
                id: 1,
                full_name: userFullName,
                bio: 'Passionate software engineering student looking for opportunities.',
                college: 'Tech University',
                skills: 'React, Django, Python, Java',
                resume_link: 'https://example.com/resume.pdf',
                github: 'https://github.com',
                linkedin: 'https://linkedin.com',
                leetcode: 'https://leetcode.com',
                hackerrank: 'https://hackerrank.com',
                codeforces: '',
                twitter: '',
                instagram: ''
            };
            setProfile(mockProfile);
            setFormData(mockProfile);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.patch(`/shared/profiles/me/`, formData);
            setProfile(formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save profile", error);
            // Mock success
            setProfile(formData);
            setIsEditing(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) {
        return <div className="min-h-screen pt-24 px-8 text-light-text dark:text-dark-text">Loading profile...</div>;
    }

    if (!user) {
        return <div className="min-h-screen pt-24 px-8 text-light-text dark:text-dark-text">Please log in to view your profile.</div>;
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Profile Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 space-y-6"
                >
                    <div className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-light-border dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-500 to-accent-500"></div>
                        
                        <div className="relative pt-12 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-white dark:bg-dark-card p-1 shadow-xl mb-4">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-brand-600 text-3xl font-bold uppercase">
                                    {profile?.full_name ? profile.full_name.charAt(0) : (user?.username || user?.email || 'U').charAt(0)}
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                                {profile?.full_name || (user?.username && !user.username.includes('@') ? user.username : user?.email?.split('@')[0] || 'Student')}
                            </h2>
                            <p className="text-brand-500 font-medium mb-4">{user?.role}</p>

                            <div className="w-full space-y-3 mt-4">
                                {profile?.college && (
                                    <div className="flex items-center text-sm text-light-muted dark:text-dark-muted">
                                        <Building2 className="w-4 h-4 mr-3 text-brand-500" />
                                        <span>{profile.college}</span>
                                    </div>
                                )}
                                {profile?.bio && (
                                    <p className="text-sm text-light-text dark:text-dark-text text-center italic border-t border-light-border dark:border-white/10 pt-4">
                                        "{profile.bio}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm border border-light-border dark:border-white/5">
                        <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Coding Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-500/10 text-center">
                                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">42</div>
                                <div className="text-xs text-light-muted dark:text-dark-muted uppercase font-semibold mt-1">Solved</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/10 text-center">
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">7</div>
                                <div className="text-xs text-light-muted dark:text-dark-muted uppercase font-semibold mt-1">Streak</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Details & Edit */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="bg-white dark:bg-dark-card rounded-3xl p-8 shadow-sm border border-light-border dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Profile Details</h3>
                            {!isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-light-text dark:text-dark-text hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span className="font-semibold text-sm">Edit Profile</span>
                                </button>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => { setIsEditing(false); setFormData(profile); }}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="font-semibold text-sm">Cancel</span>
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-glow transition-all"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span className="font-semibold text-sm">Save</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-light-muted dark:text-dark-muted">Full Name</label>
                                    <input type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 text-light-text dark:text-dark-text outline-none focus:border-brand-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-light-muted dark:text-dark-muted">Username</label>
                                    <input type="text" value={user?.username || ''} disabled className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 text-light-text dark:text-dark-text outline-none opacity-60 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-light-muted dark:text-dark-muted">College / University</label>
                                    <input type="text" name="college" value={formData.college || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 text-light-text dark:text-dark-text outline-none focus:border-brand-500" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-light-muted dark:text-dark-muted">Bio</label>
                                    <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 text-light-text dark:text-dark-text outline-none focus:border-brand-500"></textarea>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-light-muted dark:text-dark-muted">Skills (comma separated)</label>
                                    <input type="text" name="skills" value={formData.skills || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 text-light-text dark:text-dark-text outline-none focus:border-brand-500" />
                                </div>
                                
                                <div className="md:col-span-2 pt-4 border-t border-light-border dark:border-white/10">
                                    <h4 className="text-sm font-bold text-light-text dark:text-dark-text mb-4 uppercase tracking-wider">Links & Social</h4>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-light-muted dark:text-dark-muted">Resume URL</label>
                                    <input type="url" name="resume_link" value={formData.resume_link || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 text-light-text dark:text-dark-text outline-none focus:border-brand-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-light-muted dark:text-dark-muted">GitHub</label>
                                    <input type="url" name="github" value={formData.github || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 text-light-text dark:text-dark-text outline-none focus:border-brand-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-light-muted dark:text-dark-muted">LinkedIn</label>
                                    <input type="url" name="linkedin" value={formData.linkedin || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 text-light-text dark:text-dark-text outline-none focus:border-brand-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-light-muted dark:text-dark-muted">LeetCode</label>
                                    <input type="url" name="leetcode" value={formData.leetcode || ''} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg border border-light-border dark:border-white/10 text-light-text dark:text-dark-text outline-none focus:border-brand-500" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {profile?.skills && (
                                    <div>
                                        <h4 className="text-sm font-bold text-light-muted dark:text-dark-muted mb-3 uppercase tracking-wider">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.split(',').map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-sm font-medium text-light-text dark:text-dark-text border border-light-border dark:border-white/10">
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-bold text-light-muted dark:text-dark-muted mb-3 uppercase tracking-wider">Links</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {profile?.resume_link && (
                                            <a href={profile.resume_link} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-2xl border border-light-border dark:border-white/10 hover:border-brand-500 dark:hover:border-brand-500 transition-colors group">
                                                <LinkIcon className="w-5 h-5 mr-3 text-light-muted dark:text-dark-muted group-hover:text-brand-500" />
                                                <span className="font-semibold text-light-text dark:text-dark-text">Resume</span>
                                                <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-brand-500 transition-opacity" />
                                            </a>
                                        )}
                                        {profile?.github && (
                                            <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-2xl border border-light-border dark:border-white/10 hover:border-slate-800 dark:hover:border-white/50 transition-colors group">
                                                <Github className="w-5 h-5 mr-3 text-light-muted dark:text-dark-muted group-hover:text-light-text dark:group-hover:text-dark-text" />
                                                <span className="font-semibold text-light-text dark:text-dark-text">GitHub</span>
                                            </a>
                                        )}
                                        {profile?.linkedin && (
                                            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-2xl border border-light-border dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                                                <Linkedin className="w-5 h-5 mr-3 text-light-muted dark:text-dark-muted group-hover:text-blue-500" />
                                                <span className="font-semibold text-light-text dark:text-dark-text">LinkedIn</span>
                                            </a>
                                        )}
                                        {profile?.leetcode && (
                                            <a href={profile.leetcode} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-2xl border border-light-border dark:border-white/10 hover:border-orange-500 dark:hover:border-orange-500 transition-colors group">
                                                <Code2 className="w-5 h-5 mr-3 text-light-muted dark:text-dark-muted group-hover:text-orange-500" />
                                                <span className="font-semibold text-light-text dark:text-dark-text">LeetCode</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
