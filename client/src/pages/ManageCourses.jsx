import React, { useState, useEffect } from 'react';
import api from '../api';

const ManageCourses = () => {
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    
    const [newCourse, setNewCourse] = useState({ name: '', code: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchInitial = async () => {
            const sessionRes = await api.get('/sessions');
            setSessions(sessionRes.data.sessions);
            const current = sessionRes.data.sessions.find(s => s.current);
            if (current) {
                setSelectedSession(current.id);
                fetchClasses(current.id);
                fetchTeachers();
            }
        };
        fetchInitial();
    }, []);

    const fetchClasses = async (sessionId) => {
        const res = await api.get(`/classes?session_id=${sessionId}`);
        setClasses(res.data.classes);
    };

    const fetchTeachers = async () => {
        const res = await api.get('/users/teachers');
        setTeachers(res.data.teachers);
    };

    const fetchCoursesByClass = async (classId) => {
        setSelectedClassId(classId);
        setLoading(true);
        try {
            const res = await api.get(`/courses?class_id=${classId}`);
            setCourses(res.data.courses);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!selectedClassId) return;
        try {
            await api.post('/courses', { ...newCourse, class_id: selectedClassId });
            setMessage({ text: 'Course added successfully!', type: 'success' });
            setNewCourse({ name: '', code: '' });
            fetchCoursesByClass(selectedClassId);
        } catch (err) { setMessage({ text: 'Error adding course.', type: 'danger' }); }
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-4"><i className="bi bi-book-half me-2 text-primary"></i>Subject & Course Management</h2>

            <div className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-body p-4">
                    <div className="row g-3">
                         <div className="col-md-6">
                            <label className="form-label small fw-bold">Select Session</label>
                            <select className="form-select border-0 bg-light" value={selectedSession} onChange={(e) => { setSelectedSession(e.target.value); fetchClasses(e.target.value); }}>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                            </select>
                         </div>
                         <div className="col-md-6">
                            <label className="form-label small fw-bold">Select Class</label>
                            <select className="form-select border-0 bg-light" value={selectedClassId} onChange={(e) => fetchCoursesByClass(e.target.value)}>
                                <option value="">Select a Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                         </div>
                    </div>
                </div>
            </div>

            {selectedClassId ? (
                <div className="row">
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-header bg-white py-3 border-0"><h5 className="fw-bold m-0 text-primary">Add Subject</h5></div>
                            <div className="card-body p-4 border-top">
                                {message.text && <div className={`alert alert-${message.type} small`}>{message.text}</div>}
                                <form onSubmit={handleAddCourse}>
                                    <div className="mb-3"><label className="form-label small fw-bold">Subject Name</label><input type="text" className="form-control" value={newCourse.name} onChange={(e) => setNewCourse(p => ({...p, name: e.target.value}))} required /></div>
                                    <div className="mb-3"><label className="form-label small fw-bold">Subject Code</label><input type="text" className="form-control" value={newCourse.code} onChange={(e) => setNewCourse(p => ({...p, code: e.target.value}))} required /></div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2">Create Subject</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                         <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between">
                                <h5 className="fw-bold m-0">Subjects for {classes.find(c => c.id == selectedClassId)?.name}</h5>
                            </div>
                            <div className="card-body p-0 border-top">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase">Code</th>
                                                <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Name</th>
                                                <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Assign Teacher</th>
                                                <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="4" className="text-center py-5">Loading...</td></tr>
                                            ) : courses.length > 0 ? (
                                                courses.map(course => (
                                                    <tr key={course.id}>
                                                        <td className="px-4 py-3 fw-bold">{course.code}</td>
                                                        <td className="py-3">{course.name}</td>
                                                        <td className="py-3">
                                                            <div className="badge bg-primary bg-opacity-10 text-primary p-2 border border-primary border-opacity-25 rounded-3">
                                                              {course.teacher_first_name ? `${course.teacher_first_name} ${course.teacher_last_name}` : 'Not Assigned'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-end">
                                                            <button className="btn btn-sm btn-outline-warning border-0"><i className="bi bi-person-fill-add fs-5"></i></button>
                                                            <button className="btn btn-sm btn-outline-danger border-0 ms-2"><i className="bi bi-trash fs-5"></i></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="text-center py-5 text-muted">No subjects added to this class.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            ) : (
                <div className="card shadow-sm border-0 rounded-4 py-5 text-center text-muted">
                    <i className="bi bi-inbox fs-1 mb-3"></i>
                    <h5>Select a Class to manage its courses and assigned teachers.</h5>
                </div>
            )}
        </div>
    );
};

export default ManageCourses;
