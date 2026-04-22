import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const AcademicSettings = () => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState({
        attendance_type: 'Daily',
        final_marks_submission_status: 'closed'
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    async function fetchSettings() {
        try {
            const res = await api.get('/academic-settings');
            if (res.data.academicSetting) {
                setSettings(res.data.academicSetting);
            }
        } catch {
            setMessage({ text: 'Failed to fetch settings.', type: 'danger' });
        }
    }

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdateAttendance = async (type) => {
        try {
            await api.post('/academic-settings/attendance-type', { attendance_type: type });
            setSettings({ ...settings, attendance_type: type });
            setMessage({ text: 'Attendance type updated successfully!', type: 'success' });
        } catch {
            setMessage({ text: 'Failed to update attendance type.', type: 'danger' });
        }
    };

    const handleUpdateMarksStatus = async (status) => {
        try {
            await api.post('/academic-settings/final-marks-submission', { status });
            setSettings({ ...settings, final_marks_submission_status: status });
            setMessage({ text: 'Marks submission status updated successfully!', type: 'success' });
        } catch {
            setMessage({ text: 'Failed to update marks submission status.', type: 'danger' });
        }
    };

    if (user.role !== 'admin') {
        return <div className="container py-5 text-center"><h3>Access Denied</h3></div>;
    }

    return (
        <div className="container-fluid py-4">
                <h2 className="mb-4">Academic Settings</h2>
                
                {message.text && (
                    <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                        {message.text}
                        <button type="button" className="btn-close" onClick={() => setMessage({text:'', type:''})}></button>
                    </div>
                )}

                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-white"><h5 className="mb-0">Attendance Configuration</h5></div>
                            <div className="card-body">
                                <p className="text-muted">Choose how attendance should be recorded in the system.</p>
                                <div className="d-grid gap-3">
                                    <button 
                                        className={`btn py-3 text-start d-flex justify-content-between align-items-center ${settings.attendance_type === 'Daily' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => handleUpdateAttendance('Daily')}
                                    >
                                        <div>
                                            <div className="fw-bold">Daily Attendance</div>
                                            <small className={settings.attendance_type === 'Daily' ? 'text-white-50' : 'text-muted'}>Record attendance once per day for all classes.</small>
                                        </div>
                                        {settings.attendance_type === 'Daily' && <i className="bi bi-check-circle-fill"></i>}
                                    </button>
                                    <button 
                                        className={`btn py-3 text-start d-flex justify-content-between align-items-center ${settings.attendance_type === 'Subject' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => handleUpdateAttendance('Subject')}
                                    >
                                        <div>
                                            <div className="fw-bold">Subject-wise Attendance</div>
                                            <small className={settings.attendance_type === 'Subject' ? 'text-white-50' : 'text-muted'}>Record attendance for every subject period.</small>
                                        </div>
                                        {settings.attendance_type === 'Subject' && <i className="bi bi-check-circle-fill"></i>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-white"><h5 className="mb-0">Final Marks Submission</h5></div>
                            <div className="card-body text-center d-flex flex-column justify-content-center">
                                <p className="text-muted">Control whether teachers can submit final exam marks.</p>
                                <div className={`display-1 my-3 ${settings.final_marks_submission_status === 'open' ? 'text-success' : 'text-danger'}`}>
                                    <i className={`bi bi-shield-lock${settings.final_marks_submission_status === 'open' ? '-fill' : ''}`}></i>
                                </div>
                                <h4 className="text-uppercase fw-bold mb-4">
                                    Status: <span className={settings.final_marks_submission_status === 'open' ? 'text-success' : 'text-danger'}>
                                        {settings.final_marks_submission_status}
                                    </span>
                                </h4>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button 
                                        className="btn btn-success px-4" 
                                        disabled={settings.final_marks_submission_status === 'open'}
                                        onClick={() => handleUpdateMarksStatus('open')}
                                    >
                                        Open Submission
                                    </button>
                                    <button 
                                        className="btn btn-danger px-4" 
                                        disabled={settings.final_marks_submission_status === 'closed'}
                                        onClick={() => handleUpdateMarksStatus('closed')}
                                    >
                                        Close Submission
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default AcademicSettings;
