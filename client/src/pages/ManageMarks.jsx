import React, { useState, useEffect } from 'react';
import api from '../api';

const ManageMarks = () => {
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [marksMap, setMarksMap] = useState({});
    
    // Config pulled from exam grading rules
    const [examRule, setExamRule] = useState(null);
    
    const [filters, setFilters] = useState({
        session_id: '', class_id: '', section_id: '', course_id: '', exam_id: ''
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
        setFilters(prev => ({ ...prev, class_id: classId, section_id: '', course_id: '', exam_id: '' }));
        setExamRule(null);
        setStudents([]);
        
        if (classId) {
            const [sectionRes, courseRes, examRes] = await Promise.all([
                api.get(`/sections?class_id=${classId}`),
                api.get(`/courses?class_id=${classId}`),
                api.get(`/exams?session_id=${filters.session_id}&class_id=${classId}`)
            ]);
            setSections(sectionRes.data.sections);
            setCourses(courseRes.data.courses);
            
            // Also include exams that are global (class_id = null)
            const globalExamRes = await api.get(`/exams?session_id=${filters.session_id}&class_id=0`);
            const allExams = [...globalExamRes.data.exams];
            // Add class specific exams if not already there
            examRes.data.exams.forEach(ex => {
                if(!allExams.find(e => e.id === ex.id)) allExams.push(ex);
            });
            setExams(allExams);
        } else {
            setSections([]);
            setCourses([]);
            setExams([]);
        }
    };

    const fetchMarksData = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        
        if (!filters.course_id || !filters.section_id || !filters.exam_id) {
            setMessage({ text: 'Please select Class, Section, Subject and Exam.', type: 'danger' });
            return;
        }

        setLoading(true);
        try {
            // First fetch the grading rule for this exam to know total marks
            const ruleRes = await api.get(`/exams/rules?exam_id=${filters.exam_id}`);
            const rule = ruleRes.data.exam_rules[0] || { total_marks: 100, pass_marks: 40 }; // default fallback
            setExamRule(rule);

            // Fetch students in section
            const studentRes = await api.get('/users/students', { params: filters });
            setStudents(studentRes.data.students);

            // Fetch existing marks
            const marksRes = await api.get('/marks', { params: filters });
            const map = {};
            marksRes.data.marks.forEach(m => { map[m.student_id] = m.mark; });
            setMarksMap(map);
        } catch (err) { 
            setMessage({ text: 'Error fetching data. Check your connection.', type: 'danger' }); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleMarkChange = (studentId, value) => {
        // Enforce max marks rule if present
        let numericVal = value === '' ? '' : Number(value);
        if (numericVal !== '' && examRule) {
            if (numericVal > examRule.total_marks) numericVal = examRule.total_marks;
            if (numericVal < 0) numericVal = 0;
        }
        setMarksMap(prev => ({ ...prev, [studentId]: numericVal }));
    };

    const saveMarks = async () => {
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            const data = Object.keys(marksMap).map(id => ({
                student_id: parseInt(id), 
                mark: marksMap[id]
            }));
            await api.post('/marks', { ...filters, marks_data: data });
            setMessage({ text: 'Marks saved successfully!', type: 'success' });
        } catch (err) { 
            setMessage({ text: 'Failed to save marks.', type: 'danger' }); 
        } finally { 
            setSaving(false); 
        }
    };

    // Derived view data
    const getGrade = (mark) => {
        if (mark === '' || mark === null || mark === undefined) return '-';
        if (!examRule) return mark;
        
        const pt = (mark / examRule.total_marks) * 100;
        if (mark < examRule.pass_marks) return { label: 'Fail', cls: 'bg-danger text-danger' };
        if (pt >= 90) return { label: 'A+', cls: 'bg-success text-success' };
        if (pt >= 80) return { label: 'A', cls: 'bg-success text-success' };
        if (pt >= 70) return { label: 'B+', cls: 'bg-primary text-primary' };
        if (pt >= 60) return { label: 'B', cls: 'bg-primary text-primary' };
        if (pt >= 50) return { label: 'C', cls: 'bg-warning text-dark' };
        return { label: 'Pass', cls: 'bg-success text-success' };
    };

    const selectedExamObj = exams.find(e => String(e.id) === String(filters.exam_id));
    const selectedCourseObj = courses.find(c => String(c.id) === String(filters.course_id));

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold m-0"><i className="bi bi-pencil-square me-2 text-dark"></i>Marks Entry</h3>
                    <p className="text-muted small m-0 mt-1">Easily input and manage examination results for students</p>
                </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
                <div className="card-body p-4">
                    <form className="row g-3 align-items-end" onSubmit={fetchMarksData}>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted">Session</label>
                            <select className="form-select bg-light border-0 shadow-none fw-medium" value={filters.session_id} onChange={(e) => { setFilters(prev => ({...prev, session_id: e.target.value})); fetchClasses(e.target.value); }}>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted">Class</label>
                            <select className="form-select bg-light border-0 shadow-none fw-medium" value={filters.class_id} onChange={(e) => handleClassChange(e.target.value)}>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted">Section</label>
                            <select className="form-select bg-light border-0 shadow-none fw-medium" value={filters.section_id} onChange={(e) => setFilters(prev => ({...prev, section_id: e.target.value}))} disabled={!filters.class_id}>
                                <option value="">Select Section</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-bold text-muted">Subject</label>
                            <select className="form-select bg-light border-0 shadow-none fw-medium" value={filters.course_id} onChange={(e) => setFilters(prev => ({...prev, course_id: e.target.value}))} disabled={!filters.class_id}>
                                <option value="">Select Subject</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                             <label className="form-label small fw-bold text-muted">Examination</label>
                             <select className="form-select bg-light border-0 shadow-none fw-medium" value={filters.exam_id} onChange={(e) => setFilters(prev => ({...prev, exam_id: e.target.value}))} disabled={!filters.class_id}>
                                <option value="">Select Exam</option>
                                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                             </select>
                        </div>
                        <div className="col-md-1">
                            <button type="submit" className="btn btn-dark w-100 py-2 fw-medium shadow-none" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-search"></i>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type} border-0 shadow-sm mb-4 rounded-3 d-flex align-items-center`}>
                    <i className={`bi bi-${message.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2 fs-5`}></i>
                    {message.text}
                </div>
            )}

            {students.length > 0 && (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                    <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h5 className="fw-bold m-0">{selectedCourseObj?.name || 'Subject Marks'}</h5>
                            <div className="text-muted small fw-medium mt-1">
                                {selectedExamObj?.name} &bull; Base Grading Rule loaded
                            </div>
                        </div>
                        {examRule && (
                            <div className="d-flex gap-3">
                                <div className="bg-light rounded-3 px-3 py-2 text-center border">
                                    <div className="small text-muted fw-bold" style={{fontSize: '0.65rem'}}>MAX MARKS</div>
                                    <div className="fw-bold text-dark">{examRule.total_marks}</div>
                                </div>
                                <div className="bg-success bg-opacity-10 text-success rounded-3 px-3 py-2 text-center border border-success border-opacity-25">
                                    <div className="small fw-bold" style={{fontSize: '0.65rem'}}>PASS MARKS</div>
                                    <div className="fw-bold">{examRule.pass_marks}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="table-responsive custom-scrollbar" style={{maxHeight: '600px', overflowY: 'auto'}}>
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light sticky-top" style={{zIndex: 1}}>
                                <tr>
                                    <th className="px-4 py-3 border-bottom-0 text-muted small fw-bold">STUDENT INFORMATION</th>
                                    <th className="py-3 border-bottom-0 text-muted small fw-bold text-center" style={{width: '240px'}}>MARKS OBTAINED</th>
                                    <th className="px-4 py-3 border-bottom-0 text-muted small fw-bold text-end">RESULT / GRADE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => {
                                    const mark = marksMap[student.id];
                                    const grade = getGrade(mark);
                                    const isFail = mark !== '' && mark !== undefined && mark !== null && mark < (examRule?.pass_marks || 0);

                                    return (
                                        <tr key={student.id} className={isFail ? 'bg-danger bg-opacity-10' : ''}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold small flex-shrink-0" style={{width: '32px', height: '32px'}}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{student.first_name} {student.last_name}</div>
                                                        <div className="text-muted fw-medium" style={{fontSize: '0.75rem'}}>ENR: {student.enrollment_no || student.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="input-group">
                                                    <input 
                                                        type="number" 
                                                        className={`form-control text-center py-2 fw-bold shadow-none ${isFail ? 'border-danger text-danger bg-white' : 'bg-light border-0'}`}
                                                        value={mark !== undefined ? mark : ''} 
                                                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                        placeholder="Score"
                                                        min="0"
                                                        max={examRule?.total_marks || 100}
                                                    />
                                                    <span className="input-group-text bg-transparent border-0 text-muted fw-bold small">/ {examRule?.total_marks || 100}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                {grade !== '-' ? (
                                                    <span className={`badge px-3 py-2 rounded-pill fw-bold bg-opacity-10 ${grade.cls}`}>
                                                        {grade.label}
                                                    </span>
                                                ) : <span className="text-muted small fw-medium fst-italic">Pending</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="card-footer bg-white p-4 d-flex justify-content-between align-items-center">
                        <div className="text-muted small fw-medium">
                            <i className="bi bi-info-circle me-1"></i> Marks strictly follow the defined grading rules for this exam.
                        </div>
                        <button className="btn btn-dark px-5 py-2 fw-bold shadow-sm rounded-3" disabled={saving} onClick={saveMarks}>
                            {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-cloud-arrow-up-fill me-2"></i>}
                            {saving ? 'Saving...' : 'Submit Result Sheet'}
                        </button>
                    </div>
                </div>
            )}
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; }
            `}</style>
        </div>
    );
};

export default ManageMarks;
