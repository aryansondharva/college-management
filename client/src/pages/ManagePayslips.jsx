import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ManagePayslips = () => {
    const { user } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/sessions');
            setSessions(res.data.sessions);
            const current = res.data.sessions.find(s => s.is_current);
            if (current) {
                setSelectedSession(current.id);
                fetchClasses(current.id);
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
        } catch (err) {
            setError('Failed to fetch sections.');
        }
    };

    const fetchStudents = async () => {
        if (!selectedSession || !selectedClass || !selectedSection) {
            setError('Please select session, class and section.');
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

    const handlePrintPayslip = (student) => {
        const className = classes.find(c => c.id == selectedClass);
        const sessionName = sessions.find(s => s.id == selectedSession);
        
        // Mocking some fee data for now since Finance module is pending
        const feeData = [
            { head: 'Tuition Fee', amount: '12,500' },
            { head: 'Library Fee', amount: '500' },
            { head: 'Examination Fee', amount: '1,200' },
            { head: 'Laboratory Fee', amount: '1,500' },
            { head: 'Maintenance Charges', amount: '300' }
        ];
        const total = '16,000';

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Payslip - ${student.first_name} ${student.last_name}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #222; }
                        .payslip { border: 1px solid #ddd; padding: 40px; width: 700px; margin: auto; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                        .institution { font-size: 24px; font-weight: 800; color: #000; letter-spacing: -0.02em; }
                        .payslip-title { font-size: 14px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.1em; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
                        .info-item { font-size: 14px; }
                        .info-label { color: #666; font-weight: 500; margin-right: 10px; }
                        .info-val { font-weight: 700; color: #000; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { background: #f8f9fa; text-align: left; padding: 12px; font-size: 13px; font-weight: 700; border-bottom: 2px solid #eee; }
                        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                        .total-row { background: #fbfbfb; font-weight: 800; font-size: 16px; }
                        .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 12px; color: #999; }
                        @media print { body { padding: 0; } .payslip { border: none; width: 100%; } }
                    </style>
                </head>
                <body>
                    <div class="payslip">
                        <div class="header">
                            <div>
                                <div class="institution">UNITRANSFORM</div>
                                <div class="payslip-title">Official Student Fee Receipt</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: bold; font-size: 14px;">No: AC-PY-${Math.floor(Math.random()*90000) + 10000}</div>
                                <div style="font-size: 13px; color: #666;">Date: ${new Date().toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div class="info-grid">
                            <div class="info-item"><span class="info-label">Name:</span> <span class="info-val">${student.first_name} ${student.last_name}</span></div>
                            <div class="info-item"><span class="info-label">Enrollment:</span> <span class="info-val">${student.enrollment_no || '---'}</span></div>
                            <div class="info-item"><span class="info-label">Semester:</span> <span class="info-val">${className ? className.name : '--'}</span></div>
                            <div class="info-item"><span class="info-label">Session:</span> <span class="info-val">${sessionName ? sessionName.name : '--'}</span></div>
                        </div>

                        <table>
                            <thead>
                                <tr><th>Description / Particulars</th><th style="text-align: right;">Amount (INR)</th></tr>
                            </thead>
                            <tbody>
                                ${feeData.map(f => `<tr><td>${f.head}</td><td style="text-align: right;">${f.amount}.00</td></tr>`).join('')}
                                <tr class="total-row"><td>TOTAL AMOUNT PAID</td><td style="text-align: right;">${total}.00</td></tr>
                            </tbody>
                        </table>

                        <div style="margin-top: 20px; font-size: 13px; font-style: italic; color: #555;">
                            <b>Amount in words:</b> Sixteen Thousand Indian Rupees Only
                        </div>

                        <div class="footer">
                            <div>Computer generated receipt - Does not require physical signature</div>
                            <div style="text-align: center; border-top: 1px solid #ddd; width: 150px; padding-top: 5px; color: #333;">Accountant Stamp</div>
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
            <h2 className="mb-4">Fees & Academic Payslips</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm border-0 mb-4 rounded-4">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Session</label>
                            <select className="form-select border-0 bg-light" value={selectedSession} onChange={(e) => {setSelectedSession(e.target.value); fetchClasses(e.target.value);}}>
                                <option value="">Select Session</option>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Class / Semester</label>
                            <select className="form-select border-0 bg-light" value={selectedClass} onChange={(e) => {setSelectedClass(e.target.value); fetchSections(e.target.value);}}>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold">Section</label>
                            <select className="form-select border-0 bg-light" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button className="btn btn-dark w-100 py-2 rounded-3 shadow-sm fw-bold" onClick={fetchStudents} disabled={loading}>
                                <i className="bi bi-search me-2"></i> Fetch Students
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {students.length > 0 && (
                <div className="card shadow border-0 rounded-4 overflow-hidden">
                    <div className="card-header bg-white py-4 px-4 border-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Student Ledger (Current Term)</h5>
                            <span className="badge bg-primary rounded-pill px-3">2025-26 Session</span>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3">Student</th>
                                    <th>Enrollment</th>
                                    <th>Term Status</th>
                                    <th className="text-end pe-4">Payslip</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold" style={{width: '40px', height: '40px'}}>
                                                    {s.first_name[0]}{s.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{s.first_name} {s.last_name}</div>
                                                    <div className="small text-muted">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-light text-dark border fw-medium">{s.enrollment_no || 'Pending'}</span></td>
                                        <td><span className="text-success small fw-bold"><i className="bi bi-check-circle-fill me-1"></i> Paid</span></td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-white border shadow-sm px-3" onClick={() => handlePrintPayslip(s)}>
                                                <i className="bi bi-file-earmark-pdf text-danger me-2"></i> View Slip
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

export default ManagePayslips;
