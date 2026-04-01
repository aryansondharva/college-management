import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const { role } = useParams();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const roleConfig = {
    student: { title: 'Student', color: 'primary', icon: 'bi-person-video3' },
    teacher: { title: 'Teacher', color: 'success', icon: 'bi-person-badge' },
    admin: { title: 'Admin', color: 'dark', icon: 'bi-shield-lock' }
  }[role] || { title: 'Unifiedtransform', color: 'primary', icon: 'bi-grid-fill' };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { identity, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Inter', sans-serif"
    }}>
      <div className="card shadow-lg border-0 overflow-hidden" 
           style={{ width: '100%', maxWidth: '440px', borderRadius: '28px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
        
        <div className={`p-5 text-center bg-${roleConfig.color} bg-opacity-10 mb-4`}>
          <div className={`bg-${roleConfig.color} rounded-4 p-3 d-inline-flex mb-3 shadow-sm`}>
            <i className={`bi ${roleConfig.icon} text-white fs-1`}></i>
          </div>
          <h2 className="fw-black mb-1 tracking-tight text-dark">{roleConfig.title} Login</h2>
          <p className="text-muted small mb-0 px-4">Welcome back! Please enter your details to access your portal space.</p>
        </div>

        <div className="card-body px-5 pb-5">
          {error && (
            <div className="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center py-3 mb-4">
              <i className="bi bi-exclamation-circle-fill me-2 fs-5"></i>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="form-label fw-bold small mb-2 text-muted uppercase tracking-widest px-2">ID or Email</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 rounded-start-4 ps-4 pe-2"><i className="bi bi-person text-muted"></i></span>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-3 rounded-end-4 shadow-none" 
                  placeholder="e.g. 2024ST001"
                  value={identity} 
                  onChange={(e) => setIdentity(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-bold small mb-2 text-muted uppercase tracking-widest px-2">Secure Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 rounded-start-4 ps-4 pe-2"><i className="bi bi-lock text-muted"></i></span>
                <input 
                  type="password" 
                  className="form-control bg-light border-0 py-3 rounded-end-4 shadow-none" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
                type="submit" 
                className={`btn btn-${roleConfig.color} w-100 fw-bold py-3 rounded-4 shadow-lg transition-all mt-3 border-0`} 
                disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Authenticating...</>
              ) : `Access ${roleConfig.title} Portal`}
            </button>
          </form>
          
          <div className="mt-5 text-center">
            <Link to="/" className="text-decoration-none text-muted small fw-bold">
              <i className="bi bi-arrow-left me-1"></i> Back to Homepage
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
        .fw-black { font-weight: 900; }
        .tracking-tight { letter-spacing: -0.025em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .transition-all { transition: all 0.2s ease; }
        .btn:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
};

export default Login;
