import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ManageExams = () => {
    const { user } = useContext(AuthContext);
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newExam, setNewExam] = useState({
        name: '',
        class_id: '',
        semester_id: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [classesRes, sessionsRes] = await Promise.all([
                api.get('/classes'),
                api.get('/sessions')
            ]);
            setClasses(classesRes.data.classes);
            setSessions(sessionsRes.data.sessions);
            const currentSession = sessionsRes.data.sessions.find(s => s.is_current);
            if (currentSession) {
                setSelectedSession(currentSession.id);
                fetchExams(currentSession.id);
                fetchSemesters(currentSession.id);
            }
        } catch (err) {
            setError('Failed to fetch initial data.');
        }
    };

    const fetchExams = async (sessionId) => {
        setLoading(true);
        try {
            const res = await api.get(`/exams?session_id=${sessionId}`);
            setExams(res.data.exams);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch exams.');
            setLoading(false);
        }
    };

    const fetchSemesters = async (sessionId) => {
        try {
            // Assuming academic-settings/semesters or similar exists
            const res = await api.get(`/sessions/semesters?session_id=${sessionId}`);
            setSemesters(res.data.semesters);
        } catch (err) {
            setError('Failed to fetch semesters.');
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            await api.post('/exams', { ...newExam, session_id: selectedSession });
            fetchExams(selectedSession);
            setNewExam({ name: '', class_id: '', semester_id: '', start_date: '', end_date: '' });
        } catch (err) {
            setError('Failed to create exam.');
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/exams/${id}`);
            fetchExams(selectedSession);
        } catch (err) {
            setError('Failed to delete exam.');
        }
    };

    return (
        <div className="container-fluid py-4">
                <h2 className="mb-4">Exams Management</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <label className="form-label">Filter by Session</label>
                        <select className="form-select w-25" value={selectedSession} onChange={(e) => {setSelectedSession(e.target.value); fetchExams(e.target.value);}}>
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                {user.role === 'admin' && (
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-white"><h5 className="mb-0">Create New Exam</h5></div>
                        <div className="card-body">
                            <form onSubmit={handleCreateExam} className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label">Exam Name</label>
                                    <input type="text" className="form-control" value={newExam.name} onChange={(e) => setNewExam({...newExam, name: e.target.value})} required placeholder="Mid Term 2024" />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Class</label>
                                    <select className="form-select" value={newExam.class_id} onChange={(e) => setNewExam({...newExam, class_id: e.target.value})} required>
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Semester</label>
                                    <select className="form-select" value={newExam.semester_id} onChange={(e) => setNewExam({...newExam, semester_id: e.target.value})} required>
                                        <option value="">Select Semester</option>
                                        {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Start Date</label>
                                    <input type="date" className="form-control" value={newExam.start_date} onChange={(e) => setNewExam({...newExam, start_date: e.target.value})} required />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">End Date</label>
                                    <input type="date" className="form-control" value={newExam.end_date} onChange={(e) => setNewExam({...newExam, end_date: e.target.value})} required />
                                </div>
                                <div className="col-md-1 d-flex align-items-end">
                                    <button type="submit" className="btn btn-success w-100">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="card shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Semester</th>
                                    <th>Dates</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                                ) : exams.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4">No exams found.</td></tr>
                                ) : exams.map(exam => (
                                    <tr key={exam.id}>
                                        <td>{exam.name}</td>
                                        <td>{classes.find(c => c.id === exam.class_id)?.name || 'N/A'}</td>
                                        <td>{semesters.find(s => s.id === exam.semester_id)?.name || 'N/A'}</td>
                                        <td>{new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}</td>
                                        <td>
                                            {user.role === 'admin' && (
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteExam(exam.id)}>Delete</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    );
};

export default ManageExams;
