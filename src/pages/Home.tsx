import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {authApi, type UserInfo} from "../services/api.ts";

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

    const handleNavigateToBovines = () => {
        navigate('/bovines');
    };

    const handleNavigateToStables = () => {
        navigate('/stables');
    };

    const handleNavigateToSettings = () => {
        navigate('/settings');
    };

    const handleNavigateToApiTest = () => {
        navigate('/api-test');
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f2f0e9' }}>
            {/* Navigation */}
            <nav className="shadow-lg border-b sticky top-0 z-40" style={{ backgroundColor: '#f7f7f5', borderColor: '#e3e3d9' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#99bb99' }}>
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold" style={{ color: '#353330' }}>
                                MuuuSmart
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#99bb99' }}>
                  <span className="text-white text-sm font-semibold">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                                </div>
                                <span className="font-medium" style={{ color: '#353330' }}>Welcome, {user?.username}!</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 transform hover:scale-105 shadow-md hover:opacity-90"
                                style={{ backgroundColor: '#a29f8a' }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Welcoming Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4" style={{ color: '#353330' }}>
                        Welcome to Your Dashboard
                    </h2>
                    <p className="text-xl max-w-2xl mx-auto" style={{ color: '#353330', opacity: 0.8 }}>
                        Manage your account, explore features, and stay connected with MuuuSmart's powerful platform.
                    </p>
                </div>

                {/* Account Overview */}
                <div className="rounded-2xl shadow-xl border p-8 mb-8" style={{ backgroundColor: '#f7f7f5', borderColor: '#e3e3d9' }}>
                    <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#353330' }}>Account Overview</h3>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#99bb99' }}></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-xl border text-center" style={{ backgroundColor: '#e3e3d9', borderColor: '#a29f8a' }}>
                                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#99bb99' }}>
                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold mb-2" style={{ color: '#353330' }}>Total Bovines</h4>
                                <p className="text-3xl font-bold" style={{ color: '#99bb99' }}>{userInfo?.totalBovines || 0}</p>
                                <p className="text-sm mt-1" style={{ color: '#353330', opacity: 0.7 }}>Registered animals</p>
                            </div>

                            <div className="p-6 rounded-xl border text-center" style={{ backgroundColor: '#e3e3d9', borderColor: '#a29f8a' }}>
                                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#99bb99' }}>
                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold mb-2" style={{ color: '#353330' }}>Total Stables</h4>
                                <p className="text-3xl font-bold" style={{ color: '#99bb99' }}>{userInfo?.totalStables || 0}</p>
                                <p className="text-sm mt-1" style={{ color: '#353330', opacity: 0.7 }}>Active facilities</p>
                            </div>

                            <div className="p-6 rounded-xl border text-center" style={{ backgroundColor: '#e3e3d9', borderColor: '#a29f8a' }}>
                                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#99bb99' }}>
                                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold mb-2" style={{ color: '#353330' }}>Total Vaccinations</h4>
                                <p className="text-3xl font-bold" style={{ color: '#99bb99' }}>{userInfo?.totalVaccinations || 0}</p>
                                <p className="text-sm mt-1" style={{ color: '#353330', opacity: 0.7 }}>Administered doses</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Bovines Management */}
                    <div className="rounded-2xl shadow-xl border p-6 hover:shadow-2xl transition duration-300 transform hover:scale-105" style={{ backgroundColor: '#f7f7f5', borderColor: '#e3e3d9' }}>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#99bb99' }}>
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: '#353330' }}>Bovines Management</h3>
                        </div>
                        <p className="mb-4" style={{ color: '#353330', opacity: 0.8 }}>
                            Register and manage your bovines. View your livestock, add new animals, and track their information.
                        </p>
                        <button
                            onClick={handleNavigateToBovines}
                            className="w-full text-white py-2 px-4 rounded-lg font-medium transition duration-200 hover:opacity-90"
                            style={{ backgroundColor: '#99bb99' }}
                        >
                            Manage Bovines
                        </button>
                        
                    </div>

                    {/* Stables Management */}
                    <div className="rounded-2xl shadow-xl border p-6 hover:shadow-2xl transition duration-300 transform hover:scale-105" style={{ backgroundColor: '#f7f7f5', borderColor: '#e3e3d9' }}>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#99bb99' }}>
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: '#353330' }}>Stables Management</h3>
                        </div>
                        <p className="mb-4" style={{ color: '#353330', opacity: 0.8 }}>
                            Manage your stable facilities. Create, edit, and organize your stables to house your livestock efficiently.
                        </p>
                        <button
                            onClick={handleNavigateToStables}
                            className="w-full text-white py-2 px-4 rounded-lg font-medium transition duration-200 hover:opacity-90"
                            style={{ backgroundColor: '#99bb99' }}
                        >
                            Manage Stables
                        </button>
                        
                    </div>

                    {/* Settings */}
                    <div className="rounded-2xl shadow-xl border p-6 hover:shadow-2xl transition duration-300 transform hover:scale-105" style={{ backgroundColor: '#f7f7f5', borderColor: '#e3e3d9' }}>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#a29f8a' }}>
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: '#353330' }}>Settings</h3>
                        </div>
                        <p className="mb-4" style={{ color: '#353330', opacity: 0.8 }}>
                            Configure your account settings, privacy preferences, and notification options.
                        </p>
                        <button
                            onClick={handleNavigateToSettings}
                            className="w-full text-white py-2 px-4 rounded-lg font-medium transition duration-200 hover:opacity-90"
                            style={{ backgroundColor: '#a29f8a' }}
                        >
                            Open Settings
                        </button>
                    </div>

                    {/* API Test */}
                    <div className="rounded-2xl shadow-xl border p-6 hover:shadow-2xl transition duration-300 transform hover:scale-105" style={{ backgroundColor: '#f7f7f5', borderColor: '#e3e3d9' }}>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6366f1' }}>
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: '#353330' }}>API Testing</h3>
                        </div>
                        <p className="mb-4" style={{ color: '#353330', opacity: 0.8 }}>
                            Test the new VacApp backend integration. Verify connectivity and data compatibility.
                        </p>
                        <button
                            onClick={handleNavigateToApiTest}
                            className="w-full text-white py-2 px-4 rounded-lg font-medium transition duration-200 hover:opacity-90"
                            style={{ backgroundColor: '#6366f1' }}
                        >
                            Run API Tests
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;