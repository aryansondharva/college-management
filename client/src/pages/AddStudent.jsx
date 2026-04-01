import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AddStudent = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', password: '', gender: 'Male',
        nationality: '', phone: '', address: '', address2: '', city: '', zip: '',
        birthday: '', blood_type: '', religion: '',
        father_name: '', mother_name: '', father_phone: '', mother_phone: '',
        guardian_name: '', guardian_phone: '',
        session_id: '', class_id: '', section_id: '',
        enrollment_no: ''
    });

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const sessionRes = await api.get('/sessions');
                const sessionsList = sessionRes.data.sessions;
                setSessions(sessionsList);
                
                // Find current session and force fetch its classes
                const current = sessionsList.find(s => s.current);
                if (current) {
                    setFormData(prev => ({ ...prev, session_id: current.id }));
                    fetchClasses(current.id);
                }
            } catch (err) {
                console.error("Failed to load sessions", err);
                setError("Could not load academic years. Check internet or server.");
            }
        };
        fetchInitial();
    }, []);

    const fetchClasses = async (sessionId) => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const res = await api.get(`/classes`, { params: { session_id: sessionId } });
            setClasses(res.data.classes);
        } catch (err) { 
            console.error("Classes error", err); 
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (classId) => {
        setFormData(prev => ({ ...prev, class_id: classId, section_id: '' }));
        const res = await api.get(`/sections?class_id=${classId}`);
        setSections(res.data.sections);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/users/students', formData);
            navigate('/students');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4"><i className="bi bi-person-plus-fill me-2 text-primary"></i>Add New Student</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="fw-bold m-0 text-primary">Personal Information</h5>
                    </div>
                    <div className="card-body p-4 border-top">
                        <div className="row g-3">
                            <div className="col-md-4"><label className="form-label small fw-bold">First Name</label><input type="text" name="first_name" className="form-control" onChange={handleChange} required /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Last Name</label><input type="text" name="last_name" className="form-control" onChange={handleChange} required /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Enrollment Number</label><input type="text" name="enrollment_no" className="form-control" onChange={handleChange} /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Gender</label><select name="gender" className="form-select" onChange={handleChange}><option value="Male">Male</option><option value="Female">Female</option></select></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Email</label><input type="email" name="email" className="form-control" onChange={handleChange} required /></div>
                            <div className="col-md-6"><label className="form-label small fw-bold">Password (Default: student123)</label><input type="password" name="password" className="form-control" onChange={handleChange} placeholder="student123" /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Birthday</label><input type="date" name="birthday" className="form-control" onChange={handleChange} /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">Phone</label><input type="text" name="phone" className="form-control" onChange={handleChange} /></div>
                            <div className="col-md-4"><label className="form-label small fw-bold">City</label><input type="text" name="city" className="form-control" onChange={handleChange} /></div>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="fw-bold m-0 text-success">Academic Assignment</h5>
                    </div>
                    <div className="card-body p-4 border-top">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Academic Session</label>
                                <select name="session_id" className="form-select" value={formData.session_id} onChange={(e) => { handleChange(e); fetchClasses(e.target.value); }} required>
                                    <option value="">Select Session</option>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Class</label>
                                <select name="class_id" className="form-select" value={formData.class_id} onChange={(e) => handleClassChange(e.target.value)} required>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Section</label>
                                <select name="section_id" className="form-select" value={formData.section_id} onChange={handleChange} required>
                                    <option value="">Select Section</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="fw-bold m-0 text-warning">Parent & Guardian Information</h5>
                    </div>
                    <div className="card-body p-4 border-top">
                        <div className="row g-3">
                            <div className="col-md-6"><label className="form-label small fw-bold">Father's Name</label><input type="text" name="father_name" className="form-control" onChange={handleChange} /></div>
                            <div className="col-md-6"><label className="form-label small fw-bold">Mother's Name</label><input type="text" name="mother_name" className="form-control" onChange={handleChange} /></div>
                            <div className="col-md-6"><label className="form-label small fw-bold">Father's Phone</label><input type="text" name="father_phone" className="form-control" onChange={handleChange} /></div>
                            <div className="col-md-6"><label className="form-label small fw-bold">Mother's Phone</label><input type="text" name="mother_phone" className="form-control" onChange={handleChange} /></div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mb-5">
                    <button type="button" className="btn btn-light px-5 fw-bold" onClick={() => navigate('/students')}>Cancel</button>
                    <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={loading}>
                        {loading ? 'Creating Student...' : 'Save Student'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
