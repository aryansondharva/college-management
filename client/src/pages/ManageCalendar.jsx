import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const EVENT_TYPES = [
    { key: 'holiday', label: 'Holiday', color: '#ef4444', bg: '#fef2f2', icon: 'bi-umbrella' },
    { key: 'exam', label: 'Examination', color: '#f59e0b', bg: '#fffbeb', icon: 'bi-journal-text' },
    { key: 'event', label: 'Event / Function', color: '#8b5cf6', bg: '#f5f3ff', icon: 'bi-stars' },
    { key: 'meeting', label: 'Meeting', color: '#3b82f6', bg: '#eff6ff', icon: 'bi-people' },
    { key: 'other', label: 'Other', color: '#64748b', bg: '#f8fafc', icon: 'bi-bookmark' },
];

const getTypeInfo = (type) => EVENT_TYPES.find(t => t.key === type) || EVENT_TYPES[4];

// Build the month grid for a given year/month
const buildMonthGrid = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
};

const ManageCalendar = () => {
    const { user, hasPermission } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [filterType, setFilterType] = useState('all');

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const [newEvent, setNewEvent] = useState({
        title: '',
        start: '',
        end: '',
        type: 'holiday',
        description: ''
    });

    const canManage = hasPermission('manage events') || user?.role === 'admin';

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const res = await api.get('/sessions');
            setSessions(res.data.sessions);
            const currentSession = res.data.sessions.find(s => s.current);
            if (currentSession) {
                setSelectedSession(currentSession.id);
                fetchEvents(currentSession.id);
            }
        } catch (err) {
            setError('Failed to fetch sessions.');
        }
    };

    const fetchEvents = async (sessionId) => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const res = await api.get(`/events?session_id=${sessionId}`);
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
            await api.post('/events', {
                title: newEvent.title,
                start: newEvent.start,
                end: newEvent.end,
                session_id: selectedSession,
                type: 'create',
                eventType: newEvent.type,
            });
            fetchEvents(selectedSession);
            setNewEvent({ title: '', start: '', end: '', type: 'holiday', description: '' });
            setShowForm(false);
        } catch (err) {
            setError('Failed to create event.');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.post('/events', { type: 'delete', id });
            fetchEvents(selectedSession);
        } catch (err) {
            setError('Failed to delete event.');
        }
    };

    // Get events that fall on a specific date
    const getEventsForDate = (year, month, day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(ev => {
            const start = ev.start ? ev.start.substring(0, 10) : '';
            const end = ev.end ? ev.end.substring(0, 10) : '';
            return dateStr >= start && dateStr <= end;
        });
    };

    const getEventStatus = (ev) => {
        const now = new Date();
        const start = new Date(ev.start);
        const end = new Date(ev.end);
        if (now > end) return { label: 'Passed', cls: 'bg-secondary bg-opacity-10 text-secondary' };
        if (now < start) return { label: 'Upcoming', cls: 'bg-primary bg-opacity-10 text-primary' };
        return { label: 'Ongoing', cls: 'bg-success bg-opacity-10 text-success' };
    };

    const monthGrid = buildMonthGrid(viewYear, viewMonth);
    const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });
    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const handlePrintCalendar = () => {
        const sessionName = sessions.find(s => s.id == selectedSession)?.session || 'Academic Session';
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Academic Calendar - ${sessionName}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #222; }
                        h2 { text-align: center; margin-bottom: 5px; }
                        .subtitle { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #f4f4f4; text-align: left; padding: 12px; border: 1px solid #ddd; font-size: 13px; }
                        td { padding: 12px; border: 1px solid #ddd; font-size: 13px; }
                        .type-badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <h2>ANNUAL ACADEMIC CALENDAR</h2>
                    <div class="subtitle">${sessionName} Academic Events, Holidays & Examinations</div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 15%">Date Range</th>
                                <th style="width: 50%">Event Title</th>
                                <th style="width: 20%">Type</th>
                                <th style="width: 15%">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${events.sort((a,b) => new Date(a.start) - new Date(b.start)).map(ev => {
                                const t = getTypeInfo(ev.type);
                                const start = new Date(ev.start).toLocaleDateString();
                                const end = ev.end ? new Date(ev.end).toLocaleDateString() : start;
                                return `
                                    <tr>
                                        <td>${start === end ? start : `${start} - ${end}`}</td>
                                        <td><b>${ev.title}</b></td>
                                        <td><span class="type-badge" style="background:${t.bg}; color:${t.color}">${t.label}</span></td>
                                        <td>${getEventStatus(ev).label}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    <div style="margin-top: 50px; text-align: right; color: #999; font-size: 10px;">
                        Generated on ${new Date().toLocaleString()} | Unitransform Enterprise Edition
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const filteredEvents = filterType === 'all' ? events : events.filter(e => e.type === filterType);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold m-0"><i className="bi bi-calendar3-week me-2 text-dark"></i>Academic Calendar</h3>
                    <p className="text-muted small m-0 mt-1">Plan and manage academic events, holidays & examinations</p>
                </div>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <select
                        className="form-select border-0 bg-light shadow-none fw-medium"
                        style={{minWidth: '180px'}}
                        value={selectedSession}
                        onChange={(e) => { setSelectedSession(e.target.value); fetchEvents(e.target.value); }}
                    >
                        <option value="">Select Session</option>
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.session} {s.current ? '(Current)' : ''}</option>)}
                    </select>
                    {canManage && (
                        <>
                            <button className="btn btn-outline-dark fw-medium px-3 py-2 shadow-none rounded-3 me-2" onClick={handlePrintCalendar}>
                                <i className="bi bi-printer me-2"></i>Print Summary
                            </button>
                            <button className="btn btn-dark fw-medium px-4 py-2 shadow-none rounded-3" onClick={() => setShowForm(!showForm)}>
                                <i className={`bi bi-${showForm ? 'dash-lg' : 'plus-lg'} me-2`}></i>{showForm ? 'Cancel' : 'Add Event'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {error && <div className="alert alert-danger border-0 rounded-3 shadow-sm">{error}</div>}

            {/* Type legend pills */}
            <div className="d-flex gap-2 mb-4 flex-wrap">
                <button
                    className={`btn btn-sm rounded-pill px-3 fw-medium shadow-none ${filterType === 'all' ? 'btn-dark' : 'btn-light'}`}
                    onClick={() => setFilterType('all')}
                >All Events</button>
                {EVENT_TYPES.map(t => (
                    <button
                        key={t.key}
                        className={`btn btn-sm rounded-pill px-3 fw-medium shadow-none`}
                        style={{
                            background: filterType === t.key ? t.color : t.bg,
                            color: filterType === t.key ? '#fff' : t.color,
                            border: `1.5px solid ${t.color}30`
                        }}
                        onClick={() => setFilterType(filterType === t.key ? 'all' : t.key)}
                    >
                        <i className={`bi ${t.icon} me-1`}></i>{t.label}
                    </button>
                ))}
            </div>

            {/* Add Event Form */}
            {showForm && (
                <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                    <div className="card-header bg-white border-bottom px-4 py-3">
                        <h6 className="fw-bold mb-0">New Calendar Event</h6>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={handleCreateEvent}>
                            <div className="row g-3">
                                <div className="col-md-5">
                                    <label className="form-label small fw-bold text-muted">Event Title</label>
                                    <input type="text" className="form-control bg-light border-0 shadow-none" placeholder="e.g. Diwali Vacation" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-muted">Type</label>
                                    <select className="form-select bg-light border-0 shadow-none" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                                        {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-muted">Start Date</label>
                                    <input type="date" className="form-control bg-light border-0 shadow-none" value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})} required />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-bold text-muted">End Date</label>
                                    <input type="date" className="form-control bg-light border-0 shadow-none" value={newEvent.end} onChange={e => setNewEvent({...newEvent, end: e.target.value})} required />
                                </div>
                                <div className="col-md-1 d-flex align-items-end">
                                    <button type="submit" className="btn btn-dark w-100 py-2 shadow-none fw-bold"><i className="bi bi-check-lg"></i></button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="row g-4">
                {/* Left: Mini Calendar */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100">
                        {/* Month navigation */}
                        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
                            <button className="btn btn-sm btn-light rounded-circle p-0 shadow-none d-flex align-items-center justify-content-center" style={{width:'32px',height:'32px'}} onClick={prevMonth}>
                                <i className="bi bi-chevron-left small"></i>
                            </button>
                            <h6 className="fw-bold m-0">{monthName} {viewYear}</h6>
                            <button className="btn btn-sm btn-light rounded-circle p-0 shadow-none d-flex align-items-center justify-content-center" style={{width:'32px',height:'32px'}} onClick={nextMonth}>
                                <i className="bi bi-chevron-right small"></i>
                            </button>
                        </div>
                        <div className="card-body p-3">
                            {/* Weekday headers */}
                            <div className="d-grid mb-1" style={{gridTemplateColumns: 'repeat(7, 1fr)'}}>
                                {WEEKDAYS.map(d => (
                                    <div key={d} className="text-center text-muted fw-bold" style={{fontSize: '0.7rem', padding: '4px 0'}}>{d}</div>
                                ))}
                            </div>
                            {/* Day cells */}
                            <div className="d-grid" style={{gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px'}}>
                                {monthGrid.map((day, idx) => {
                                    if (!day) return <div key={`empty-${idx}`}></div>;
                                    const dayEvents = getEventsForDate(viewYear, viewMonth, day);
                                    const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
                                    return (
                                        <div
                                            key={day}
                                            className={`d-flex flex-column align-items-center justify-content-start rounded-2 p-1 position-relative`}
                                            style={{
                                                minHeight: '40px',
                                                background: isToday ? '#1e293b' : dayEvents.length > 0 ? '#f8fafc' : 'transparent',
                                                cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                                            }}
                                        >
                                            <span className="fw-bold" style={{fontSize: '0.8rem', color: isToday ? '#fff' : '#334155'}}>{day}</span>
                                            {dayEvents.length > 0 && !isToday && (
                                                <div className="d-flex gap-1 mt-1 flex-wrap justify-content-center">
                                                    {dayEvents.slice(0,2).map((ev, i) => {
                                                        const t = getTypeInfo(ev.type);
                                                        return <span key={i} className="rounded-circle" style={{width:'6px',height:'6px',background:t.color, display:'inline-block'}}></span>;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="px-3 pb-3">
                            {EVENT_TYPES.map(t => (
                                <div key={t.key} className="d-flex align-items-center gap-2 mb-1">
                                    <span className="rounded-circle flex-shrink-0" style={{width:'8px',height:'8px',background:t.color,display:'inline-block'}}></span>
                                    <span className="text-muted small fw-medium">{t.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Events List */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                        <div className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
                            <h6 className="fw-bold mb-0">
                                <i className="bi bi-list-ul me-2 text-dark"></i>
                                Academic Events <span className="badge bg-dark bg-opacity-10 text-dark ms-2 rounded-pill fw-bold">{filteredEvents.length}</span>
                            </h6>
                        </div>
                        <div className="card-body p-0" style={{maxHeight: '520px', overflowY: 'auto'}}>
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-dark" role="status"></div></div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-calendar-x fs-1 d-block mb-2 opacity-50"></i>
                                    <h6 className="fw-normal">No events found for this session.</h6>
                                    {canManage && <p className="small">Click "Add Event" to get started.</p>}
                                </div>
                            ) : filteredEvents.map(ev => {
                                const typeInfo = getTypeInfo(ev.type);
                                const status = getEventStatus(ev);
                                const startStr = ev.start ? new Date(ev.start).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '-';
                                const endStr = ev.end ? new Date(ev.end).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '-';
                                return (
                                    <div key={ev.id} className="d-flex align-items-center px-4 py-3 border-bottom event-row">
                                        <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{width:'44px',height:'44px',background:typeInfo.bg}}>
                                            <i className={`bi ${typeInfo.icon}`} style={{color:typeInfo.color, fontSize:'1.2rem'}}></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <h6 className="fw-bold mb-0 text-dark">{ev.title}</h6>
                                                <span className="badge rounded-pill fw-medium small" style={{background: typeInfo.bg, color: typeInfo.color, border:`1px solid ${typeInfo.color}30`}}>{typeInfo.label}</span>
                                            </div>
                                            <div className="text-muted small fw-medium">
                                                <i className="bi bi-calendar3 me-1"></i>{startStr}
                                                {startStr !== endStr && <><span className="mx-2 opacity-50">→</span>{endStr}</>}
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 ms-3">
                                            <span className={`badge rounded-pill px-3 py-2 fw-bold small ${status.cls}`}>{status.label}</span>
                                            {canManage && (
                                                <button className="text-danger fs-5 border-0 bg-transparent p-0" title="Delete" onClick={() => handleDeleteEvent(ev.id)}>
                                                    <i className="bi bi-trash3-fill"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .event-row { transition: background 0.15s; }
                .event-row:hover { background: #f8fafc; }
            `}</style>
        </div>
    );
};

export default ManageCalendar;
