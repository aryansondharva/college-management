import React, { useState, useEffect } from 'react';
import api from '../api';

const Attendance = () => {
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [filters, setFilters] = useState({
        session_id: '', class_id: '', section_id: '', course_id: '', date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const sessionRes = await api.get('/sessions');
                setSessions(sessionRes.data.sessions);
                const current = sessionRes.data.sessions.find(s => s.current);
                if (current) {
                    setFilters(prev => ({ ...prev, session_id: current.id }));
                    fetchClasses(current.id);
                }
            } catch (err) { console.error(err); }
        };
        fetchInitial();
    }, []);

    const fetchClasses = async (sessionId) => {
        const res = await api.get(`/classes?session_id=${sessionId}`);
        setClasses(res.data.classes);
    };

    const handleClassChange = async (classId) => {
        setFilters(prev => ({ ...prev, class_id: classId, section_id: '', course_id: '' }));
        const [sectRes, courseRes] = await Promise.all([
            api.get(`/sections?class_id=${classId}`),
            api.get(`/courses?class_id=${classId}`)
        ]);
        setSections(sectRes.data.sections);
        setCourses(courseRes.data.courses);
    };

    const fetchAttendanceData = async (e) => {
        e.preventDefault();
        if (!filters.session_id || !filters.class_id || !filters.section_id || !filters.date) {
            setMessage({ text: 'Please select all filters first.', type: 'danger' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            // First fetch the student list for this section
            const studentRes = await api.get('/users/students', { params: filters });
            setStudents(studentRes.data.students);

            // Then fetch existing attendance for this date
            const attendRes = await api.get('/attendance', { params: filters });
            
            // Build a structured map: studentId -> { courseId: presentStatus }
            const initialMap = {};
            studentRes.data.students.forEach(s => {
                const studentAttendances = attendRes.data.attendances.filter(a => a.student_id === s.id);
                const subjMap = {};
                
                // If it's single subject mode
                if (filters.course_id && filters.course_id !== '') {
                    const record = studentAttendances.find(a => a.course_id === parseInt(filters.course_id));
                    subjMap[filters.course_id] = record ? record.present : true;
                } else {
                    // Bulk mode: map all current class subjects
                    courses.forEach(c => {
                        const record = studentAttendances.find(a => a.course_id === c.id);
                        subjMap[c.id] = record ? record.present : true;
                    });
                }
                initialMap[s.id] = subjMap;
            });
            setAttendanceMap(initialMap);

        } catch (err) {
            console.error(err);
            setMessage({ text: 'Error fetching students or attendance.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (studentId, courseId) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [courseId]: !prev[studentId][courseId]
            }
        }));
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            const data = Object.keys(attendanceMap).map(id => ({
                student_id: parseInt(id), 
                subjects: attendanceMap[id]
            }));
            await api.post('/attendance', { ...filters, attendance_data: data, is_bulk_subjects: true });
            setMessage({ text: 'Attendance saved successfully!', type: 'success' });
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Failed to save attendance.', type: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-4"><i className="bi bi-calendar-check-fill me-2 text-primary"></i>Daily Attendance</h2>
            
            <div className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-body p-4">
                    <form className="row g-3" onSubmit={fetchAttendanceData}>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Session</label>
                            <select className="form-select border-0 bg-light" value={filters.session_id} onChange={(e) => { setFilters(prev => ({...prev, session_id: e.target.value})); fetchClasses(e.target.value); }}>
                                <option value="">Select Session</option>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Class</label>
                            <select className="form-select border-0 bg-light" value={filters.class_id} onChange={(e) => handleClassChange(e.target.value)}>
                                <option value="">Select the Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Section</label>
                            <select className="form-select border-0 bg-light" value={filters.section_id} onChange={(e) => setFilters(prev => ({...prev, section_id: e.target.value}))}>
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                             <label className="form-label small fw-bold">Date</label>
                             <input type="date" className="form-control border-0 bg-light" value={filters.date} onChange={(e) => setFilters(prev => ({...prev, date: e.target.value}))} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Subject (Optional)</label>
                            <select className="form-select border-0 bg-light" value={filters.course_id} onChange={(e) => setFilters(prev => ({...prev, course_id: e.target.value}))}>
                                <option value="">Select Subject</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
                                <i className="bi bi-person-check me-2"></i> Take Attendance
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {message.text && <div className={`alert alert-${message.type} alert-dismissible fade show border-0 shadow-sm`} role="alert">
                {message.text}
                <button type="button" className="btn-close shadow-none" onClick={() => setMessage({text:'', type:''})}></button>
            </div>}

            {students.length > 0 && (
                <div className="card shadow-sm border-0 rounded-4">
                    <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold m-0">Student Attendance List</h5>
                        <div className="text-muted small fw-bold">
                            Total Students: <span className="text-primary">{students.length}</span>
                        </div>
                    </div>
                    <div className="card-body p-0 border-top">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase">Student</th>
                                        {filters.course_id === '' ? courses.map(c => (
                                            <th key={c.id} className="py-3 border-0 text-muted small fw-bold text-uppercase text-center" style={{minWidth: '100px'}}>
                                                {c.name.split(' ').map(w => w[0]).join('')} {/* Shorten name for header */}
                                                <div style={{fontSize: '8px'}} className="text-primary mt-1">{c.name}</div>
                                            </th>
                                        )) : (
                                            <th className="py-3 border-0 text-muted small fw-bold text-uppercase text-center">Status</th>
                                        )}
                                        <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style={{width: '40px', height: '40px'}}>
                                                        {student.first_name[0]}{student.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">{student.first_name} {student.last_name}</div>
                                                        <div className="text-muted small">
                                                            {student.enrollment_no ? `Enrollment: ${student.enrollment_no}` : `ID: ${student.id}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {filters.course_id === '' ? courses.map(c => (
                                                <td key={c.id} className="py-3 text-center border-start border-end border-light">
                                                    <div className="form-check form-switch d-inline-block">
                                                        <input 
                                                            className="form-check-input shadow-none cursor-pointer" 
                                                            type="checkbox"
                                                            checked={attendanceMap[student.id]?.[c.id] || false}
                                                            onChange={() => toggleStatus(student.id, c.id)}
                                                        />
                                                    </div>
                                                    <div className={`small fw-bold ${attendanceMap[student.id]?.[c.id] ? 'text-success' : 'text-danger'}`} style={{fontSize: '9px'}}>
                                                        {attendanceMap[student.id]?.[c.id] ? 'P' : 'A'}
                                                    </div>
                                                </td>
                                            )) : (
                                                <td className="py-3 text-center">
                                                     <div className="form-check form-switch d-inline-block">
                                                        <input 
                                                            className="form-check-input shadow-none cursor-pointer" 
                                                            type="checkbox"
                                                            checked={attendanceMap[student.id]?.[filters.course_id] || false}
                                                            onChange={() => toggleStatus(student.id, filters.course_id)}
                                                        />
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-end">
                                                <span className={`badge rounded-pill ${Object.values(attendanceMap[student.id] || {}).every(v=>v) ? 'bg-success' : 'bg-warning'} px-2 py-1`} style={{fontSize: '10px'}}>
                                                    {Object.values(attendanceMap[student.id] || {}).filter(v=>v).length} / {Object.values(attendanceMap[student.id] || {}).length}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="card-footer bg-white p-4 border-0 text-end">
                        <button className="btn btn-dark px-5 py-2 fw-bold" disabled={saving} onClick={saveAttendance}>
                            {saving ? 'Saving Attendance...' : 'Submit Attendance'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
