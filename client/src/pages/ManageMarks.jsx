import React, { useState, useEffect } from 'react';
import api from '../api';

const ManageMarks = () => {
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [marksMap, setMarksMap] = useState({});
    
    const [filters, setFilters] = useState({
        session_id: '', class_id: '', section_id: '', course_id: '', exam_type: 'Mid Term'
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchSessions = async () => {
            const res = await api.get('/sessions');
            setSessions(res.data.sessions);
            const current = res.data.sessions.find(s => s.current);
            if (current) {
                setFilters(prev => ({ ...prev, session_id: current.id }));
                fetchClasses(current.id);
            }
        };
        fetchSessions();
    }, []);

    const fetchClasses = async (sessionId) => {
        const res = await api.get(`/classes?session_id=${sessionId}`);
        setClasses(res.data.classes);
    };

    const handleClassChange = async (classId) => {
        setFilters(prev => ({ ...prev, class_id: classId, section_id: '', course_id: '' }));
        const sectionRes = await api.get(`/sections?class_id=${classId}`);
        setSections(sectionRes.data.sections);
        const courseRes = await api.get(`/courses?class_id=${classId}`);
        setCourses(courseRes.data.courses);
    };

    const fetchMarksData = async (e) => {
        e.preventDefault();
        if (!filters.course_id || !filters.section_id) {
            setMessage({ text: 'Please select Class, Section and Subject.', type: 'danger' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const studentRes = await api.get('/users/students', { params: filters });
            setStudents(studentRes.data.students);

            const marksRes = await api.get('/marks', { params: filters });
            const map = {};
            marksRes.data.marks.forEach(m => { map[m.student_id] = m.mark; });
            setMarksMap(map);
        } catch (err) { setMessage({ text: 'Error fetching data.', type: 'danger' }); }
        finally { setLoading(false); }
    };

    const handleMarkChange = (studentId, value) => {
        setMarksMap(prev => ({ ...prev, [studentId]: value }));
    };

    const saveMarks = async () => {
        setSaving(true);
        try {
            const data = Object.keys(marksMap).map(id => ({
                student_id: parseInt(id), mark: parseInt(marksMap[id]) || 0
            }));
            await api.post('/marks', { ...filters, marks_data: data });
            setMessage({ text: 'Marks saved successfully!', type: 'success' });
        } catch (err) { setMessage({ text: 'Failed to save marks.', type: 'danger' }); }
        finally { setSaving(false); }
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-4"><i className="bi bi-pencil-square me-2 text-primary"></i>Marks Management</h2>

            <div className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-body p-4">
                    <form className="row g-3" onSubmit={fetchMarksData}>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Session</label>
                            <select className="form-select border-0 bg-light" value={filters.session_id} onChange={(e) => { setFilters(prev => ({...prev, session_id: e.target.value})); fetchClasses(e.target.value); }}>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Class</label>
                            <select className="form-select border-0 bg-light" value={filters.class_id} onChange={(e) => handleClassChange(e.target.value)}>
                                <option value="">Select Class</option>
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
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Subject</label>
                            <select className="form-select border-0 bg-light" value={filters.course_id} onChange={(e) => setFilters(prev => ({...prev, course_id: e.target.value}))}>
                                <option value="">Select Subject</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                             <label className="form-label small fw-bold">Exam Type</label>
                             <select className="form-select border-0 bg-light" value={filters.exam_type} onChange={(e) => setFilters(prev => ({...prev, exam_type: e.target.value}))}>
                                <option value="Mid Term">Mid Term</option>
                                <option value="Final">Final</option>
                             </select>
                        </div>
                        <div className="col-md-1 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}><i className="bi bi-search"></i></button>
                        </div>
                    </form>
                </div>
            </div>

            {message.text && <div className={`alert alert-${message.type} border-0 shadow-sm mb-4`}>{message.text}</div>}

            {students.length > 0 && (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                    <div className="card-header bg-white py-3 border-0 d-flex justify-content-between">
                        <h5 className="fw-bold m-0">Mark Sheets - {filters.exam_type}</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-muted small fw-bold text-uppercase">
                                <tr>
                                    <th className="px-4 py-3">Student Name</th>
                                    <th className="py-3 text-center" style={{width: '200px'}}>Mark (0-100)</th>
                                    <th className="px-4 py-3 text-end">Grade Equivalent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td className="px-4 py-3 fw-bold">
                                            {student.first_name} {student.last_name}
                                            <div className="text-muted small fw-normal">{student.enrollment_no || `ID: ${student.id}`}</div>
                                        </td>
                                        <td className="py-3">
                                            <input 
                                                type="number" 
                                                className="form-control text-center py-2 fw-bold" 
                                                value={marksMap[student.id] || ''} 
                                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <span className={`badge py-2 px-3 ${marksMap[student.id] >= 40 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                               {marksMap[student.id] >= 80 ? 'A+' : marksMap[student.id] >= 70 ? 'A' : marksMap[student.id] >= 60 ? 'A-' : marksMap[student.id] >= 40 ? 'Pass' : 'Fail'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card-footer bg-white p-4 border-0 text-end">
                        <button className="btn btn-dark px-5 py-2 fw-bold shadow-sm" disabled={saving} onClick={saveMarks}>
                            {saving ? 'Saving...' : 'Submit All Marks'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMarks;
