import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ManageRoutines = () => {
  const { user } = useContext(AuthContext);
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
      const [classesRes, sessionsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/sessions')
      ]);
      setClasses(classesRes.data.classes);
      setSessions(sessionsRes.data.sessions);
      
      const currentSession = sessionsRes.data.sessions.find(s => s.is_current);
      if (currentSession) setSelectedSession(currentSession.id);
    } catch (err) {
      setError('Failed to fetch initial data.');
    }
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
    fetchSectionsAndCourses(classId);
  };

  const fetchRoutines = async () => {
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
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/routines/${id}`);
      fetchRoutines();
    } catch (err) {
      setError('Failed to delete routine.');
    }
  };

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
      <div className="container-fluid py-4">
        <h2 className="mb-4">Class Routines</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Session</label>
                <select className="form-select" value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
                  <option value="">Select Session</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Class</label>
                <select className="form-select" value={selectedClass} onChange={handleClassChange}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Section</label>
                <select className="form-select" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                  <option value="">Select Section</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button className="btn btn-primary w-100" onClick={fetchRoutines}>Show Routine</button>
              </div>
            </div>
          </div>
        </div>

        {user.role === 'admin' && selectedClass && selectedSection && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Add New Entry</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddRoutine} className="row g-3">
                <div className="col-md-2">
                  <label className="form-label">Course</label>
                  <select className="form-select" value={newRoutine.course_id} onChange={(e) => setNewRoutine({...newRoutine, course_id: e.target.value})} required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Weekday</label>
                  <select className="form-select" value={newRoutine.weekday} onChange={(e) => setNewRoutine({...newRoutine, weekday: e.target.value})} required>
                    {weekdays.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-select" value={newRoutine.start_time} onChange={(e) => setNewRoutine({...newRoutine, start_time: e.target.value})} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-select" value={newRoutine.end_time} onChange={(e) => setNewRoutine({...newRoutine, end_time: e.target.value})} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Room</label>
                  <input type="text" className="form-control" placeholder="Room #" value={newRoutine.room_number} onChange={(e) => setNewRoutine({...newRoutine, room_number: e.target.value})} />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-success w-100">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Day</th>
                    <th>Course</th>
                    <th>Time</th>
                    <th>Room</th>
                    {user.role === 'admin' && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                  ) : routines.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-4">No routines found.</td></tr>
                  ) : routines.map(r => (
                    <tr key={r.id}>
                      <td>{r.weekday}</td>
                      <td>{r.course_name}</td>
                      <td>{r.start_time.substring(0,5)} - {r.end_time.substring(0,5)}</td>
                      <td>{r.room_number}</td>
                      {user.role === 'admin' && (
                        <td>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRoutine(r.id)}>
                            <i className="bi bi-trash"></i>
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
