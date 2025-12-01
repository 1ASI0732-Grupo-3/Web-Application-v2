import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import type { UpdateProfileRequest } from '../services/api';

// Iconos para la interfaz de Configuración
const Icons = {
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  ShieldCheck: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ShieldExclamation: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  Logout: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

const Settings: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    username: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.updateProfile(profileData);
      updateUser({
        username: profileData.username,
        email: profileData.email,
        emailConfirmed: user?.emailConfirmed || false
      });
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsLoading(true);
    try {
      await authApi.deleteAccount();
      logout();
      navigate('/login');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete account');
      setIsLoading(false);
    }
  };

  // Componente Input Reutilizable (Tema Azul/Slate)
  const FormInput = ({ label, id, icon: Icon, ...props }: any) => (
    <div className="group">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5 ml-1 transition-colors group-focus-within:text-blue-600">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon />
        </div>
        <input
          id={id}
          className="block w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-slate-300"
          {...props}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50/20 to-white">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/home')}
                className="group p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Icons.ChevronLeft />
              </button>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Account <span className="text-blue-600">Settings</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-blue-200 shadow-lg flex items-center justify-center text-white font-bold text-sm">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-slate-500 hover:text-red-500 font-medium transition-colors flex items-center gap-1">
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden sticky top-24">
              {/* Card Header Background */}
              <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden">
                 <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                 <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
              </div>
              
              {/* Avatar & Info */}
              <div className="px-6 pb-6 text-center relative">
                <div className="w-24 h-24 mx-auto -mt-12 bg-white rounded-2xl p-1.5 shadow-lg relative z-10">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-50 rounded-xl flex items-center justify-center text-4xl font-bold text-blue-600">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <h2 className="mt-4 text-xl font-bold text-slate-800">{user?.username}</h2>
                <p className="text-sm text-slate-500">{user?.email}</p>

                <div className="mt-6 flex justify-center">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    user?.emailConfirmed 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {user?.emailConfirmed ? <Icons.ShieldCheck /> : <Icons.ShieldExclamation />}
                    {user?.emailConfirmed ? 'Verified Account' : 'Unverified Account'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Form & Danger Zone */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Edit Profile Section */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Icons.User />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                  <p className="text-sm text-slate-500">Update your public profile details</p>
                </div>
              </div>

              {success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 animate-fade-in-down">
                  <div className="p-1 bg-emerald-100 rounded-full text-emerald-600 shrink-0"><Icons.Check /></div>
                  <p className="text-sm text-emerald-700 font-medium">{success}</p>
                </div>
              )}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 animate-fade-in-down">
                  <div className="p-1 bg-red-100 rounded-full text-red-600 shrink-0"><Icons.X /></div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <FormInput 
                  id="username" label="Username" 
                  value={profileData.username} onChange={(e: any) => setProfileData({ ...profileData, username: e.target.value })}
                  icon={Icons.User} required
                />
                
                <FormInput 
                  id="email" label="Email Address" type="email"
                  value={profileData.email} onChange={(e: any) => setProfileData({ ...profileData, email: e.target.value })}
                  icon={Icons.Mail} required
                />

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 rounded-3xl border border-red-100 p-8 overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-red-900 flex items-center gap-2 mb-2">
                  <Icons.ShieldExclamation /> Danger Zone
                </h3>
                <p className="text-sm text-red-700/80 mb-6 max-w-lg">
                  Once you delete your account, there is no going back. Please be certain.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-5 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm animate-fade-in-up">
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Type <span className="font-bold text-red-600 font-mono">DELETE</span> to confirm:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm"
                        placeholder="Type DELETE"
                      />
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isLoading || deleteConfirmText !== 'DELETE'}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-red-500/20"
                      >
                        {isLoading ? 'Deleting...' : 'Confirm Deletion'}
                      </button>
                      <button
                         onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                          setError('');
                        }}
                        className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;