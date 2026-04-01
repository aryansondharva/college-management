import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const StudentProfile = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [userRes, attendRes] = await Promise.all([
                    api.get(`/users/student/${id}`),
                    api.get(`/attendance/student/${id}`)
                ]);
                setStudent(userRes.data.student);
                setAttendance(attendRes.data.history);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
    if (!student) return <div className="p-5 text-center text-muted"><h4>Student Not Found</h4></div>;

    return (
        <div className="container py-4">
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 rounded-4 text-center p-4 h-100">
                        <div className="mb-3">
                           {student.photo ? (
                               <img src={student.photo} className="rounded-circle shadow" style={{width: '150px', height: '150px', objectFit: 'cover'}} />
                           ) : (
                               <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow mx-auto" style={{width: '150px', height: '150px', fontSize: '3rem'}}>
                                   {student.first_name[0]}{student.last_name[0]}
                               </div>
                           )}
                        </div>
                        <h4 className="fw-bold mb-0">{student.first_name} {student.last_name}</h4>
                        <p className="text-muted mb-2 text-uppercase small letter-spacing-1">{student.role}</p>
                        {student.enrollment_no && (
                            <div className="badge bg-light text-primary border border-primary border-opacity-10 py-2 px-3 fw-bold mb-4 rounded-3">
                                <i className="bi bi-hash me-1"></i>{student.enrollment_no}
                            </div>
                        )}
                        <div className="d-grid gap-2">
                           <Link to={`/students/edit/${student.id}`} className="btn btn-outline-primary btn-sm rounded-pill fw-bold">Edit Profile</Link>
                           <button className="btn btn-primary btn-sm rounded-pill fw-bold">Generate ID Card</button>
                        </div>
                        <hr className="my-4 opactiy-10" />
                        <div className="text-start">
                           <div className="mb-2 small"><strong className="text-muted text-uppercase">Email:</strong><br/>{student.email}</div>
                           <div className="mb-2 small"><strong className="text-muted text-uppercase">Phone:</strong><br/>{student.phone || 'N/A'}</div>
                           <div className="mb-2 small"><strong className="text-muted text-uppercase">Address:</strong><br/>{student.address}</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                         <div className="card-header bg-white py-3 border-0 d-flex align-items-center">
                             <h5 className="fw-bold m-0 text-primary"><i className="bi bi-info-circle me-2"></i>Academic Details</h5>
                         </div>
                         <div className="card-body p-4 border-top">
                            <div className="row g-4">
                                <div className="col-sm-6">
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="text-muted small fw-bold">Current Class</div>
                                        <div className="h5 fw-bold mb-0">Class {student.class_name || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="text-muted small fw-bold">Section</div>
                                        <div className="h5 fw-bold mb-0">Section {student.section_name || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="col-12">
                                     <h6 className="fw-bold border-bottom pb-2 mb-3 mt-2">Guardian Information</h6>
                                     <div className="row">
                                         <div className="col-6"><small className="text-muted fw-bold">FATHER'S NAME</small><p className="fw-semibold">{student.father_name || 'N/A'}</p></div>
                                         <div className="col-6"><small className="text-muted fw-bold">MOTHER'S NAME</small><p className="fw-semibold">{student.mother_name || 'N/A'}</p></div>
                                         <div className="col-6"><small className="text-muted fw-bold">FATHER'S PHONE</small><p className="fw-semibold">{student.father_phone || 'N/A'}</p></div>
                                         <div className="col-6"><small className="text-muted fw-bold">BLOOD GROUP</small><p className="fw-bold text-danger">{student.blood_type || 'N/A'}</p></div>
                                     </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold m-0"><i className="bi bi-calendar-event me-2 text-success"></i>Recent Attendance</h5>
                            <Link to="/attendance" className="btn btn-sm btn-link text-decoration-none">View All</Link>
                        </div>
                        <div className="card-body p-0 border-top">
                            {attendance.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {attendance.slice(0, 5).map((a, i) => (
                                        <li className="list-group-item d-flex justify-content-between align-items-center py-3" key={i}>
                                            <span className="fw-semibold">{new Date(a.attendance_date).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</span>
                                            <span className={`badge py-2 px-3 rounded-pill ${a.present ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                               {a.present ? 'PRESENT' : 'ABSENT'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-5 text-center text-muted small">No attendance records found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
