import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authApi, type UserInfo } from '../services/api';

const Home: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const info = await authApi.getUserInfo();
                setUserInfo(info);
            } catch (error) {
                console.error('Error fetching user info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavigateToBovines = () => navigate('/bovines');
    const handleNavigateToStables = () => navigate('/stables');
    const handleNavigateToSettings = () => navigate('/settings');
    const handleNavigateToProductionAnalytics = () => navigate('/production-analytics');
    const handleNavigateToVaccines = () => navigate('/vaccines');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Background decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-100 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-teal-100 rounded-full blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Navigation */}
            <nav className="bg-white sticky top-0 z-40 shadow-sm border-b border-gray-100/50 backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                VacApp
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                                <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white text-sm font-bold">
                                        {user?.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="ml-3 text-sm text-gray-700 font-medium">Hola, {user?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="group bg-white text-gray-500 hover:text-red-500 p-2 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all duration-200"
                                title="Cerrar Sesión"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Welcome Section */}
                <div className="text-center mb-12 animate-fade-in-down">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Panel de Control
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Gestiona tu ganado, supervisa la producción y mantén al día la salud de tu rebaño desde una sola plataforma.
                    </p>
                </div>

                {/* Account Overview (Stats) */}
                <div className="mb-12">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Stat Card 1 */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex items-center space-x-4">
                                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Bovinos</p>
                                    <p className="text-3xl font-bold text-gray-900">{userInfo?.totalBovines || 0}</p>
                                    <p className="text-xs text-emerald-600 font-medium">Animales registrados</p>
                                </div>
                            </div>

                            {/* Stat Card 2 */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex items-center space-x-4">
                                <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center text-3xl">
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Establos</p>
                                    <p className="text-3xl font-bold text-gray-900">{userInfo?.totalStables || 0}</p>
                                    <p className="text-xs text-teal-600 font-medium">Instalaciones activas</p>
                                </div>
                            </div>

                            {/* Stat Card 3 */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex items-center space-x-4">
                                <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Vacunas</p>
                                    <p className="text-3xl font-bold text-gray-900">{userInfo?.totalVaccinations || 0}</p>
                                    <p className="text-xs text-blue-600 font-medium">Dosis aplicadas</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dashboard Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    {/* Bovines Module */}
                    <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Gestión Ganadera</h3>
                        </div>
                        <p className="text-gray-500 mb-8 flex-grow leading-relaxed">
                            Registra y controla tu inventario de bovinos. Visualiza fichas individuales, historial y ubicación.
                        </p>
                        <button
                            onClick={handleNavigateToBovines}
                            className="w-full py-3 px-4 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
                        >
                            Ver Ganado
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>

                    {/* Stables Module */}
                    <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-14 w-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Establos</h3>
                        </div>
                        <p className="text-gray-500 mb-8 flex-grow leading-relaxed">
                            Organiza tus instalaciones. Crea y gestiona establos para una distribución eficiente de los animales.
                        </p>
                        <button
                            onClick={handleNavigateToStables}
                            className="w-full py-3 px-4 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-teal-600 hover:text-white transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
                        >
                            Administrar Establos
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>

                    {/* Analytics Module */}
                    <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Analíticas</h3>
                        </div>
                        <p className="text-gray-500 mb-8 flex-grow leading-relaxed">
                            Visualiza estimaciones de producción de carne y leche. Toma decisiones basadas en datos reales.
                        </p>
                        <button
                            onClick={handleNavigateToProductionAnalytics}
                            className="w-full py-3 px-4 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
                        >
                            Ver Reportes
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>

                    {/* Vaccines Module */}
                    <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Vacunación</h3>
                        </div>
                        <p className="text-gray-500 mb-8 flex-grow leading-relaxed">
                            Lleva un control estricto del calendario de vacunación y el historial médico de cada animal.
                        </p>
                        <button
                            onClick={handleNavigateToVaccines}
                            className="w-full py-3 px-4 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
                        >
                            Control Sanitario
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>

                    {/* Settings Module */}
                    <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:col-span-2 lg:col-span-1 lg:col-start-2">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 group-hover:bg-gray-700 group-hover:text-white transition-colors duration-300">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Configuración</h3>
                        </div>
                        <p className="text-gray-500 mb-8 flex-grow leading-relaxed">
                            Personaliza tu cuenta, ajusta preferencias de privacidad y notificaciones del sistema.
                        </p>
                        <button
                            onClick={handleNavigateToSettings}
                            className="w-full py-3 px-4 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
                        >
                            Ajustes
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Home;