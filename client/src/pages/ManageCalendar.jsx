import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ManageCalendar = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newEvent, setNewEvent] = useState({
        title: '',
        start: '',
        end: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const res = await api.get('/sessions');
            setSessions(res.data.sessions);
            const currentSession = res.data.sessions.find(s => s.is_current);
            if (currentSession) {
                setSelectedSession(currentSession.id);
                fetchEvents(currentSession.id);
            }
        } catch (err) {
            setError('Failed to fetch sessions.');
        }
    };

    const fetchEvents = async (sessionId) => {
        setLoading(true);
        try {
            const res = await api.get(`/calendar?session_id=${sessionId}`);
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch events.');
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/calendar', { ...newEvent, session_id: selectedSession });
            fetchEvents(selectedSession);
            setNewEvent({ title: '', start: '', end: '' });
        } catch (err) {
            setError('Failed to create event.');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/calendar/${id}`);
            fetchEvents(selectedSession);
        } catch (err) {
            setError('Failed to delete event.');
        }
    };

    return (
        <div className="container-fluid py-4">
                <h2 className="mb-4">School Calendar</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <label className="form-label">Filter by Session</label>
                        <select className="form-select w-25" value={selectedSession} onChange={(e) => {setSelectedSession(e.target.value); fetchEvents(e.target.value);}}>
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                {user.role === 'admin' && (
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-white"><h5 className="mb-0">Add Calendar Event</h5></div>
                        <div className="card-body">
                            <form onSubmit={handleCreateEvent} className="row g-3">
                                <div className="col-md-5">
                                    <label className="form-label">Event Title</label>
                                    <input type="text" className="form-control" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} required placeholder="Summer Vacation Starts" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Start Date</label>
                                    <input type="date" className="form-control" value={newEvent.start} onChange={(e) => setNewEvent({...newEvent, start: e.target.value})} required />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">End Date</label>
                                    <input type="date" className="form-control" value={newEvent.end} onChange={(e) => setNewEvent({...newEvent, end: e.target.value})} required />
                                </div>
                                <div className="col-md-1 d-flex align-items-end">
                                    <button type="submit" className="btn btn-success w-100">Add</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="card shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th>Event Title</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    {user.role === 'admin' && <th>Action</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                                ) : events.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4">No events found.</td></tr>
                                ) : events.map(event => (
                                    <tr key={event.id}>
                                        <td className="fw-bold">{event.title}</td>
                                        <td>{new Date(event.start).toLocaleDateString()}</td>
                                        <td>{new Date(event.end).toLocaleDateString()}</td>
                                        <td>
                                            {new Date() > new Date(event.end) ? (
                                                <span className="badge bg-secondary">Passed</span>
                                            ) : new Date() < new Date(event.start) ? (
                                                <span className="badge bg-info">Upcoming</span>
                                            ) : (
                                                <span className="badge bg-success">Ongoing</span>
                                            )}
                                        </td>
                                        {user.role === 'admin' && (
                                            <td>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    );
};

export default ManageCalendar;
