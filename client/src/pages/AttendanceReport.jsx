import React, { useState, useEffect } from 'react';
import api from '../api';

const AttendanceReport = () => {
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        session_id: '',
        class_id: '',
        section_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        fetchInitial();
    }, []);

    const fetchInitial = async () => {
        const res = await api.get('/sessions');
        setSessions(res.data.sessions);
        const current = res.data.sessions.find(s => s.current);
        if (current) {
            setFilters(prev => ({ ...prev, session_id: current.id }));
            const classRes = await api.get(`/classes?session_id=${current.id}`);
            setClasses(classRes.data.classes);
        }
    };

    const handleClassChange = async (classId) => {
        setFilters(prev => ({ ...prev, class_id: classId, section_id: '' }));
        const [sectRes, courseRes] = await Promise.all([
            api.get(`/sections?class_id=${classId}`),
            api.get(`/courses?class_id=${classId}`)
        ]);
        setSections(sectRes.data.sections);
        setCourses(courseRes.data.courses);
    };

    const generateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.get('/attendance/report', { params: filters });
            setReportData(res.data.report);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getShortName = (name) => {
        if (name.includes('Design Thinking')) return 'DT';
        if (name.includes('Maths-II')) return 'M-2';
        if (name.includes('Mechanical Engineering')) return 'BME';
        if (name.includes('Programming for Problem Solving')) return 'PPS';
        if (name.includes('Fundamental of AI')) return 'AI';
        if (name.includes('Digital Fabrication')) return 'DF';
        if (name.includes('English for Technical')) return 'ETC';
        return name.split(' ').map(w => w[0]).join('').toUpperCase();
    };

    return (
        <div className="container-fluid py-4">
            <h3 className="fw-bold mb-4">Monthly Attendance Report</h3>

            <div className="card shadow-sm border-0 mb-4 rounded-4">
                <div className="card-body p-4">
                    <form className="row g-3 items-end" onSubmit={generateReport}>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Session</label>
                            <select className="form-select bg-light border-0" value={filters.session_id} onChange={(e) => setFilters({ ...filters, session_id: e.target.value })}>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Class</label>
                            <select className="form-select bg-light border-0" value={filters.class_id} onChange={(e) => handleClassChange(e.target.value)}>
                                <option value="">Select</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Section</label>
                            <select className="form-select bg-light border-0" value={filters.section_id} onChange={(e) => setFilters({ ...filters, section_id: e.target.value })}>
                                <option value="">Select</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Month</label>
                            <select className="form-select bg-light border-0" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-primary w-100 mt-4 py-2" disabled={loading}>Generate Report</button>
                        </div>
                    </form>
                </div>
            </div>

            {reportData.length > 0 && (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle text-center mb-0">
                            <thead className="bg-dark text-white">
                                <tr>
                                    <th className="p-3" style={{ minWidth: '200px' }}>Student Name</th>
                                    {courses.map(c => (
                                        <th key={c.id} className="p-3">
                                            {getShortName(c.name)}
                                            <div style={{ fontSize: '10px' }}>{c.name}</div>
                                        </th>
                                    ))}
                                    <th className="p-3">Total / %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map(student => {
                                    let totalAttended = 0;
                                    let totalLectures = 0;
                                    return (
                                        <tr key={student.id}>
                                            <td className="text-start p-3 fw-bold ps-4">
                                                {student.name}
                                                <div className="text-muted small fw-normal">{student.enrollment_no}</div>
                                            </td>
                                            {courses.map(c => {
                                                const stats = student.subjects[c.id];
                                                if (stats) {
                                                    totalAttended += stats.attended;
                                                    totalLectures += stats.total;
                                                }
                                                return (
                                                    <td key={c.id}>
                                                        {stats ? (
                                                            <div className="fw-bold">
                                                                <span className="text-success">{stats.attended}</span>
                                                                <span className="mx-1 text-muted">/</span>
                                                                <span>{stats.total}</span>
                                                            </div>
                                                        ) : '-'}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-3">
                                                <div className="fw-bold fs-6">{totalAttended} / {totalLectures}</div>
                                                <div className={`badge ${totalLectures > 0 && (totalAttended / totalLectures) >= 0.75 ? 'bg-success' : 'bg-danger'}`}>
                                                    {totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0}%
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceReport;
