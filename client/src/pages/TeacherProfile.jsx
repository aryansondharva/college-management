import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const TeacherProfile = () => {
    const { id } = useParams();
    const [teacher, setTeacher] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/teacher/${id}`);
                setTeacher(res.data.teacher);
                setCourses(res.data.courses);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-success"></div></div>;
    if (!teacher) return <div className="p-5 text-center text-muted"><h4>Teacher Not Found</h4></div>;

    return (
        <div className="container py-4">
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 rounded-4 text-center p-4 h-100">
                        <div className="mb-3">
                           {teacher.photo ? (
                               <img src={teacher.photo} className="rounded-circle shadow" style={{width: '150px', height: '150px', objectFit: 'cover'}} />
                           ) : (
                               <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center fw-bold shadow mx-auto" style={{width: '150px', height: '150px', fontSize: '3rem'}}>
                                   {teacher.first_name[0]}{teacher.last_name[0]}
                               </div>
                           )}
                        </div>
                        <h4 className="fw-bold mb-0">{teacher.first_name} {teacher.last_name}</h4>
                        <p className="text-muted mb-3 text-uppercase small letter-spacing-1">{teacher.role}</p>
                        <div className="d-grid gap-2">
                           <Link to={`/teachers/edit/${teacher.id}`} className="btn btn-outline-success btn-sm rounded-pill fw-bold">Edit profile</Link>
                        </div>
                        <hr className="my-4 opacity-10" />
                        <div className="text-start">
                           <div className="mb-2 small"><strong className="text-muted text-uppercase">Email:</strong><br/>{teacher.email}</div>
                           <div className="mb-2 small"><strong className="text-muted text-uppercase">Phone:</strong><br/>{teacher.phone || 'N/A'}</div>
                           <div className="mb-2 small"><strong className="text-muted text-uppercase">Address:</strong><br/>{teacher.address || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow-sm border-0 rounded-4 mb-4 h-100">
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="fw-bold m-0 text-success"><i className="bi bi-journal-check me-2"></i>Assigned Subjects</h5>
                        </div>
                        <div className="card-body p-0 border-top">
                            {courses.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 mt-2">
                                        <thead className="small text-muted fw-bold text-uppercase">
                                            <tr>
                                                <th className="px-4">Code</th>
                                                <th>Subject Name</th>
                                                <th>Class</th>
                                                <th className="px-4 text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map(course => (
                                                <tr key={course.id}>
                                                    <td className="px-4 fw-bold">{course.code}</td>
                                                    <td>{course.name}</td>
                                                    <td><span className="badge bg-light text-dark border p-2">{course.class_name}</span></td>
                                                    <td className="px-4 text-end text-primary fw-bold cursor-pointer small">Manage</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-5 text-center text-muted small">No subjects assigned to this teacher yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;
