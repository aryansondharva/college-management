import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const EXAM_TYPES = [
    { key: 'midterm', label: 'Mid Term', color: '#f59e0b', bg: '#fffbeb' },
    { key: 'final', label: 'Final Exam', color: '#ef4444', bg: '#fef2f2' },
    { key: 'practical', label: 'Practical / Lab', color: '#8b5cf6', bg: '#f5f3ff' },
    { key: 'internal', label: 'Internal / CT', color: '#3b82f6', bg: '#eff6ff' },
    { key: 'supplementary', label: 'Supplementary', color: '#64748b', bg: '#f8fafc' },
];

const getExamType = (type) => EXAM_TYPES.find(t => t.key === type) || EXAM_TYPES[0];

const ManageExams = () => {
    const { user, hasPermission } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('exams');
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [examRules, setExamRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showRulesForm, setShowRulesForm] = useState(false);

    const [newExam, setNewExam] = useState({
        name: '',
        class_id: '',
        start_date: '',
        end_date: '',
        exam_type: 'midterm',
        total_marks: 100,
        pass_marks: 40,
    });

    const [newRule, setNewRule] = useState({
        total_marks: 100,
        pass_marks: 40,
        credit_hours: 3
    });

    const canManage = hasPermission('create exams') || user?.role === 'admin';

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
            const currentSession = sessionsRes.data.sessions.find(s => s.current);
            if (currentSession) {
                setSelectedSession(currentSession.id);
                fetchExams(currentSession.id);
            }
        } catch (err) {
            setError('Failed to fetch initial data.');
        }
    };

    const fetchExams = async (sessionId) => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const res = await api.get(`/exams?session_id=${sessionId}`);
            setExams(res.data.exams);
        } catch (err) {
            setError('Failed to fetch exams.');
        } finally {
            setLoading(false);
        }
    };

    const fetchExamRules = async (examId) => {
        if (!examId) return;
        try {
            const res = await api.get(`/exams/rules?exam_id=${examId}`);
            setExamRules(res.data.exam_rules);
        } catch (err) {
            setError('Failed to fetch exam rules.');
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            await api.post('/exams', { ...newExam, session_id: selectedSession });
            fetchExams(selectedSession);
            setNewExam({ name: '', class_id: '', start_date: '', end_date: '', exam_type: 'midterm', total_marks: 100, pass_marks: 40 });
            setShowForm(false);
        } catch (err) {
            setError('Failed to create exam.');
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;
        try {
            await api.delete(`/exams/${id}`);
            fetchExams(selectedSession);
            if (selectedExam === String(id)) {
                setSelectedExam('');
                setExamRules([]);
            }
        } catch (err) {
            setError('Failed to delete exam.');
        }
    };

    const handleSelectExam = (exam) => {
        setSelectedExam(String(exam.id));
        fetchExamRules(exam.id);
        setActiveTab('rules');
    };

    const handleAddRule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/exams/rules', { ...newRule, exam_id: selectedExam });
            fetchExamRules(selectedExam);
            setNewRule({ total_marks: 100, pass_marks: 40, credit_hours: 3 });
            setShowRulesForm(false);
        } catch (err) {
            setError('Failed to add exam rule.');
        }
    };

    const getExamStatus = (exam) => {
        if (!exam.start_date) return { label: 'Scheduled', cls: 'bg-secondary bg-opacity-10 text-secondary' };
        const now = new Date();
        const start = new Date(exam.start_date);
        const end = new Date(exam.end_date);
        if (now > end) return { label: 'Completed', cls: 'bg-dark bg-opacity-10 text-dark' };
        if (now < start) return { label: 'Upcoming', cls: 'bg-primary bg-opacity-10 text-primary' };
        return { label: 'Ongoing', cls: 'bg-success bg-opacity-10 text-success' };
    };

    const selectedExamObj = exams.find(e => String(e.id) === selectedExam);

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold m-0"><i className="bi bi-journal-text me-2 text-dark"></i>Exam & Grading Rules</h3>
                    <p className="text-muted small m-0 mt-1">Schedule examinations and configure grading rules per exam</p>
                </div>
                <div className="d-flex gap-3 align-items-center flex-wrap">
                    <select
                        className="form-select border-0 bg-light shadow-none fw-medium"
                        style={{minWidth: '180px'}}
                        value={selectedSession}
                        onChange={(e) => { setSelectedSession(e.target.value); fetchExams(e.target.value); setSelectedExam(''); setExamRules([]); }}
                    >
                        <option value="">Select Session</option>
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.session} {s.current ? '(Current)' : ''}</option>)}
                    </select>
                    {canManage && activeTab === 'exams' && (
                        <button className="btn btn-dark fw-medium px-4 py-2 shadow-none rounded-3" onClick={() => setShowForm(!showForm)}>
                            <i className={`bi bi-${showForm ? 'dash-lg' : 'plus-lg'} me-2`}></i>
                            {showForm ? 'Cancel' : 'New Exam'}
                        </button>
                    )}
                    {canManage && activeTab === 'rules' && selectedExam && (
                        <button className="btn btn-dark fw-medium px-4 py-2 shadow-none rounded-3" onClick={() => setShowRulesForm(!showRulesForm)}>
                            <i className={`bi bi-${showRulesForm ? 'dash-lg' : 'gear'} me-2`}></i>
                            {showRulesForm ? 'Cancel' : 'Set Grading Rule'}
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="alert alert-danger border-0 rounded-3 shadow-sm">{error}</div>}

            {/* Tabs */}
            <div className="d-flex gap-2 mb-4">
                <button
                    className={`btn rounded-3 fw-medium px-4 shadow-none ${activeTab === 'exams' ? 'btn-dark' : 'btn-light'}`}
                    onClick={() => setActiveTab('exams')}
                ><i className="bi bi-calendar-week me-2"></i>Examinations</button>
                <button
                    className={`btn rounded-3 fw-medium px-4 shadow-none ${activeTab === 'rules' ? 'btn-dark' : 'btn-light'}`}
                    onClick={() => setActiveTab('rules')}
                >
                    <i className="bi bi-gear me-2"></i>Grading Rules
                    {selectedExamObj && <span className="badge bg-primary bg-opacity-20 text-primary ms-2 rounded-pill fw-bold small">{selectedExamObj.name}</span>}
                </button>
            </div>

            {/* === EXAMS TAB === */}
            {activeTab === 'exams' && (
                <>
                    {showForm && (
                        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                            <div className="card-header bg-white border-bottom px-4 py-3">
                                <h6 className="fw-bold mb-0">Create New Exam</h6>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleCreateExam}>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Exam Name</label>
                                            <input type="text" className="form-control bg-light border-0 shadow-none" placeholder="e.g. Mid Term Examination 2025" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} required />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label small fw-bold text-muted">Class</label>
                                            <select className="form-select bg-light border-0 shadow-none" value={newExam.class_id} onChange={e => setNewExam({...newExam, class_id: e.target.value})} required>
                                                <option value="">Select</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label small fw-bold text-muted">Exam Type</label>
                                            <select className="form-select bg-light border-0 shadow-none" value={newExam.exam_type} onChange={e => setNewExam({...newExam, exam_type: e.target.value})}>
                                                {EXAM_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label small fw-bold text-muted">Start Date</label>
                                            <input type="date" className="form-control bg-light border-0 shadow-none" value={newExam.start_date} onChange={e => setNewExam({...newExam, start_date: e.target.value})} required />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label small fw-bold text-muted">End Date</label>
                                            <input type="date" className="form-control bg-light border-0 shadow-none" value={newExam.end_date} onChange={e => setNewExam({...newExam, end_date: e.target.value})} required />
                                        </div>
                                        <div className="col-12 text-end">
                                            <button type="submit" className="btn btn-dark px-5 py-2 fw-medium shadow-none">Create Exam</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                        <div className="card-header bg-white border-bottom px-4 py-3">
                            <h6 className="fw-bold mb-0">All Examinations <span className="badge bg-dark bg-opacity-10 text-dark ms-2 rounded-pill fw-bold">{exams.length}</span></h6>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-dark" role="status"></div></div>
                            ) : exams.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-journal-x fs-1 d-block mb-2 opacity-50"></i>
                                    <h6 className="fw-normal">No exams scheduled for this session.</h6>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="px-4 py-3 border-0 text-muted small fw-bold">EXAM</th>
                                                <th className="py-3 border-0 text-muted small fw-bold">CLASS</th>
                                                <th className="py-3 border-0 text-muted small fw-bold">TYPE</th>
                                                <th className="py-3 border-0 text-muted small fw-bold">SCHEDULE</th>
                                                <th className="py-3 border-0 text-muted small fw-bold">STATUS</th>
                                                <th className="px-4 py-3 border-0 text-muted small fw-bold text-end">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exams.map(exam => {
                                                const examType = getExamType(exam.exam_type);
                                                const status = getExamStatus(exam);
                                                const cls = classes.find(c => c.id === exam.class_id);
                                                return (
                                                    <tr key={exam.id}>
                                                        <td className="px-4 py-3 fw-bold text-dark">{exam.name}</td>
                                                        <td className="py-3 text-secondary fw-medium">{cls?.name || <span className="text-muted fst-italic">All Classes</span>}</td>
                                                        <td className="py-3">
                                                            <span className="badge rounded-pill px-3 py-2 fw-medium small" style={{background: examType.bg, color: examType.color}}>
                                                                {examType.label}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-muted small fw-medium">
                                                            {exam.start_date ? (
                                                                <>{new Date(exam.start_date).toLocaleDateString('en-IN', {day:'2-digit',month:'short'})} → {new Date(exam.end_date).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}</>
                                                            ) : '—'}
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`badge rounded-pill px-3 py-2 fw-bold small ${status.cls}`}>{status.label}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-end d-flex align-items-center justify-content-end gap-3">
                                                            <button className="btn btn-sm btn-light rounded-3 fw-medium shadow-none px-3" onClick={() => handleSelectExam(exam)}>
                                                                <i className="bi bi-gear me-1"></i>Rules
                                                            </button>
                                                            {canManage && (
                                                                <button className="text-danger fs-5 border-0 bg-transparent p-0" onClick={() => handleDeleteExam(exam.id)}>
                                                                    <i className="bi bi-trash3-fill"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* === GRADING RULES TAB === */}
            {activeTab === 'rules' && (
                <>
                    {!selectedExam ? (
                        <div className="card border-0 shadow-sm rounded-4 bg-white">
                            <div className="card-body text-center py-5 text-muted">
                                <i className="bi bi-arrow-left-circle fs-1 d-block mb-3 opacity-50"></i>
                                <h6 className="fw-normal">Go to the Examinations tab and click <strong>"Rules"</strong> on any exam to manage its grading rules.</h6>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Context banner */}
                            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                <div className="card-body p-4 d-flex align-items-center gap-3">
                                    <div className="bg-dark text-white rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{width:'44px',height:'44px'}}>
                                        <i className="bi bi-journal-text"></i>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0">{selectedExamObj?.name || 'Selected Exam'}</h6>
                                        <div className="text-muted small fw-medium">
                                            Grading rules define pass marks, total marks, and credit hours for this exam.
                                        </div>
                                    </div>
                                    <button className="btn btn-light ms-auto rounded-3 fw-medium shadow-none px-4" onClick={() => { setSelectedExam(''); setExamRules([]); setActiveTab('exams'); }}>
                                        <i className="bi bi-arrow-left me-2"></i>Back to Exams
                                    </button>
                                </div>
                            </div>

                            {showRulesForm && (
                                <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                                    <div className="card-header bg-white border-bottom px-4 py-3">
                                        <h6 className="fw-bold mb-0">Add Grading Rule</h6>
                                    </div>
                                    <div className="card-body p-4">
                                        <form onSubmit={handleAddRule}>
                                            <div className="row g-3 align-items-end">
                                                <div className="col-md-3">
                                                    <label className="form-label small fw-bold text-muted">Total Marks</label>
                                                    <input type="number" className="form-control bg-light border-0 shadow-none" min="1" value={newRule.total_marks} onChange={e => setNewRule({...newRule, total_marks: e.target.value})} required />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small fw-bold text-muted">Pass Marks</label>
                                                    <input type="number" className="form-control bg-light border-0 shadow-none" min="1" value={newRule.pass_marks} onChange={e => setNewRule({...newRule, pass_marks: e.target.value})} required />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small fw-bold text-muted">Credit Hours</label>
                                                    <input type="number" className="form-control bg-light border-0 shadow-none" min="1" max="10" step="0.5" value={newRule.credit_hours} onChange={e => setNewRule({...newRule, credit_hours: e.target.value})} required />
                                                </div>
                                                <div className="col-md-3">
                                                    <button type="submit" className="btn btn-dark w-100 py-2 fw-medium shadow-none">Save Rule</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                                <div className="card-header bg-white border-bottom px-4 py-3">
                                    <h6 className="fw-bold mb-0">Grading Configuration <span className="badge bg-dark bg-opacity-10 text-dark ms-2 rounded-pill fw-bold">{examRules.length}</span></h6>
                                </div>
                                <div className="card-body p-0">
                                    {examRules.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <i className="bi bi-sliders fs-1 d-block mb-2 opacity-50"></i>
                                            <h6 className="fw-normal">No grading rules set for this exam.</h6>
                                            {canManage && <p className="small">Click "Set Grading Rule" above to configure.</p>}
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="px-4 py-3 border-0 text-muted small fw-bold">TOTAL MARKS</th>
                                                        <th className="py-3 border-0 text-muted small fw-bold">PASS MARKS</th>
                                                        <th className="py-3 border-0 text-muted small fw-bold">PASS %</th>
                                                        <th className="py-3 border-0 text-muted small fw-bold">CREDIT HOURS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {examRules.map(rule => (
                                                        <tr key={rule.id}>
                                                            <td className="px-4 py-3 fw-bold text-dark">{rule.total_marks}</td>
                                                            <td className="py-3 fw-bold text-success">{rule.pass_marks}</td>
                                                            <td className="py-3">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="fw-bold text-muted">{Math.round((rule.pass_marks / rule.total_marks) * 100)}%</span>
                                                                    <div className="progress flex-grow-1 bg-success bg-opacity-10" style={{height:'6px', maxWidth:'100px'}}>
                                                                        <div className="progress-bar bg-success" style={{width: `${(rule.pass_marks / rule.total_marks) * 100}%`}}></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 fw-bold rounded-pill">{rule.credit_hours} Credits</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageExams;
