import React, { useState, useEffect } from 'react';
import api from '../api';

const ManageClasses = () => {
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    
    const [newClass, setNewClass] = useState({ name: '', numeric_name: '' });
    const [newSection, setNewSection] = useState({ name: '' });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchSessions = async () => {
            const res = await api.get('/sessions');
            setSessions(res.data.sessions);
            const current = res.data.sessions.find(s => s.current);
            if (current) {
                setSelectedSession(current.id);
                fetchClasses(current.id);
            }
        };
        fetchSessions();
    }, []);

    const fetchClasses = async (sessionId) => {
        const res = await api.get(`/classes?session_id=${sessionId}`);
        setClasses(res.data.classes);
    };

    const fetchSections = async (classId) => {
        setSelectedClassId(classId);
        const res = await api.get(`/sections?class_id=${classId}`);
        setSections(res.data.sections);
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/classes', { ...newClass, session_id: selectedSession });
            setMessage({ text: 'Class added successfully!', type: 'success' });
            setNewClass({ name: '', numeric_name: '' });
            fetchClasses(selectedSession);
        } catch (err) { setMessage({ text: 'Error adding class.', type: 'danger' }); }
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sections', { ...newSection, class_id: selectedClassId });
            setMessage({ text: 'Section added successfully!', type: 'success' });
            setNewSection({ name: '' });
            fetchSections(selectedClassId);
        } catch (err) { setMessage({ text: 'Error adding section.', type: 'danger' }); }
    };

    return (
        <div className="container-fluid py-4">
            <h2 className="fw-bold mb-4"><i className="bi bi-building me-2 text-primary"></i>Classes & Sections</h2>
            
            <div className="row">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold m-0 text-primary">Manage Classes</h5>
                            <select className="form-select w-auto py-1 small" value={selectedSession} onChange={(e) => { setSelectedSession(e.target.value); fetchClasses(e.target.value); }}>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                            </select>
                        </div>
                        <div className="card-body p-4 border-top">
                            {message.text && <div className={`alert alert-${message.type} small py-2`}>{message.text}</div>}
                            <form className="row g-3 mb-4 p-3 bg-light rounded" onSubmit={handleAddClass}>
                                <div className="col-5"><input type="text" className="form-control" placeholder="Class Name (e.g. Ten)" value={newClass.name} onChange={(e) => setNewClass(p => ({...p, name: e.target.value}))} required /></div>
                                <div className="col-4"><input type="number" className="form-control" placeholder="Numeric (e.g. 10)" value={newClass.numeric_name} onChange={(e) => setNewClass(p => ({...p, numeric_name: e.target.value}))} required /></div>
                                <div className="col-3"><button type="submit" className="btn btn-primary w-100 fw-bold">Add</button></div>
                            </form>
                            <div className="list-group list-group-flush border rounded overflow-hidden">
                                {classes.map(c => (
                                    <button key={c.id} className={`list-group-item list-group-item-action d-flex justify-content-between cursor-pointer ${selectedClassId == c.id ? 'active' : ''}`} onClick={() => fetchSections(c.id)}>
                                        <span>Class {c.name} ({c.numeric_name})</span>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="fw-bold m-0 text-success">Sections for {classes.find(c => c.id == selectedClassId)?.name || '...'}</h5>
                        </div>
                        <div className="card-body p-4 border-top">
                            {!selectedClassId ? (
                                <div className="text-center py-5 text-muted">Select a class first to manage sections.</div>
                            ) : (
                                <>
                                    <form className="row g-3 mb-4 p-3 bg-light rounded" onSubmit={handleAddSection}>
                                        <div className="col-9"><input type="text" className="form-control" placeholder="Section Name (e.g. A)" value={newSection.name} onChange={(e) => setNewSection(p => ({...p, name: e.target.value}))} required /></div>
                                        <div className="col-3"><button type="submit" className="btn btn-success w-100 fw-bold">Add</button></div>
                                    </form>
                                    <div className="row g-3">
                                        {sections.map(s => (
                                            <div className="col-6" key={s.id}>
                                                <div className="p-3 bg-white border border-success border-opacity-25 rounded-3 d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold">Section {s.name}</span>
                                                    <button className="btn btn-sm btn-outline-danger border-0"><i className="bi bi-trash"></i></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageClasses;
