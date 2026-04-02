import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const PromoteStudents = () => {
    const { user } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [prevClasses, setPrevClasses] = useState([]);
    const [prevSections, setPrevSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [targetClasses, setTargetClasses] = useState([]);
    const [targetSections, setTargetSections] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [prevSessionId, setPrevSessionId] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [targetClass, setTargetClass] = useState('');
    const [targetSection, setTargetSection] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const sessionsRes = await api.get('/sessions');
            setSessions(sessionsRes.data.sessions);
            const currentSession = sessionsRes.data.sessions.find(s => s.is_current);
            if (currentSession) setSelectedSession(currentSession.id);
        } catch (err) {
            setError('Failed to fetch sessions.');
        }
    };

    const fetchPrevSessionData = async () => {
        if (!selectedSession) return;
        try {
            const res = await api.get(`/promotions/previous-session-data?current_session_id=${selectedSession}`);
            setPrevSessionId(res.data.previousSessionId);
            setPrevClasses(res.data.classes);
        } catch (err) {
            setError('No previous session found or failed to fetch.');
        }
    };

    const fetchPrevSectionsAndStudents = async () => {
        if (!selectedClass) return;
        try {
            const sectionsRes = await api.get(`/sections?class_id=${selectedClass}`);
            setPrevSections(sectionsRes.data.sections);
        } catch (err) {
            setError('Failed to fetch sections.');
        }
    };

    const fetchStudents = async () => {
        if (!selectedClass || !selectedSection) return;
        setLoading(true);
        try {
            const res = await api.get(`/users/students?session_id=${prevSessionId}&class_id=${selectedClass}&section_id=${selectedSection}`);
            setStudents(res.data.students);
            setSelectedStudents(res.data.students.map(s => s.id));
            
            // Also fetch target classes/sections
            const targetRes = await api.get(`/classes?session_id=${selectedSession}`);
            setTargetClasses(targetRes.data.classes);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch students.');
            setLoading(false);
        }
    };

    const fetchTargetSections = async (classId) => {
        if (!classId) return;
        try {
            const res = await api.get(`/sections?class_id=${classId}`);
            setTargetSections(res.data.sections);
        } catch (err) {
            setError('Failed to fetch target sections.');
        }
    };

    const handleToggleAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(students.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleToggleStudent = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handlePromote = async (e) => {
        e.preventDefault();
        if (selectedStudents.length === 0) {
            setError('Please select at least one student to promote.');
            return;
        }
        try {
            const promotionData = students.filter(s => selectedStudents.includes(s.id)).map(s => ({
                student_id: s.id,
                student_id_card_number: s.enrollment_no || '', 
                target_class_id: targetClass,
                target_section_id: targetSection
            }));

            await api.post('/promotions', {
                students: promotionData,
                target_session_id: selectedSession,
                target_class_id: targetClass,
                target_section_id: targetSection
            });
            alert('Students promoted successfully!');
            setStudents([]);
            setSelectedStudents([]);
            setError('');
        } catch (err) {
            setError('Failed to promote students.');
        }
    };

    return (
        <div className="container-fluid py-4">
                <h2 className="mb-4">Promote Students (Semesters 1-8)</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-white"><h5 className="mb-0">Previous Session Filters</h5></div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Current Session</label>
                                <select className="form-select" value={selectedSession} onChange={(e) => {setSelectedSession(e.target.value); fetchPrevSessionData();}}>
                                    <option value="">Select Session</option>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Previous Semester</label>
                                <select className="form-select" value={selectedClass} onChange={(e) => {setSelectedClass(e.target.value); fetchPrevSectionsAndStudents();}}>
                                    <option value="">Select Semester</option>
                                    {prevClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Previous Section</label>
                                <select className="form-select" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                    <option value="">Select Section</option>
                                    {prevSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <button className="btn btn-primary w-100" onClick={fetchStudents} disabled={!selectedSection}>Show Students</button>
                            </div>
                        </div>
                    </div>
                </div>

                {students.length > 0 && (
                    <div className="card shadow-sm">
                        <div className="card-header bg-white"><h5 className="mb-0">Target Promotion Target</h5></div>
                        <div className="card-body bg-light border-bottom">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">Target Semester</label>
                                    <select className="form-select" value={targetClass} onChange={(e) => {setTargetClass(e.target.value); fetchTargetSections(e.target.value);}} required>
                                        <option value="">Select Semester</option>
                                        {targetClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Target Section</label>
                                    <select className="form-select" value={targetSection} onChange={(e) => setTargetSection(e.target.value)} required>
                                        <option value="">Select Section</option>
                                        {targetSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4 d-flex align-items-end">
                                    <button className="btn btn-success w-100" onClick={handlePromote}>Promote All Selected</button>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th style={{width: '50px'}}><input type="checkbox" className="form-check-input" checked={students.length > 0 && selectedStudents.length === students.length} onChange={handleToggleAll} /></th>
                                        <th>Name</th>
                                        <th>Enrollment No</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td><input type="checkbox" className="form-check-input" checked={selectedStudents.includes(s.id)} onChange={() => handleToggleStudent(s.id)} /></td>
                                            <td>{s.first_name} {s.last_name}</td>
                                            <td>{s.enrollment_no || '--'}</td>
                                            <td>
                                                {selectedStudents.includes(s.id) 
                                                    ? <span className="badge bg-info">Ready to Promote</span> 
                                                    : <span className="badge bg-secondary">Stay in Current</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
    );
};

export default PromoteStudents;
