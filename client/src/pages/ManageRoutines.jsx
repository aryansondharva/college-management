import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ManageRoutines = () => {
  const { user, hasPermission } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [routines, setRoutines] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newRoutine, setNewRoutine] = useState({
    course_id: '',
    weekday: 'Monday',
    start_time: '',
    end_time: '',
    room_number: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const sessionsRes = await api.get('/sessions');
      setSessions(sessionsRes.data.sessions);
      
      const currentSession = sessionsRes.data.sessions.find(s => s.current);
      if (currentSession) {
        setSelectedSession(currentSession.id);
        fetchClasses(currentSession.id);
      }
    } catch (err) {
      setError('Failed to fetch initial data.');
    }
  };

  const fetchClasses = async (sessionId) => {
    if (!sessionId) {
      setClasses([]);
      return;
    }
    try {
      const res = await api.get(`/classes?session_id=${sessionId}`);
      setClasses(res.data.classes);
    } catch (err) {
      setError('Failed to fetch classes.');
    }
  };

  const handleSessionChange = (e) => {
    const sId = e.target.value;
    setSelectedSession(sId);
    setSelectedClass('');
    setSelectedSection('');
    setClasses([]);
    setSections([]);
    setCourses([]);
    fetchClasses(sId);
  };

  const fetchSectionsAndCourses = async (classId) => {
    if (!classId) return;
    try {
      const [sectionsRes, coursesRes] = await Promise.all([
        api.get(`/sections?class_id=${classId}`),
        api.get(`/courses?class_id=${classId}`)
      ]);
      setSections(sectionsRes.data.sections);
      setCourses(coursesRes.data.courses);
    } catch (err) {
      setError('Failed to fetch sections/courses.');
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedSection('');
    fetchSectionsAndCourses(classId);
  };

  const fetchRoutines = async (e) => {
    if (e) e.preventDefault();
    if (!selectedClass || !selectedSection || !selectedSession) return;
    setLoading(true);
    try {
      const res = await api.get(`/routines?class_id=${selectedClass}&section_id=${selectedSection}&session_id=${selectedSession}`);
      setRoutines(res.data.routines);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch routines.');
      setLoading(false);
    }
  };

  const handleAddRoutine = async (e) => {
    e.preventDefault();
    try {
      await api.post('/routines', {
        ...newRoutine,
        class_id: selectedClass,
        section_id: selectedSection,
        session_id: selectedSession
      });
      fetchRoutines();
      setNewRoutine({ course_id: '', weekday: 'Monday', start_time: '', end_time: '', room_number: '' });
    } catch (err) {
      setError('Failed to add routine.');
    }
  };

  const handleDeleteRoutine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class routine?')) return;
    try {
      await api.delete(`/routines/${id}`);
      fetchRoutines();
    } catch (err) {
      setError('Failed to delete routine.');
    }
  };

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const canCreate = hasPermission('create routines') || user?.role === 'admin';

  return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0"><i className="bi bi-calendar3 me-2 text-dark"></i>Class Routines</h3>
        </div>
        
        {error && <div className="alert alert-danger shadow-sm border-0 rounded-3">{error}</div>}

        <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
          <div className="card-body p-4">
            <form className="row g-3 items-end" onSubmit={fetchRoutines}>
              <div className="col-md-3">
                <label className="form-label text-muted fw-bold small">Academic Session</label>
                <select className="form-select border-0 bg-light shadow-none" value={selectedSession} onChange={handleSessionChange}>
                  <option value="">Select Session</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.session} {s.current ? '(Current)' : ''}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted fw-bold small">Class</label>
                <select className="form-select border-0 bg-light shadow-none" value={selectedClass} onChange={handleClassChange}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted fw-bold small">Section</label>
                <select className="form-select border-0 bg-light shadow-none" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                  <option value="">Select Section</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label text-transparent fw-bold small d-none d-md-block">&nbsp;</label>
                <button type="submit" className="btn btn-dark w-100 py-2 fw-medium shadow-none">
                  <i className="bi bi-search me-2"></i> Show Routine
                </button>
              </div>
            </form>
          </div>
        </div>

        {canCreate && selectedClass && selectedSection && (
          <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white overflow-hidden">
            <div className="card-header bg-white border-bottom p-3 px-4">
              <h6 className="mb-0 fw-bold">Add New Routine Entry</h6>
            </div>
            <div className="card-body px-4 py-4">
              <form onSubmit={handleAddRoutine} className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted">Course</label>
                  <select className="form-select bg-light border-0 shadow-none" value={newRoutine.course_id} onChange={(e) => setNewRoutine({...newRoutine, course_id: e.target.value})} required>
                    <option value="">Select</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-bold text-muted">Weekday</label>
                  <select className="form-select bg-light border-0 shadow-none" value={newRoutine.weekday} onChange={(e) => setNewRoutine({...newRoutine, weekday: e.target.value})} required>
                    {weekdays.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-bold text-muted">Start Time</label>
                  <input type="time" className="form-control bg-light border-0 shadow-none" value={newRoutine.start_time} onChange={(e) => setNewRoutine({...newRoutine, start_time: e.target.value})} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-bold text-muted">End Time</label>
                  <input type="time" className="form-control bg-light border-0 shadow-none" value={newRoutine.end_time} onChange={(e) => setNewRoutine({...newRoutine, end_time: e.target.value})} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-bold text-muted">Room</label>
                  <input type="text" className="form-control bg-light border-0 shadow-none" placeholder="e.g. D1-202" value={newRoutine.room_number} onChange={(e) => setNewRoutine({...newRoutine, room_number: e.target.value})} />
                </div>
                <div className="col-md-1 d-flex align-items-end">
                  <label className="form-label text-transparent small fw-bold d-none d-md-block">&nbsp;</label>
                  <button type="submit" className="btn btn-primary w-100 py-2 shadow-none"><i className="bi bi-plus-lg"></i></button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card shadow-sm border-0 rounded-4 bg-white overflow-hidden">
          <div className="card-header bg-white border-bottom p-3 px-4">
              <h5 className="mb-0 fw-bold">Weekly Schedule</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 border-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 border-0 text-muted small fw-bold">DAY</th>
                    <th className="py-3 border-0 text-muted small fw-bold">COURSE</th>
                    <th className="py-3 border-0 text-muted small fw-bold">TIME SLOT</th>
                    <th className="py-3 border-0 text-muted small fw-bold">LOCATION</th>
                    {canCreate && <th className="px-4 py-3 border-0 text-muted small fw-bold text-end">ACTIONS</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-dark" role="status"></div></td></tr>
                  ) : routines.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted h6 fw-normal">Select filters and click "Show Routine"</td></tr>
                  ) : routines.map(r => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 fw-bold text-dark">{r.day_of_week}</td>
                      <td className="py-3 fw-medium">
                        {r.course_name ? r.course_name : <span className="opacity-50">Unknown</span>}
                      </td>
                      <td className="py-3 text-muted">
                        <span className="bg-light px-2 py-1 rounded-2 border">{r.start_time?.substring(0,5)}</span> 
                        <span className="mx-2 opacity-50">-</span> 
                        <span className="bg-light px-2 py-1 rounded-2 border">{r.end_time?.substring(0,5)}</span>
                      </td>
                      <td className="py-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary py-2 px-3 fw-medium">
                           {r.room_no || 'TBA'}
                        </span>
                      </td>
                      {canCreate && (
                        <td className="px-4 py-3 text-end">
                          <button className="text-danger fs-5 border-0 bg-transparent p-0" title="Delete Routine" onClick={() => handleDeleteRoutine(r.id)}>
                             <i className="bi bi-trash3-fill"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ManageRoutines;
