import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const AuthRoute = ({ requiredPermission }) => {
  const { user, loading, hasPermission } = useContext(AuthContext);

  if (loading) return <div className="p-4 text-center">Loading authentication...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <div className="p-4 bg-danger text-white text-center fw-bold min-vh-100 mt-5 pt-5">
      <h3>Access Denied</h3>
      <p>You do not have the required permission ({requiredPermission}) to view this page.</p>
    </div>;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default AuthRoute;
