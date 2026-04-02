import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AddEmployee = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        gender: '',
        role: 'staff',
        phone: '',
        address: '',
        nationality: '',
        enrollment_no: '' // Optional for employee
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/users/employees', formData);
            alert('Employee onboarded successfully!');
            navigate('/employees');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to onboard employee.');
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <button className="btn btn-light rounded-circle shadow-none p-0 d-flex align-items-center justify-content-center" style={{width:'40px', height:'40px'}} onClick={() => navigate('/employees')}>
                    <i className="bi bi-arrow-left"></i>
                </button>
                <h2 className="fw-bold m-0 text-dark">Staff Onboarding</h2>
            </div>

            {error && <div className="alert alert-danger border-0 rounded-3 shadow-sm">{error}</div>}

            <div className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
                <div className="card-header bg-white border-bottom p-4">
                    <h5 className="mb-0 fw-bold">Personal & Professional Information</h5>
                    <p className="text-muted small mb-0 mt-1">Please provide the necessary identification and contact details to register this employee into the system.</p>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">First Name</label>
                                <input type="text" className="form-control bg-light border-0 shadow-none px-3 py-2" name="first_name" value={formData.first_name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">Last Name</label>
                                <input type="text" className="form-control bg-light border-0 shadow-none px-3 py-2" name="last_name" value={formData.last_name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">Email Address (Login ID)</label>
                                <input type="email" className="form-control bg-light border-0 shadow-none px-3 py-2" name="email" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">Temporary Password</label>
                                <input type="password" name="password" className="form-control bg-light border-0 shadow-none px-3 py-2" value={formData.password} onChange={handleChange} placeholder="staff123" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">Designation / Role</label>
                                <select className="form-select bg-light border-0 shadow-none px-3 py-2" name="role" value={formData.role} onChange={handleChange} required>
                                    <option value="staff">Staff / Assistant</option>
                                    <option value="hr">Human Resources</option>
                                    <option value="accountant">Accountant / Finance</option>
                                    <option value="teacher">Teaching Personnel</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">Employee ID No.</label>
                                <input type="text" name="enrollment_no" className="form-control bg-light border-0 shadow-none px-3 py-2" value={formData.enrollment_no} onChange={handleChange} placeholder="E-1002" />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">Gender</label>
                                <select className="form-select bg-light border-0 shadow-none px-3 py-2" name="gender" value={formData.gender} onChange={handleChange} required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">Contact Phone</label>
                                <input type="text" className="form-control bg-light border-0 shadow-none px-3 py-2" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">Nationality</label>
                                <input type="text" className="form-control bg-light border-0 shadow-none px-3 py-2" name="nationality" value={formData.nationality} onChange={handleChange} />
                            </div>

                            <div className="col-12">
                                <label className="form-label small fw-bold text-muted">Residential Address</label>
                                <textarea className="form-control bg-light border-0 shadow-none px-3 py-2" name="address" rows="2" value={formData.address} onChange={handleChange}></textarea>
                            </div>

                            <div className="col-12 d-flex justify-content-end gap-2 pt-3">
                                <button type="button" className="btn px-4 py-2 border-0 bg-light text-dark fw-bold rounded-3 h6 mb-0" onClick={() => navigate('/employees')}>Discard</button>
                                <button type="submit" className="btn px-4 py-2 bg-dark text-white fw-bold rounded-3 h6 mb-0 border-0" disabled={loading}>
                                    {loading ? 'Processing...' : 'Complete Onboarding'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddEmployee;
