import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    // Dropdown data
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', enrollment_no: '', gender: 'Male',
        phone: '', address: '', city: '', birthday: '',
        father_name: '', mother_name: '', father_phone: '', mother_phone: '',
        guardian_name: '', guardian_phone: '',
        session_id: '', class_id: '', section_id: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch student profile, parental info, and academic info
                const [userRes, sessionRes] = await Promise.all([
                    api.get(`/users/student/${id}`),
                    api.get('/sessions')
                ]);
                
                const s = userRes.data.student;
                const p = userRes.data.parent_info || {};
                const a = userRes.data.academic_info || {};
                
                setSessions(sessionRes.data.sessions);
                
                setFormData({
                    first_name: s.first_name || '',
                    last_name: s.last_name || '',
                    email: s.email || '',
                    enrollment_no: s.enrollment_no || '',
                    gender: s.gender || 'Male',
                    phone: s.phone || '',
                    address: s.address || '',
                    city: s.city || '',
                    birthday: s.birthday || '',
                    father_name: p.father_name || '',
                    mother_name: p.mother_name || '',
                    father_phone: p.father_phone || '',
                    mother_phone: p.mother_phone || '',
                    guardian_name: p.guardian_name || '',
                    guardian_phone: p.guardian_phone || '',
                    session_id: a.session_id || '',
                    class_id: a.class_id || '',
                    section_id: a.section_id || ''
                });

                // Load classes for the existing session
                if (a.session_id) {
                    const classRes = await api.get(`/classes?session_id=${a.session_id}`);
                    setClasses(classRes.data.classes);
                }
                
                // Load sections for the existing class
                if (a.class_id) {
                    const sectionRes = await api.get(`/sections?class_id=${a.class_id}`);
                    setSections(sectionRes.data.sections);
                }

            } catch (err) {
                console.error(err);
                setError('Failed to load student data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSessionChange = async (sessionId) => {
        setFormData(prev => ({ ...prev, session_id: sessionId, class_id: '', section_id: '' }));
        if (sessionId) {
            const res = await api.get(`/classes?session_id=${sessionId}`);
            setClasses(res.data.classes);
        }
    };

    const handleClassChange = async (classId) => {
        setFormData(prev => ({ ...prev, class_id: classId, section_id: '' }));
        if (classId) {
            const res = await api.get(`/sections?class_id=${classId}`);
            setSections(res.data.sections);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.put(`/users/students/${id}`, formData);
            navigate(`/students/profile/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update student');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0 text-primary"><i className="bi bi-person-gear me-2"></i>Edit Student Profile</h2>
                <button onClick={() => navigate(-1)} className="btn btn-light rounded-pill"><i className="bi bi-arrow-left me-1"></i>Back</button>
            </div>
            
            {error && <div className="alert alert-danger rounded-4 border-0 shadow-sm mb-4"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="fw-bold m-0 text-primary">Personal Information</h5>
                    </div>
                    <div className="card-body p-4 border-top">
                        <div className="row g-3">
                            <div className="col-md-4"><label className="form-label small fw-bold">First Name</label><input type="text" name="first_name" className="form-control bg-light" value={formData.first_name} onChange={handleChange} required /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Last Name</label><input type="text" name="last_name" className="form-control bg-light" value={formData.last_name} onChange={handleChange} required /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Enrollment No</label><input type="text" name="enrollment_no" className="form-control bg-light" value={formData.enrollment_no} onChange={handleChange} /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Gender</label><select name="gender" className="form-select bg-light" value={formData.gender} onChange={handleChange}><option value="Male">Male</option><option value="Female">Female</option></select></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Email</label><input type="email" name="email" className="form-control bg-light" value={formData.email} onChange={handleChange} required /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Phone</label><input type="text" name="phone" className="form-control bg-light" value={formData.phone} onChange={handleChange} /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Birthday</label><input type="date" name="birthday" className="form-control bg-light" value={formData.birthday} onChange={handleChange} /></div>
                            <div className="col-md-8"><label className="form-label small fw-bold">Address</label><input type="text" name="address" className="form-control bg-light" value={formData.address} onChange={handleChange} /></div>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="fw-bold m-0 text-success">Academic Assignment (Edit Section)</h5>
                    </div>
                    <div className="card-body p-4 border-top">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Academic Session</label>
                                <select className="form-select bg-light" value={formData.session_id} onChange={(e) => handleSessionChange(e.target.value)}>
                                    <option value="">Select Session</option>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.session} {s.current ? "(Current)" : ""}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Class</label>
                                <select className="form-select bg-light" value={formData.class_id} onChange={(e) => handleClassChange(e.target.value)}>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Section</label>
                                <select className="form-select bg-light" name="section_id" value={formData.section_id} onChange={handleChange}>
                                    <option value="">Select Section</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="alert alert-info mt-3 py-2 small border-0 bg-info bg-opacity-10 text-info">
                            <i className="bi bi-info-circle me-2"></i> Changing this will update the student's primary academic record for the selected session.
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="fw-bold m-0 text-warning">Guardian Information</h5>
                    </div>
                    <div className="card-body p-4 border-top">
                        <div className="row g-3">
                            <div className="col-md-6"><label className="form-label small fw-bold">Father's Name</label><input type="text" name="father_name" className="form-control bg-light" value={formData.father_name} onChange={handleChange} /></div>
                            <div className="col-md-6"><label className="form-label small fw-bold">Mother's Name</label><input type="text" name="mother_name" className="form-control bg-light" value={formData.mother_name} onChange={handleChange} /></div>
                            <div className="col-md-6"><label className="form-label small fw-bold">Father's Phone</label><input type="text" name="father_phone" className="form-control bg-light" value={formData.father_phone} onChange={handleChange} /></div>
                            <div className="col-md-6"><label className="form-label small fw-bold">Mother's Phone</label><input type="text" name="mother_phone" className="form-control bg-light" value={formData.mother_phone} onChange={handleChange} /></div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mb-5">
                    <button type="button" className="btn btn-light px-5 fw-bold rounded-pill" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="btn btn-primary px-5 fw-bold rounded-pill shadow" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditStudent;
