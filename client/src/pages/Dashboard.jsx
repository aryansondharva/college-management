import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import StudentDashboard from './student/StudentDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    // Conditional rendering based on ROLE
    if (user?.role === 'admin') {
        return <AdminDashboard />;
    } else if (user?.role === 'teacher') {
        return <TeacherDashboard />;
    } else if (user?.role === 'student') {
        return <StudentDashboard />;
    }

    return (
        <div className="text-center p-5 text-muted small fw-bold bg-light rounded-4 border border-dashed">
            Preparing your personalized workspace...
        </div>
    );
};

export default Dashboard;
