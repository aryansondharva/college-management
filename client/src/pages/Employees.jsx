import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Employees = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            // Fetching users with roles other than 'student'
            const res = await api.get('/users/employees');
            setEmployees(res.data.employees);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch employees.');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await api.delete(`/users/${id}`);
            setEmployees(employees.filter(e => e.id !== id));
        } catch (err) {
            setError('Failed to delete employee.');
        }
    };

    const filteredEmployees = employees.filter(e => 
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.phone && e.phone.includes(searchTerm))
    );

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Human Resources</h2>
                    <p className="text-muted small mb-0">Manage all institution staff, administrators and faculty</p>
                </div>
                <Link to="/employees/add" className="btn btn-dark px-4 py-2 rounded-3 shadow-none fw-bold">
                    <i className="bi bi-person-plus me-2"></i> Onboard Staff
                </Link>
            </div>

            {error && <div className="alert alert-danger border-0 rounded-3 shadow-sm">{error}</div>}

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-header bg-white py-4 px-4 border-0">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h5 className="mb-0 fw-bold">Employee Roster</h5>
                        </div>
                        <div className="col-md-6">
                            <div className="input-group bg-light border-0 rounded-3">
                                <span className="input-group-text bg-transparent border-0 pe-0"><i className="bi bi-search text-muted"></i></span>
                                <input 
                                    type="text" 
                                    className="form-control bg-transparent border-0 py-2 shadow-none" 
                                    placeholder="Search by name, email or phone..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="small text-muted text-uppercase fw-bold">
                                <th className="ps-4">Employee Details</th>
                                <th>Role / Designation</th>
                                <th>Contact Info</th>
                                <th>Join Date</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-dark spinner-border-sm" role="status"></div></td></tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No employees found matching your search.</td></tr>
                            ) : (
                                filteredEmployees.map(e => (
                                    <tr key={e.id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-dark text-white rounded-3 d-flex align-items-center justify-content-center me-3 fw-bold" style={{width:'42px', height:'42px'}}>
                                                    {e.photo ? <img src={e.photo} alt="" className="w-100 h-100 rounded-3" style={{objectFit:'cover'}} /> : `${e.first_name[0]}${e.last_name[0]}`}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{e.first_name} {e.last_name}</div>
                                                    <div className="text-muted x-small">ID: EMP-${e.id.toString().padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-1 fw-bold border ${
                                                e.role === 'admin' ? 'bg-primary-subtle text-primary border-primary-subtle' : 
                                                e.role === 'teacher' ? 'bg-success-subtle text-success border-success-subtle' : 
                                                'bg-dark-subtle text-dark border-dark-subtle'
                                            }`}>
                                                {e.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="small fw-medium text-dark">{e.email}</div>
                                            <div className="small text-muted">{e.phone || 'No phone'}</div>
                                        </td>
                                        <td><span className="small text-muted">{e.created_at ? new Date(e.created_at).toLocaleDateString() : '--'}</span></td>
                                        <td className="text-end pe-4">
                                            <div className="dropdown">
                                                <button className="btn btn-light btn-sm border shadow-none" data-bs-toggle="dropdown">
                                                    <i className="bi bi-three-dots-vertical"></i>
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2 rounded-3">
                                                    <li><button className="dropdown-item py-2 rounded-2 small" onClick={() => navigate(`/employees/profile/${e.id}`)}><i className="bi bi-eye me-2"></i> View Profile</button></li>
                                                    <li><button className="dropdown-item py-2 rounded-2 small" onClick={() => navigate(`/employees/edit/${e.id}`)}><i className="bi bi-pencil me-2"></i> Edit Details</button></li>
                                                    <li><hr className="dropdown-divider opacity-10" /></li>
                                                    <li><button className="dropdown-item py-2 rounded-2 small text-danger fw-bold" onClick={() => handleDelete(e.id)}><i className="bi bi-trash3 me-2"></i> Terminate</button></li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Employees;
