import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AddTeacher = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', password: '', gender: 'Male',
        nationality: '', phone: '', address: '', address2: '', city: '', zip: '',
        birthday: '', blood_type: '', religion: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/users/teachers', formData);
            navigate('/teachers');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create teacher');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4 text-success"><i className="bi bi-person-plus-fill me-2"></i>Add New Teacher</h2>
            {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="fw-bold m-0 text-success">Personal & Account Information</h5>
                    </div>
                    <div className="card-body p-4 border-top">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">First Name</label>
                                <input type="text" name="first_name" className="form-control" onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Last Name</label>
                                <input type="text" name="last_name" className="form-control" onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Gender</label>
                                <select name="gender" className="form-select" onChange={handleChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Email Address</label>
                                <input type="email" name="email" className="form-control" onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Password (Default: teacher123)</label>
                                <input type="password" name="password" className="form-control" onChange={handleChange} placeholder="teacher123" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="fw-bold m-0 text-dark">Contact Details</h5>
                    </div>
                    <div className="card-body p-4 border-top">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Phone Number</label>
                                <input type="text" name="phone" className="form-control" onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Nationality</label>
                                <input type="text" name="nationality" className="form-control" onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Religion</label>
                                <input type="text" name="religion" className="form-control" onChange={handleChange} />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label small fw-bold">Address</label>
                                <textarea name="address" className="form-control" rows="2" onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mb-5">
                    <button type="button" className="btn btn-light px-5 fw-bold" onClick={() => navigate('/teachers')}>Cancel</button>
                    <button type="submit" className="btn btn-success px-5 fw-bold" disabled={loading}>
                        {loading ? 'Creating Teacher...' : 'Save Teacher'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTeacher;
