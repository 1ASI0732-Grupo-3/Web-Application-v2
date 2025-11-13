import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import type { SignUpRequest } from '../services/api';
import newvacApp from '../assets/newvacApp.png';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<SignUpRequest>({
    username: '',
    password: '',
    email: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.signUp(formData);
      login(response);
      navigate('/home');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={newvacApp} alt="VacApp" className="mx-auto h-16 w-16 rounded-xl object-cover shadow-sm border border-emerald-100" />
          <h2 className="mt-4 text-2xl font-bold text-emerald-900">Crear cuenta</h2>
          <p className="mt-1 text-sm text-emerald-700/70">Regístrate para comenzar</p>
        </div>

        <div className="bg-white border border-emerald-100 shadow-sm rounded-2xl p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-emerald-900 mb-2">Usuario</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-emerald-200 rounded-xl placeholder-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                placeholder="Elige un usuario"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-emerald-900 mb-2">Correo</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-emerald-200 rounded-xl placeholder-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-emerald-900 mb-2">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-emerald-200 rounded-xl placeholder-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                placeholder="Crea una contraseña"
              />
              <p className="mt-1 text-xs text-emerald-900/60">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-900 mb-2">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-emerald-200 rounded-xl placeholder-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                placeholder="Repite tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-sm text-emerald-900/80">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;