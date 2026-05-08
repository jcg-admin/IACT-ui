import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '@redux/slices/auth';
import { selectAuthLoading, selectAuthError } from '@redux/selectors';
import LoginForm from '@components/presentational/LoginForm';
import { AnimatedLoadingSpinner } from '@components/animations';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const handleLogin = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      // Error ya está en Redux state, no necesita hacer nada
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">IACT Dashboard</h1>
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Demo credentials:</p>
          <p className="text-slate-300 text-sm">admin@iact.com / password123</p>
          <p className="text-slate-300 text-sm">user@iact.com / password123</p>
        </div>
      </div>
      {loading && <AnimatedLoadingSpinner fullScreen message="Logging in..." />}
    </div>
  );
}

export default Login;
