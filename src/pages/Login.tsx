import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import type { SignInRequest } from '../services/api';
import newvacApp from '../assets/newvacApp.png';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<SignInRequest>({ userName: '', password: '' });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await authApi.signIn(formData);
      login(response);
      navigate('/home');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={newvacApp} alt="VacApp" className="mx-auto h-16 w-16 rounded-xl object-cover shadow-sm border border-emerald-100" />
          <h2 className="mt-4 text-2xl font-bold text-emerald-900">Inicia sesión</h2>
          <p className="mt-1 text-sm text-emerald-700/70">Accede a tu cuenta para continuar</p>
        </div>

        <div className="bg-white border border-emerald-100 shadow-sm rounded-2xl p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-emerald-900 mb-2">Usuario</label>
              <input
                id="userName"
                name="userName"
                type="text"
                required
                value={formData.userName}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-emerald-200 rounded-xl placeholder-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                placeholder="Ingresa tu usuario"
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
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Iniciando...' : 'Entrar'}
            </button>

            <p className="text-center text-sm text-emerald-900/80">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">Crear cuenta</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;