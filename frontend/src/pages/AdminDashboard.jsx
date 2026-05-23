import React from 'react';

export default function AdminDashboard() {
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Admin Dashboard</h1>
            <p>Manage users, assign roles, approve teachers, and view global analytics.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button>Manage Users</button>
                <button>Platform Analytics</button>
            </div>
        </div>
    );
}
