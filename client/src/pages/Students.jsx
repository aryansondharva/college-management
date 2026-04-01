import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';

const Students = () => {
  const { hasPermission } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
     session_id: '',
     class_id: '0',
     section_id: '0'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await api.get('/sessions');
        setSessions(sessionRes.data.sessions);
        
        // Find current session
        const current = sessionRes.data.sessions.find(s => s.current);
        if (current) {
          setFilters(prev => ({ ...prev, session_id: current.id }));
          fetchInitialData(current.id);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchInitialData = async (sessionId) => {
      try {
        const classRes = await api.get(`/classes?session_id=${sessionId}`);
        setClasses(classRes.data.classes);
        fetchStudents({ ...filters, session_id: sessionId });
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const fetchStudents = async (currentFilters) => {
    setLoading(true);
    try {
      const res = await api.get(`/users/students`, { params: currentFilters });
      setStudents(res.data.students);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = async (classId) => {
    setFilters(prev => ({ ...prev, class_id: classId, section_id: '0' }));
    if (classId !== '0') {
      try {
        const res = await api.get(`/sections?class_id=${classId}`);
        setSections(res.data.sections);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSections([]);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchStudents(filters);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0"><i className="bi bi-mortarboard-fill me-2 text-primary"></i>Student Management</h2>
        {hasPermission('create users') && (
          <Link to="/students/add" className="btn btn-primary d-flex align-items-center fw-semibold">
            <i className="bi bi-plus-lg me-2"></i> Add New Student
          </Link>
        )}
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-4">
          <form className="row g-3" onSubmit={handleFilterSubmit}>
            <div className="col-md-3">
              <label className="form-label text-muted small fw-bold text-uppercase">Academic Session</label>
              <select className="form-select border-0 bg-light" 
                value={filters.session_id} 
                onChange={(e) => setFilters(prev => ({ ...prev, session_id: e.target.value }))}>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.session} {s.current ? "(Current)" : ""}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted small fw-bold text-uppercase">Class</label>
              <select className="form-select border-0 bg-light" 
                value={filters.class_id} 
                onChange={(e) => handleClassChange(e.target.value)}>
                <option value="0">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted small fw-bold text-uppercase">Section</label>
              <select className="form-select border-0 bg-light" 
                value={filters.section_id} 
                onChange={(e) => setFilters(prev => ({ ...prev, section_id: e.target.value }))}>
                <option value="0">All Sections</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button type="submit" className="btn btn-dark w-100 py-2">
                <i className="bi bi-search me-2"></i> Search Students
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase">Photo</th>
                  <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Full Name</th>
                  <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Enrollment No</th>
                  <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Email</th>
                  <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Class / Section</th>
                  <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Gender</th>
                  <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></td></tr>
                ) : students.length > 0 ? (
                  students.map(student => (
                    <tr key={student.id}>
                      <td className="px-4 py-3">
                        {student.photo ? (
                          <img src={student.photo} className="rounded-circle shadow-sm" style={{width: '45px', height: '45px', objectFit: 'cover'}} alt="Student" />
                        ) : (
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: '45px', height: '45px'}}>
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                        )}
                      </td>
                      <td className="py-3 fw-bold">{student.first_name} {student.last_name}</td>
                      <td className="py-3 text-muted">{student.enrollment_no || 'N/A'}</td>
                      <td className="py-3 text-muted">{student.email}</td>
                      <td className="py-3">
                         <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 py-2 px-3">
                           {student.class_name} - Section {student.section_name}
                         </span>
                      </td>
                      <td className="py-3">
                         <span className={`badge py-2 px-3 ${student.gender === 'Male' ? 'bg-info bg-opacity-10 text-info' : 'bg-danger bg-opacity-10 text-danger'}`}>
                            {student.gender}
                         </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                         <div className="btn-group">
                            <Link to={`/students/profile/${student.id}`} className="btn btn-sm btn-outline-primary shadow-none border-0 rounded-3 me-1">
                               <i className="bi bi-person-lines-fill fs-5"></i>
                            </Link>
                            <Link to={`/students/edit/${student.id}`} className="btn btn-sm btn-outline-warning shadow-none border-0 rounded-3 me-1">
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
                  <tr><td colSpan="6" className="text-center py-5 text-muted h5">No students found for this selection.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
