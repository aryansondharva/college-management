import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ManageAdmitCards = () => {
    const { user } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    
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
            if (currentSession) {
                setSelectedSession(currentSession.id);
                fetchClasses(currentSession.id);
            }
        } catch (err) {
            setError('Failed to fetch sessions.');
        }
    };

    const fetchClasses = async (sessionId) => {
        try {
            const res = await api.get(`/classes?session_id=${sessionId}`);
            setClasses(res.data.classes);
        } catch (err) {
            setError('Failed to fetch classes.');
        }
    };

    const fetchSections = async (classId) => {
        try {
            const res = await api.get(`/sections?class_id=${classId}`);
            setSections(res.data.sections);
            fetchExams(selectedSession, classId);
        } catch (err) {
            setError('Failed to fetch sections.');
        }
    };

    const fetchExams = async (sessionId, classId) => {
        try {
            const res = await api.get(`/exams?session_id=${sessionId}&class_id=${classId}`);
            setExams(res.data.exams);
        } catch (err) {
            setError('Failed to fetch exams.');
        }
    };

    const fetchStudents = async () => {
        if (!selectedSession || !selectedClass || !selectedSection || !selectedExam) {
            setError('Please select all filters.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/users/students?session_id=${selectedSession}&class_id=${selectedClass}&section_id=${selectedSection}`);
            setStudents(res.data.students);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch students.');
            setLoading(false);
        }
    };

    const handlePrintAdmitCard = (student) => {
        const exam = exams.find(e => e.id == selectedExam);
        const className = classes.find(c => c.id == selectedClass);
        const sectionName = sections.find(s => s.id == selectedSection);

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Admit Card - ${student.first_name} ${student.last_name}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                        .admit-card { 
                            border: 2px solid #000; 
                            padding: 30px; 
                            width: 600px; 
                            margin: auto; 
                            background: white; 
                            position: relative;
                            overflow: hidden;
                        }
                        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                        .logo { font-size: 24px; font-weight: bold; text-transform: uppercase; }
                        .title { font-size: 18px; margin-top: 5px; color: #555; }
                        .student-info { display: flex; justify-content: space-between; }
                        .info-item { margin-bottom: 12px; font-size: 15px; }
                        .info-label { font-weight: bold; color: #666; width: 140px; display: inline-block; }
                        .photo-box { 
                            width: 120px; 
                            height: 140px; 
                            border: 1px dashed #999; 
                            display: flex; 
                            align-items: center; 
                            text-align: center; 
                            background: #fdfdfd;
                            font-size: 12px;
                            color: #999;
                        }
                        .exam-details { margin-top: 25px; border: 1px solid #ddd; padding: 15px; background: #f9f9f9; }
                        .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
                        .signature { border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 5px; font-size: 14px; }
                        @media print {
                            body { background: none; padding: 0; }
                            .admit-card { border: 2px solid #000; padding: 30px; box-shadow: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="admit-card">
                        <div class="header">
                            <div class="logo">UNITRANSFORM ACADEMY</div>
                            <div class="title">Official Examination Admit Card</div>
                        </div>
                        
                        <div class="student-info">
                            <div style="flex-grow: 1;">
                                <div class="info-item"><span class="info-label">Student Name:</span> ${student.first_name} ${student.last_name}</div>
                                <div class="info-item"><span class="info-label">Enrollment No:</span> ${student.enrollment_no || '---'}</div>
                                <div class="info-item"><span class="info-label">Class/Semester:</span> ${className ? className.name : '--'}</div>
                                <div class="info-item"><span class="info-label">Section:</span> ${sectionName ? sectionName.name : '--'}</div>
                                <div class="info-item"><span class="info-label">Exam Name:</span> ${exam ? exam.name : '--'}</div>
                            </div>
                            <div class="photo-box">
                                <span>Paste Passport<br/>Photo Here</span>
                            </div>
                        </div>

                        <div class="exam-details">
                            <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Instructions:</div>
                            <ul style="font-size: 13px; margin: 0; padding-left: 18px; color: #444;">
                                <li>Please bring this admit card to the examination hall.</li>
                                <li>Identity card is mandatory along with this admit card.</li>
                                <li>Electronics items are strictly prohibited.</li>
                                <li>Late entry beyond 15 minutes will not be allowed.</li>
                            </ul>
                        </div>

                        <div class="footer">
                            <div class="signature">Student's Signature</div>
                            <div class="signature">Controller of Exam</div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4">Online Admit Card Management</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Session</label>
                            <select className="form-select" value={selectedSession} onChange={(e) => {setSelectedSession(e.target.value); fetchClasses(e.target.value);}}>
                                <option value="">Select Session</option>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Class</label>
                            <select className="form-select" value={selectedClass} onChange={(e) => {setSelectedClass(e.target.value); fetchSections(e.target.value);}}>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Section</label>
                            <select className="form-select" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Select Exam</label>
                            <select className="form-select" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                                <option value="">Select Exam</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-primary w-100" onClick={fetchStudents} disabled={loading}>
                                {loading ? 'Loading...' : 'Show Students'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {students.length > 0 && (
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Eligible Students</h5>
                            <button className="btn btn-sm btn-outline-dark">
                                <i className="bi bi-printer me-2"></i> Bulk Print
                            </button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Student Name</th>
                                    <th>Enrollment No</th>
                                    <th>Status</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold">{s.first_name} {s.last_name}</div>
                                            <div className="small text-muted">{s.email}</div>
                                        </td>
                                        <td><code className="text-primary">{s.enrollment_no || 'N/A'}</code></td>
                                        <td><span className="badge bg-success-subtle text-success px-2 py-1">Eligible</span></td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-secondary" onClick={() => handlePrintAdmitCard(s)}>
                                                <i className="bi bi-printer me-2"></i> Print Admit Card
                                            </button>
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

export default ManageAdmitCards;
