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
  const [sortBy, setSortBy] = useState('name_asc');

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

  const sortedStudents = [...students].sort((a, b) => {
      if (sortBy === 'name_asc') {
          return a.first_name.localeCompare(b.first_name);
      }
      if (sortBy === 'name_desc') {
          return b.first_name.localeCompare(a.first_name);
      }
      if (sortBy === 'enrollment_asc') {
          return (a.enrollment_no || '').localeCompare(b.enrollment_no || '');
      }
      if (sortBy === 'enrollment_desc') {
          return (b.enrollment_no || '').localeCompare(a.enrollment_no || '');
      }
      return 0;
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0"><i className="bi bi-mortarboard-fill me-2 text-dark"></i>Student Management</h3>
        {hasPermission('create users') && (
          <Link to="/students/add" className="btn btn-dark d-flex align-items-center fw-medium px-4 py-2 rounded-3 shadow-none">
            <i className="bi bi-plus-lg me-2"></i> Add New Student
          </Link>
        )}
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
        <div className="card-body p-4">
          <form className="row g-3 items-end" onSubmit={handleFilterSubmit}>
            <div className="col-md-3">
              <label className="form-label text-muted fw-bold small">Academic Session</label>
              <select className="form-select border-0 bg-light shadow-none" 
                value={filters.session_id} 
                onChange={(e) => setFilters(prev => ({ ...prev, session_id: e.target.value }))}>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.session} {s.current ? "(Current)" : ""}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted fw-bold small">Class</label>
              <select className="form-select border-0 bg-light shadow-none" 
                value={filters.class_id} 
                onChange={(e) => handleClassChange(e.target.value)}>
                <option value="0">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted fw-bold small">Section</label>
              <select className="form-select border-0 bg-light shadow-none" 
                value={filters.section_id} 
                onChange={(e) => setFilters(prev => ({ ...prev, section_id: e.target.value }))}>
                <option value="0">All Sections</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-transparent fw-bold small d-none d-md-block">&nbsp;</label>
              <button type="submit" className="btn btn-dark w-100 py-2 fw-medium shadow-none">
                <i className="bi bi-search me-2"></i> Search Students
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
        <div className="card-header bg-white border-bottom p-3 px-4 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Student Directory</h5>
            <div className="d-flex align-items-center bg-light rounded-3 px-2 py-1 border">
                 <span className="text-muted small fw-bold me-2 ps-2 text-nowrap"><i className="bi bi-sort-down me-1"></i> SORT BY:</span>
                 <select 
                    className="form-select border-0 bg-transparent form-select-sm shadow-none w-auto text-dark fw-medium" 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)}
                    style={{minWidth: '200px'}}
                 >
                     <option value="name_asc">Name (A - Z)</option>
                     <option value="name_desc">Name (Z - A)</option>
                     <option value="enrollment_asc">Enrollment No (Low - High)</option>
                     <option value="enrollment_desc">Enrollment No (High - Low)</option>
                 </select>
            </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 border-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0 text-muted small fw-bold">PHOTO</th>
                  <th className="py-3 border-0 text-muted small fw-bold">FULL NAME</th>
                  <th className="py-3 border-0 text-muted small fw-bold">ENROLLMENT NO</th>
                  <th className="py-3 border-0 text-muted small fw-bold">EMAIL</th>
                  <th className="py-3 border-0 text-muted small fw-bold">CLASS / SECTION</th>
                  <th className="py-3 border-0 text-muted small fw-bold">GENDER</th>
                  <th className="px-4 py-3 border-0 text-muted small fw-bold text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-dark" role="status"></div></td></tr>
                ) : sortedStudents.length > 0 ? (
                  sortedStudents.map(student => (
                    <tr key={student.id}>
                      <td className="px-4 py-3">
                        {student.photo ? (
                          <img src={student.photo} className="rounded-circle shadow-sm" style={{width: '45px', height: '45px', objectFit: 'cover'}} alt="Student" />
                        ) : (
                          <div className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold border" style={{width: '45px', height: '45px'}}>
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                        )}
                      </td>
                      <td className="py-3 fw-bold text-dark">{student.first_name} {student.last_name}</td>
                      <td className="py-3 text-muted fw-medium">{student.enrollment_no || <span className="opacity-50">N/A</span>}</td>
                      <td className="py-3 text-muted">{student.email}</td>
                      <td className="py-3">
                         <span className="badge bg-light text-dark border border-secondary border-opacity-25 py-2 px-3 fw-medium">
                           {student.class_name} <span className="opacity-50 mx-1">/</span> Sec {student.section_name}
                         </span>
                      </td>
                      <td className="py-3">
                         <span className={`badge py-2 px-3 fw-medium ${student.gender === 'Male' ? 'bg-primary bg-opacity-10 text-primary' : 'bg-danger bg-opacity-10 text-danger'}`}>
                            {student.gender}
                         </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                         <div className="d-flex justify-content-end gap-2">
                            <Link to={`/students/profile/${student.id}`} className="text-primary fs-5" title="View Profile">
                               <i className="bi bi-person-lines-fill"></i>
                            </Link>
                            <Link to={`/students/edit/${student.id}`} className="text-warning fs-5" title="Edit Student">
                               <i className="bi bi-pencil-square"></i>
                            </Link>
                            <button className="text-danger fs-5 border-0 bg-transparent p-0" title="Delete Student">
                               <i className="bi bi-trash3-fill"></i>
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center py-5 text-muted h6 fw-normal">No students found matching your criteria.</td></tr>
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
