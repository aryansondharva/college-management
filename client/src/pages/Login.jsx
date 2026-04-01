import React, { useState, useContext } from 'react';
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
    student: { title: 'Student', icon: 'bi-mortarboard' },
    teacher: { title: 'Teacher', icon: 'bi-person-workspace' },
    admin: { title: 'Admin', icon: 'bi-shield-check' }
  }[role] || { title: 'Unitransform', icon: 'bi-layers-fill' };

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
    <div className="login-container d-flex align-items-center justify-content-center min-vh-100 p-4">
      <div className="login-card card border-0 shadow-lg" style={{ maxWidth: '420px', width: '100%', borderRadius: '16px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="icon-circle bg-light d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px' }}>
              <i className={`bi ${roleConfig.icon} fs-2 text-dark`}></i>
            </div>
            <h2 className="fw-bold text-dark mb-1">{roleConfig.title} Login</h2>
            <p className="text-muted small">Please enter your credentials to proceed.</p>
          </div>

          {error && (
            <div className="alert alert-danger rounded-3 py-2 px-3 small d-flex align-items-center mb-4 border-0 bg-danger bg-opacity-10 text-danger mt-3">
              <i className="bi bi-exclamation-circle-fill me-2 fs-6"></i>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="form-label text-dark fw-medium small mb-2">ID or Email</label>
              <input 
                type="text" 
                className="form-control custom-input" 
                placeholder="e.g. 2024ST001"
                value={identity} 
                onChange={(e) => setIdentity(e.target.value)}
                required 
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label text-dark fw-medium small mb-2">Password</label>
              <input 
                type="password" 
                className="form-control custom-input" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 small">
              <div className="form-check">
                <input className="form-check-input shadow-none focus-ring-none" type="checkbox" id="remember" />
                <label className="form-check-label text-muted" htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="text-dark text-decoration-none hover-underline">Forgot password?</a>
            </div>

            <button 
                type="submit" 
                className="btn btn-dark w-100 py-3 rounded-3 fw-medium mb-4 login-btn" 
                disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Authenticating...</>
              ) : `Log In`}
            </button>
          </form>
          
          <div className="text-center">
            <Link to="/" className="text-decoration-none text-muted small hover-text-dark transition-colors">
              <i className="bi bi-arrow-left me-1"></i> Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body, html {
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        .login-container {
            background-color: #fafafa;
            background: radial-gradient(circle at 50% 0%, #f4f6f9 0%, #fdfdfd 100%);
        }

        .login-card {
            background: #ffffff;
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08) !important;
        }

        .custom-input {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
            box-shadow: none !important;
            transition: all 0.2s ease;
            background-color: #f8fafc;
        }

        .custom-input:focus {
            border-color: #cbd5e1;
            background-color: #ffffff;
        }

        .custom-input::placeholder {
            color: #94a3b8;
            font-weight: 300;
        }

        .form-check-input:checked {
            background-color: #212529;
            border-color: #212529;
        }

        .hover-underline:hover {
            text-decoration: underline !important;
        }

        .login-btn {
            transition: background-color 0.2s, transform 0.1s;
        }

        .login-btn:active:not(:disabled) {
            transform: scale(0.98);
        }

        .hover-text-dark:hover {
            color: #212529 !important;
        }

        .transition-colors {
            transition: color 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default Login;

