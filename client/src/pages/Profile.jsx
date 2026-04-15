import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        birthday: '',
        address: ''
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [emailData, setEmailData] = useState({
        new_email: '',
        otp: ''
    });
    const [showEmailOTP, setShowEmailOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
                gender: user.gender || 'Male',
                birthday: user.birthday ? user.birthday.split('T')[0] : '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await api.post('/auth/profile', formData);
            setUser({ ...user, ...formData });
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await api.post('/auth/change-password', passwordData);
            setMessage({ text: 'Password changed successfully!', type: 'success' });
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to change password.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!emailData.new_email) {
            setMessage({ text: 'Please enter a new email address.', type: 'danger' });
            return;
        }
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await api.post('/auth/send-otp', { email: emailData.new_email });
            setShowEmailOTP(true);
            setMessage({ text: 'OTP sent to your email. Please check your inbox.', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to send OTP.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!emailData.otp) {
            setMessage({ text: 'Please enter the OTP.', type: 'danger' });
            return;
        }
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await api.post('/auth/verify-otp', { email: emailData.new_email, otp: emailData.otp });
            setUser({ ...user, email: emailData.new_email });
            setFormData({ ...formData, email: emailData.new_email });
            setEmailData({ new_email: '', otp: '' });
            setShowEmailOTP(false);
            setMessage({ text: 'Email updated successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to verify OTP.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const cancelEmailUpdate = () => {
        setEmailData({ new_email: '', otp: '' });
        setShowEmailOTP(false);
        setMessage({ text: '', type: '' });
    };

    return (
        <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold m-0"><i className="bi bi-person-circle me-2 text-primary"></i>My Profile</h2>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type} alert-dismissible fade show border-0 shadow-sm mb-4`} role="alert">
                        {message.text}
                        <button type="button" className="btn-close" onClick={() => setMessage({text:'', type:''})}></button>
                    </div>
                )}

                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-header bg-white py-3 border-0">
                                <h5 className="fw-bold m-0">General Information</h5>
                            </div>
                            <div className="card-body p-4 border-top">
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">First Name</label>
                                            <input type="text" className="form-control" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Last Name</label>
                                            <input type="text" className="form-control" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Email Address</label>
                                            <div className="input-group">
                                                <input 
                                                    type="email" 
                                                    className="form-control" 
                                                    value={showEmailOTP ? emailData.new_email : formData.email} 
                                                    onChange={(e) => showEmailOTP ? setEmailData({...emailData, new_email: e.target.value}) : setFormData({...formData, email: e.target.value})}
                                                    disabled={showEmailOTP}
                                                    required 
                                                />
                                                {!showEmailOTP && (
                                                    <button className="btn btn-outline-primary" type="button" onClick={() => setShowEmailOTP(true)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                )}
                                            </div>
                                            {showEmailOTP && (
                                                <div className="mt-3 p-3 bg-light rounded-3">
                                                    <p className="small text-muted mb-2">Enter new email and verify with OTP:</p>
                                                    <div className="input-group mb-2">
                                                        <input 
                                                            type="email" 
                                                            className="form-control" 
                                                            placeholder="New email address"
                                                            value={emailData.new_email}
                                                            onChange={(e) => setEmailData({...emailData, new_email: e.target.value})}
                                                        />
                                                        <button className="btn btn-primary" type="button" onClick={handleSendOTP} disabled={loading}>
                                                            {loading ? 'Sending...' : 'Send OTP'}
                                                        </button>
                                                    </div>
                                                    <div className="input-group">
                                                        <input 
                                                            type="text" 
                                                            className="form-control" 
                                                            placeholder="Enter 6-digit OTP"
                                                            value={emailData.otp}
                                                            onChange={(e) => setEmailData({...emailData, otp: e.target.value})}
                                                            maxLength={6}
                                                        />
                                                        <button className="btn btn-success" type="button" onClick={handleVerifyOTP} disabled={loading}>
                                                            {loading ? 'Verifying...' : 'Verify'}
                                                        </button>
                                                        <button className="btn btn-outline-secondary" type="button" onClick={cancelEmailUpdate}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                    <small className="text-muted">OTP will expire in 10 minutes.</small>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Phone Number</label>
                                            <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Gender</label>
                                            <select className="form-select" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Date of Birth</label>
                                            <input type="date" className="form-control" value={formData.birthday} onChange={(e) => setFormData({...formData, birthday: e.target.value})} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">Address</label>
                                            <textarea className="form-control" rows="2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary px-5 py-2 fw-bold rounded-pill" disabled={loading}>
                                        {loading ? 'Saving Changes...' : 'Update Information'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 rounded-4 mb-4">
                            <div className="card-header bg-white py-3 border-0">
                                <h5 className="fw-bold m-0"><i className="bi bi-shield-lock me-2 text-warning"></i>Security Settings</h5>
                            </div>
                            <div className="card-body p-4 border-top">
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Current Password</label>
                                        <input type="password" name="current_password" className="form-control" value={passwordData.current_password} onChange={(e) => setPasswordData({...passwordData, [e.target.name]: e.target.value})} required />
                                    </div>
                                    <hr className="my-4 opacity-10" />
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">New Password</label>
                                        <input type="password" name="new_password" className="form-control" value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, [e.target.name]: e.target.value})} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold">Confirm New Password</label>
                                        <input type="password" name="new_password_confirmation" className="form-control" value={passwordData.new_password_confirmation} onChange={(e) => setPasswordData({...passwordData, [e.target.name]: e.target.value})} required />
                                    </div>
                                    <button type="submit" className="btn btn-dark w-100 py-2 fw-bold rounded-pill" disabled={loading}>
                                        {loading ? 'Changing...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4 bg-primary welcome-card text-white overflow-hidden p-4">
                             <div className="text-center py-3">
                                 <div className="mb-3">
                                     <div className="bg-white bg-opacity-20 d-inline-flex p-3 rounded-circle border border-white border-opacity-25 mb-2">
                                        <i className="bi bi-shield-check fs-1"></i>
                                     </div>
                                 </div>
                                 <h5 className="fw-bold">Security Status</h5>
                                 <p className="small opacity-75">Your account is secure. Keep your password updated regularly.</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default Profile;
