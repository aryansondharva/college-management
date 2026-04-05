import React, { useEffect, useState } from 'react';
import api from '../../api';
import { io } from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [notices, setNotices] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [res, noticeRes, attendanceRes, assignmentRes] = await Promise.all([
                api.get('/users/summary'),
                api.get('/notices'),
                api.get('/attendance/today-summary'),
                api.get('/assignments')
            ]);
            setStats(res.data);
            setNotices(noticeRes.data.notices.slice(0, 3));
            setAttendanceData((attendanceRes.data.summary || []).map(item => ({
                className: `${item.class_name} ${item.section_name}`,
                present: parseInt(item.present_count || 0),
                absent: parseInt(item.absent_count || 0)
            })));
            setAssignments(assignmentRes.data.assignments.slice(0, 5));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();

        // Socket.io for Real-time Dashboard Updates
        const socket = io('https://college-management-mjul.onrender.com');
        
        socket.on('attendance-dashboard-updated', () => {
            console.log('Real-time dashboard refresh triggered!');
            fetchData();
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div className="admin-dashboard">
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                        <div className="card-body">
                            <h6 className="text-muted small fw-bold mb-1">Total Students</h6>
                            <h3 className="fw-bold">{stats.studentCount || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                        <div className="card-body">
                            <h6 className="text-muted small fw-bold mb-1">Total Teachers</h6>
                            <h3 className="fw-bold">{stats.teacherCount || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                        <h6 className="fw-bold mb-4">Real-time Attendance Overview</h6>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={attendanceData}>
                                    <defs>
                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d6efd" stopOpacity={0.1}/><stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                    <XAxis dataKey="className" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="present" stroke="#0d6efd" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h6 className="fw-bold mb-3 text-dark">Live Teacher Activity</h6>
                        <div className="d-flex flex-column gap-3">
                            {assignments.map(task => (
                                <div key={task.id} className="p-3 bg-light rounded-3 border-0">
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="fw-bold text-primary">{task.class_name} - {task.course_name}</span>
                                        <span className="text-muted">{task.teacher_first} {task.teacher_last}</span>
                                    </div>
                                    <h6 className="fw-bold mb-1 small">{task.title}</h6>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
