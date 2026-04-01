import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ManageGrades = () => {
    const { user } = useContext(AuthContext);
    const [gradingSystems, setGradingSystems] = useState([]);
    const [selectedSystem, setSelectedSystem] = useState(null);
    const [gradeRules, setGradeRules] = useState([]);
    const [classes, setClasses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newSystem, setNewSystem] = useState({
        class_id: '',
        semester_id: ''
    });

    const [newRule, setNewRule] = useState({
        point: '',
        grade: '',
        min_mark: '',
        max_mark: ''
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
                fetchGradingSystems(currentSession.id);
                fetchSemesters(currentSession.id);
            }
        } catch (err) {
            setError('Failed to fetch initial data.');
        }
    };

    const fetchGradingSystems = async (sessionId) => {
        try {
            const res = await api.get(`/grades/systems?session_id=${sessionId}`);
            setGradingSystems(res.data.gradingSystems);
        } catch (err) {
            setError('Failed to fetch grading systems.');
        }
    };

    const fetchSemesters = async (sessionId) => {
        try {
            const res = await api.get(`/sessions/semesters?session_id=${sessionId}`);
            setSemesters(res.data.semesters);
        } catch (err) { }
    };

    const fetchGradeRules = async (systemId) => {
        setLoading(true);
        try {
            const res = await api.get(`/grades/rules?grading_system_id=${systemId}`);
            setGradeRules(res.data.gradeRules);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch grade rules.');
            setLoading(false);
        }
    };

    const handleCreateSystem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/grades/systems', { ...newSystem, session_id: selectedSession });
            fetchGradingSystems(selectedSession);
            setNewSystem({ class_id: '', semester_id: '' });
        } catch (err) {
            setError('Failed to create grading system.');
        }
    };

    const handleAddRule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/grades/rules', {
                ...newRule,
                grading_system_id: selectedSystem.id,
                session_id: selectedSession
            });
            fetchGradeRules(selectedSystem.id);
            setNewRule({ point: '', grade: '', min_mark: '', max_mark: '' });
        } catch (err) {
            setError('Failed to add grade rule.');
        }
    };

    const handleDeleteRule = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/grades/rules/${id}`);
            fetchGradeRules(selectedSystem.id);
        } catch (err) {
            setError('Failed to delete grade rule.');
        }
    };

    return (
        <div className="container-fluid py-4">
                <h2 className="mb-4">Grading Systems</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="row g-4">
                    {/* Left Column: Systems */}
                    <div className="col-md-4">
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-white"><h5 className="mb-0">Grading Systems</h5></div>
                            <div className="card-body">
                                <label className="form-label">Session</label>
                                <select className="form-select mb-3" value={selectedSession} onChange={(e) => {setSelectedSession(e.target.value); fetchGradingSystems(e.target.value);}}>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>

                                {user.role === 'admin' && (
                                    <form onSubmit={handleCreateSystem} className="mb-3 border-bottom pb-3">
                                        <div className="mb-2">
                                            <label className="form-label">Class</label>
                                            <select className="form-select" value={newSystem.class_id} onChange={(e) => setNewSystem({...newSystem, class_id: e.target.value})} required>
                                                <option value="">Select Class</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label">Semester</label>
                                            <select className="form-select" value={newSystem.semester_id} onChange={(e) => setNewSystem({...newSystem, semester_id: e.target.value})} required>
                                                <option value="">Select Semester</option>
                                                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-sm w-100">Create System</button>
                                    </form>
                                )}

                                <div className="list-group">
                                    {gradingSystems.map(gs => (
                                        <button 
                                            key={gs.id} 
                                            className={`list-group-item list-group-item-action ${selectedSystem?.id === gs.id ? 'active' : ''}`}
                                            onClick={() => {setSelectedSystem(gs); fetchGradeRules(gs.id);}}
                                        >
                                            {gs.class_name} - {gs.semester_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Rules */}
                    <div className="col-md-8">
                        {selectedSystem ? (
                            <div className="card shadow-sm">
                                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Grade Rules for {selectedSystem.class_name} ({selectedSystem.semester_name})</h5>
                                </div>
                                <div className="card-body">
                                    {user.role === 'admin' && (
                                        <form onSubmit={handleAddRule} className="row g-3 mb-4">
                                            <div className="col-md-2">
                                                <label className="form-label">Grade</label>
                                                <input type="text" className="form-control" placeholder="A+" value={newRule.grade} onChange={(e) => setNewRule({...newRule, grade: e.target.value})} required />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Point</label>
                                                <input type="number" step="0.01" className="form-control" placeholder="4.00" value={newRule.point} onChange={(e) => setNewRule({...newRule, point: e.target.value})} required />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Min Mark</label>
                                                <input type="number" className="form-control" placeholder="80" value={newRule.min_mark} onChange={(e) => setNewRule({...newRule, min_mark: e.target.value})} required />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Max Mark</label>
                                                <input type="number" className="form-control" placeholder="100" value={newRule.max_mark} onChange={(e) => setNewRule({...newRule, max_mark: e.target.value})} required />
                                            </div>
                                            <div className="col-md-2 d-flex align-items-end">
                                                <button type="submit" className="btn btn-success w-100">Add</button>
                                            </div>
                                        </form>
                                    )}

                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Grade</th>
                                                    <th>Points</th>
                                                    <th>Mark Range</th>
                                                    {user.role === 'admin' && <th>Action</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
                                                ) : gradeRules.length === 0 ? (
                                                    <tr><td colSpan="4" className="text-center py-4">No rules found.</td></tr>
                                                ) : gradeRules.map(rule => (
                                                    <tr key={rule.id}>
                                                        <td><span className="badge bg-primary px-3">{rule.grade}</span></td>
                                                        <td>{rule.point}</td>
                                                        <td>{rule.min_mark} - {rule.max_mark}</td>
                                                        {user.role === 'admin' && (
                                                            <td>
                                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRule(rule.id)}>
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card shadow-sm h-100 d-flex align-items-center justify-content-center bg-light">
                                <div className="text-center p-5">
                                    <i className="bi bi-clipboard-check display-1 text-muted"></i>
                                    <p className="mt-3 text-muted">Select a grading system to view and manage grade rules.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
    );
};

export default ManageGrades;
