import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const email = localStorage.getItem('userEmail');
  if (!token || !email) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
