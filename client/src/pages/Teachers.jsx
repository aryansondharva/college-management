import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';

const Teachers = () => {
    const { hasPermission } = useContext(AuthContext);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await api.get('/users/teachers');
                setTeachers(res.data.teachers);
            } catch (err) {
                console.error("Failed to fetch teachers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0"><i className="bi bi-person-badge-fill me-2 text-success"></i>Teacher Management</h2>
                {hasPermission('create users') && (
                    <Link to="/teachers/add" className="btn btn-success d-flex align-items-center fw-semibold">
                        <i className="bi bi-plus-lg me-2"></i> Add New Teacher
                    </Link>
                )}
            </div>

            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase">Photo</th>
                                    <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Full Name</th>
                                    <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Email</th>
                                    <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Phone</th>
                                    <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Gender</th>
                                    <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-success" role="status"></div></td></tr>
                                ) : teachers.length > 0 ? (
                                    teachers.map(teacher => (
                                        <tr key={teacher.id}>
                                            <td className="px-4 py-3">
                                                {teacher.photo ? (
                                                    <img src={teacher.photo} className="rounded-circle shadow-sm" style={{width: '45px', height: '45px', objectFit: 'cover'}} alt="Teacher" />
                                                ) : (
                                                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: '45px', height: '45px'}}>
                                                        {teacher.first_name[0]}{teacher.last_name[0]}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 fw-bold">{teacher.first_name} {teacher.last_name}</td>
                                            <td className="py-3 text-muted">{teacher.email}</td>
                                            <td className="py-3">{teacher.phone}</td>
                                            <td className="py-3">
                                                <span className={`badge py-2 px-3 ${teacher.gender === 'Male' ? 'bg-info bg-opacity-10 text-info' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                                    {teacher.gender}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <div className="btn-group">
                                                    <Link to={`/teachers/profile/${teacher.id}`} className="btn btn-sm btn-outline-success shadow-none border-0 rounded-3 me-1">
                                                        <i className="bi bi-person-lines-fill fs-5"></i>
                                                    </Link>
                                                    <Link to={`/teachers/edit/${teacher.id}`} className="btn btn-sm btn-outline-warning shadow-none border-0 rounded-3 me-1">
                                                        <i className="bi bi-pencil-square fs-5"></i>
                                                    </Link>
                                                    <button className="btn btn-sm btn-outline-danger shadow-none border-0 rounded-3">
                                                        <i className="bi bi-trash-fill fs-5"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted h5">No teachers found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Teachers;
