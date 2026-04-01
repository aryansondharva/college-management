import React, { useState, useEffect } from 'react';
import api from '../api';

const AttendanceReport = () => {
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);
    
    const [reportData, setReportData] = useState([]);
    const [dailyReportData, setDailyReportData] = useState([]);
    const [subjectDailyData, setSubjectDailyData] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('daily');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    
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
        if (courseRes.data.courses.length > 0) {
            setSelectedCourseId(courseRes.data.courses[0].id.toString());
        }
    };

    const generateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const [res, dailyRes, subjDailyRes] = await Promise.all([
                api.get('/attendance/report', { params: filters }),
                api.get('/attendance/daily-report', { params: filters }),
                api.get('/attendance/subject-daily-report', { params: filters })
            ]);
            setReportData(res.data.report);
            setDailyReportData(dailyRes.data.report);
            setSubjectDailyData(subjDailyRes.data.report);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getShortName = (name) => {
        if (!name) return '';
        if (name.includes('Design Thinking')) return 'DT';
        if (name.includes('Maths-II')) return 'M-2';
        if (name.includes('Mechanical Engineering')) return 'BME';
        if (name.includes('Programming for Problem Solving')) return 'PPS';
        if (name.includes('Fundamental of AI')) return 'AI';
        if (name.includes('Digital Fabrication')) return 'DF';
        if (name.includes('English for Technical')) return 'ETC';
        return name.split(' ').map(w => w[0]).join('').toUpperCase();
    };

    const daysInMonth = new Date(filters.year, filters.month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const hasData = dailyReportData.length > 0;

    return (
        <div className="container-fluid py-4">
            <h3 className="fw-bold mb-4">Comprehensive Attendance Report</h3>

            <div className="card shadow-sm border-0 mb-4 rounded-4 bg-white">
                <div className="card-body p-4">
                    <form className="row g-3 items-end" onSubmit={generateReport}>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Session</label>
                            <select className="form-select bg-light border-0 shadow-none" value={filters.session_id} onChange={(e) => setFilters({ ...filters, session_id: e.target.value })}>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Class</label>
                            <select className="form-select bg-light border-0 shadow-none" value={filters.class_id} onChange={(e) => handleClassChange(e.target.value)}>
                                <option value="">Select</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Section (Optional)</label>
                            <select className="form-select bg-light border-0 shadow-none" value={filters.section_id} onChange={(e) => setFilters({ ...filters, section_id: e.target.value })}>
                                <option value="">All Sections</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold">Month</label>
                            <select className="form-select bg-light border-0 shadow-none" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-dark w-100 mt-4 py-2 fw-medium shadow-none" disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {hasData && (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 bg-white">
                    <div className="card-header bg-white border-bottom p-0">
                        <ul className="nav nav-tabs nav-fill border-0 flex-nowrap overflow-auto" style={{whiteSpace: 'nowrap'}}>
                            <li className="nav-item">
                                <button
                                    className={`nav-link border-0 text-dark fw-bold py-3 ${activeTab === 'daily' ? 'active-tab shadow-sm' : 'text-muted bg-light bg-opacity-50'}`}
                                    onClick={() => setActiveTab('daily')}
                                    style={activeTab === 'daily' ? { borderBottom: '3px solid #212529 !important', background: '#fff' } : {}}
                                >
                                    <i className="bi bi-calendar-day me-2"></i> Daily Overall
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link border-0 text-dark fw-bold py-3 ${activeTab === 'subject-daily' ? 'active-tab shadow-sm' : 'text-muted bg-light bg-opacity-50'}`}
                                    onClick={() => setActiveTab('subject-daily')}
                                    style={activeTab === 'subject-daily' ? { borderBottom: '3px solid #212529 !important', background: '#fff' } : {}}
                                >
                                    <i className="bi bi-journal-text me-2"></i> All Subjects Daily
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link border-0 text-dark fw-bold py-3 ${activeTab === 'single-subject' ? 'active-tab shadow-sm' : 'text-muted bg-light bg-opacity-50'}`}
                                    onClick={() => setActiveTab('single-subject')}
                                    style={activeTab === 'single-subject' ? { borderBottom: '3px solid #212529 !important', background: '#fff' } : {}}
                                >
                                    <i className="bi bi-funnel me-2"></i> Single Subject View
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link border-0 text-dark fw-bold py-3 ${activeTab === 'monthly' ? 'active-tab shadow-sm' : 'text-muted bg-light bg-opacity-50'}`}
                                    onClick={() => setActiveTab('monthly')}
                                    style={activeTab === 'monthly' ? { borderBottom: '3px solid #212529 !important', background: '#fff' } : {}}
                                >
                                    <i className="bi bi-pie-chart me-2"></i> Monthly Totals
                                </button>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="card-body p-0">
                        <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold text-dark">
                                {activeTab === 'daily' && "Overall Daily Attendance (Any subject present = P)"}
                                {activeTab === 'subject-daily' && "Granular Daily Attendance (Broken down by all subjects)"}
                                {activeTab === 'single-subject' && "Specific Subject Daily Attendance"}
                                {activeTab === 'monthly' && "Total Monthly Aggregate (Percentage of classes attended)"}
                            </h6>
                            {activeTab !== 'monthly' && (
                                <div className="small text-muted d-flex align-items-center">
                                    <span className="text-success fw-bold ms-2 me-1">P</span> Present &middot; 
                                    <span className="text-danger fw-bold ms-2 me-1">A</span> Absent &middot; 
                                    <span className="bg-white border text-transparent rounded-1 d-inline-block ms-2 me-1" style={{width: '12px', height: '12px'}}></span> No Record
                                </div>
                            )}
                        </div>

                        {/* TAB 1: Daily Overall View */}
                        {activeTab === 'daily' && (
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm align-middle text-center mb-0" style={{fontSize: '0.85rem'}}>
                                    <thead className="bg-light text-dark">
                                        <tr>
                                            <th className="p-3 text-start" style={{ minWidth: '200px' }}>Student Name</th>
                                            {daysArray.map(day => (
                                                <th key={day} className="p-2 text-muted fw-bold" style={{width: '35px', minWidth: '35px'}}>{day}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyReportData.map(student => (
                                            <tr key={student.id}>
                                                <td className="text-start p-3 fw-bold text-nowrap">
                                                    {student.name}
                                                    <div className="text-muted small fw-normal">{student.enrollment_no}</div>
                                                </td>
                                                {daysArray.map(day => {
                                                    const status = student.days[day];
                                                    let content = '';
                                                    let className = 'p-0 text-center align-middle';
                                                    
                                                    if (status === true) {
                                                        content = 'P';
                                                        className += ' text-success fw-bold bg-success bg-opacity-10';
                                                    } else if (status === false) {
                                                        content = 'A';
                                                        className += ' text-danger fw-bold bg-danger bg-opacity-10';
                                                    } else {
                                                        content = '';
                                                        className += ' bg-white';
                                                    }
                                                    
                                                    return (
                                                        <td key={day} className={className} style={{ width: '35px', minWidth: '35px' }}>
                                                            {content}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 2: Subject-Wise Daily View */}
                        {activeTab === 'subject-daily' && (
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm align-middle text-center mb-0" style={{fontSize: '0.85rem'}}>
                                    <thead className="bg-light text-dark">
                                        <tr>
                                            <th className="p-3 text-start" style={{ minWidth: '250px' }}>Student & Subject</th>
                                            {daysArray.map(day => (
                                                <th key={day} className="p-2 text-muted fw-bold" style={{width: '35px', minWidth: '35px'}}>{day}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjectDailyData.map(student => (
                                            <React.Fragment key={student.id}>
                                                {courses.map((c, idx) => {
                                                    const subjData = student.subjects[c.id];
                                                    if (!subjData) return null; // Only show if data fetched
                                                    
                                                    return (
                                                        <tr key={`${student.id}-${c.id}`}>
                                                            <td className="text-start p-2 text-nowrap">
                                                                {idx === 0 && <div className="fw-bold mb-1">{student.name}</div>}
                                                                <div className="text-muted small fw-bold ps-3 d-flex align-items-center py-1">
                                                                    <i className="bi bi-arrow-return-right me-2 opacity-50"></i> {c.name}
                                                                </div>
                                                            </td>
                                                            {daysArray.map(day => {
                                                                const status = subjData.days[day];
                                                                let content = '';
                                                                let className = 'p-0 text-center align-middle border-start-0 border-end-0';
                                                                
                                                                if (status === true) {
                                                                    content = 'P';
                                                                    className += ' text-success fw-bold bg-success bg-opacity-10';
                                                                } else if (status === false) {
                                                                    content = 'A';
                                                                    className += ' text-danger fw-bold bg-danger bg-opacity-10';
                                                                } else {
                                                                    content = '';
                                                                    className += ' bg-white';
                                                                }
                                                                
                                                                return (
                                                                    <td key={day} className={className} style={{ width: '35px', minWidth: '35px' }}>
                                                                        {content}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 3: Single Subject View */}
                        {activeTab === 'single-subject' && (
                            <div>
                                <div className="p-3 bg-light border-bottom d-flex align-items-center gap-3">
                                    <div className="fw-bold small text-muted">Filter by Subject:</div>
                                    <select 
                                        className="form-select form-select-sm w-auto shadow-none border-0" 
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                    >
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm align-middle text-center mb-0" style={{fontSize: '0.85rem'}}>
                                        <thead className="bg-white text-dark">
                                            <tr>
                                                <th className="p-3 text-start" style={{ minWidth: '200px' }}>Student Name</th>
                                                {daysArray.map(day => (
                                                    <th key={day} className="p-2 text-muted fw-bold" style={{width: '35px', minWidth: '35px'}}>{day}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjectDailyData.map(student => {
                                                const subjData = selectedCourseId ? student.subjects[selectedCourseId] : null;
                                                
                                                return (
                                                    <tr key={student.id}>
                                                        <td className="text-start p-3 fw-bold text-nowrap">
                                                            {student.name}
                                                            <div className="text-muted small fw-normal">{student.enrollment_no}</div>
                                                        </td>
                                                        {daysArray.map(day => {
                                                            const status = subjData ? subjData.days[day] : undefined;
                                                            let content = '';
                                                            let className = 'p-0 text-center align-middle';
                                                            
                                                            if (status === true) {
                                                                content = 'P';
                                                                className += ' text-success fw-bold bg-success bg-opacity-10';
                                                            } else if (status === false) {
                                                                content = 'A';
                                                                className += ' text-danger fw-bold bg-danger bg-opacity-10';
                                                            } else {
                                                                content = '';
                                                                className += ' bg-white';
                                                            }
                                                            
                                                            return (
                                                                <td key={day} className={className} style={{ width: '35px', minWidth: '35px' }}>
                                                                    {content}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: Subject-Wise Monthly Totals */}
                        {activeTab === 'monthly' && (
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle text-center mb-0">
                                    <thead className="bg-light text-dark">
                                        <tr>
                                            <th className="p-3 text-start" style={{ minWidth: '200px' }}>Student Name</th>
                                            {courses.map(c => (
                                                <th key={c.id} className="p-3">
                                                    {getShortName(c.name)}
                                                    <div style={{ fontSize: '10px' }} className="text-muted fw-normal">{c.name}</div>
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
                                                                ) : <span className="text-muted opacity-50">-</span>}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-3">
                                                        <div className="fw-bold fs-6">{totalAttended} / {totalLectures}</div>
                                                        <div className={`badge ${totalLectures > 0 && (totalAttended / totalLectures) >= 0.75 ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${totalLectures > 0 && (totalAttended / totalLectures) >= 0.75 ? 'success' : 'danger'}`}>
                                                            {totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0}%
                                                        </div>
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
            )}
            
            <style>{`
                .active-tab { border-bottom: 3px solid #212529 !important; border-radius: 0; outline: none !important; }
                .nav-link:focus, .nav-link:hover { outline: none; border: none; }
                .table-bordered td, .table-bordered th { border-color: #f1f5f9; }
            `}</style>
        </div>
    );
};

export default AttendanceReport;
