import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const ForgotPassword = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password/verify', { identity });
      setVerifiedUser(res.data.user);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    try {
      await api.post('/auth/forgot-password/reset', {
        user_id: verifiedUser.id,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center min-vh-100 p-4">
      <div className="login-card card border-0 shadow-lg" style={{ maxWidth: '420px', width: '100%', borderRadius: '16px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="mb-3">
              <img src="/logo.png" alt="Drop Logo" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <h2 className="fw-bold text-dark mb-1">Forgot Password</h2>
            <p className="text-muted small">
              {success ? 'Your password has been reset successfully.' : step === 1 ? 'Enter your email or enrollment number to verify your identity.' : 'Set your new password below.'}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger rounded-3 py-2 px-3 small d-flex align-items-center mb-4 border-0 bg-danger bg-opacity-10 text-danger">
              <i className="bi bi-exclamation-circle-fill me-2 fs-6"></i>
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-check-circle-fill text-success fs-1"></i>
                </div>
              </div>
              <p className="text-muted mb-4">You can now login with your new password.</p>
              <button className="btn btn-dark w-100 py-3 rounded-3 fw-medium mb-3 login-btn" onClick={() => navigate(`/login/${role || 'student'}`)}>
                Go to Login
              </button>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleVerify}>
              <div className="mb-4">
                <label className="form-label text-dark fw-medium small mb-2">Email or Enrollment No</label>
                <input type="text" className="form-control custom-input" placeholder="e.g. 2024ST001 or student@email.com" value={identity} onChange={(e) => setIdentity(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-dark w-100 py-3 rounded-3 fw-medium mb-4 login-btn" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Verifying...</> : 'Verify Identity'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <div className="text-center mb-4 p-3 bg-light rounded-3">
                <div className="fw-bold text-dark">{verifiedUser.first_name} {verifiedUser.last_name}</div>
                <div className="small text-muted">{verifiedUser.email}</div>
                {verifiedUser.enrollment_no && <div className="small text-muted">{verifiedUser.enrollment_no}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label text-dark fw-medium small mb-2">New Password</label>
                <input type="password" className="form-control custom-input" placeholder="Minimum 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="mb-4">
                <label className="form-label text-dark fw-medium small mb-2">Confirm New Password</label>
                <input type="password" className="form-control custom-input" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <button type="submit" className="btn btn-dark w-100 py-3 rounded-3 fw-medium mb-3 login-btn" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Resetting...</> : 'Reset Password'}
              </button>
              <button type="button" className="btn btn-outline-dark w-100 py-2 rounded-3 fw-medium" onClick={() => { setStep(1); setVerifiedUser(null); setError(''); }}>
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
            </form>
          )}

          <div className="text-center mt-3">
            <Link to={`/login/${role || 'student'}`} className="text-decoration-none text-muted small hover-text-dark transition-colors">
              <i className="bi bi-arrow-left me-1"></i> Back to Login
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body, html { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .login-container { background-color: #fafafa; background: radial-gradient(circle at 50% 0%, #f4f6f9 0%, #fdfdfd 100%); }
        .login-card { background: #ffffff; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08) !important; }
        .custom-input { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.95rem; box-shadow: none !important; transition: all 0.2s ease; background-color: #f8fafc; }
        .custom-input:focus { border-color: #cbd5e1; background-color: #ffffff; }
        .custom-input::placeholder { color: #94a3b8; font-weight: 300; }
        .login-btn { transition: background-color 0.2s, transform 0.1s; }
        .login-btn:active:not(:disabled) { transform: scale(0.98); }
        .hover-text-dark:hover { color: #212529 !important; }
        .transition-colors { transition: color 0.2s ease; }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
