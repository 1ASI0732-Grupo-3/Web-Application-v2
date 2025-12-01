import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bovinesApi } from '../services/api';
import type { Bovine } from '../services/api';

const BovineDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bovine, setBovine] = useState<Bovine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBovine = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const bovineId = parseInt(id);
        if (isNaN(bovineId)) {
          setError('Invalid bovine ID');
          return;
        }

        const bovineData = await bovinesApi.getBovineById(bovineId);
        setBovine(bovineData);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch bovine details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBovine();
  }, [id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToBovines = () => {
    navigate('/bovines');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleEditBovine = () => {
    if (bovine) {
      navigate(`/bovines/${bovine.id}/edit`);
    }
  };

  const handleDeleteBovine = async () => {
    if (!bovine || deleteConfirmText !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await bovinesApi.deleteBovine(bovine.id);
      navigate('/bovines');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete bovine');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !bovine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-8">{error || 'Bovine not found'}</p>
          <button
            onClick={handleBackToBovines}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-200"
          >
            Back to Herd
          </button>
        </div>
      </div>
    );
  }

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
              <button 
                onClick={handleBackToBovines}
                className="group p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                title="Back to list"
              >
                <svg className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                 <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg hidden sm:block">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                 </span>
                 <h1 className="text-xl font-bold text-gray-800 truncate max-w-[200px] sm:max-w-none">
                    {bovine.name}
                 </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <div className="h-6 w-6 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="ml-2 text-sm text-gray-600 font-medium">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Logout"
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
      <main className="flex-grow max-w-6xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2">
                    Active
                </span>
                <p className="text-gray-500 text-sm">Registered on {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                 <button 
                    onClick={handleEditBovine}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-emerald-600 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Image & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="aspect-square relative group">
                {bovine.bovineImg && !imageError ? (
                    <img 
                    src={bovine.bovineImg} 
                    alt={bovine.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={handleImageError}
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6 text-gray-400">
                        <svg className="h-20 w-20 mb-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">No photo available</span>
                    </div>
                )}
                </div>
                <div className="p-6">
                     <h2 className="text-2xl font-bold text-gray-900 mb-1">{bovine.name}</h2>
                     <p className="text-emerald-600 font-medium">{bovine.breed}</p>
                </div>
            </div>

            {/* Danger Zone Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
                <div className="p-6">
                   <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Danger Zone
                   </h3>
                   
                   {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3 px-4 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                        >
                            Delete Bovine
                        </button>
                   ) : (
                       <div className="space-y-3 animate-fade-in-up">
                           <p className="text-xs text-gray-500">
                               To confirm deletion, type <span className="font-bold text-gray-900">DELETE</span> below.
                           </p>
                           <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                placeholder="DELETE"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeleteBovine}
                                    disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isDeleting ? 'Deleting...' : 'Confirm'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteConfirmText('');
                                    }}
                                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                       </div>
                   )}
                </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Main Info Card */}
             <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                    {/* Item */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Gender
                        </div>
                        <div className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {bovine.gender}
                        </div>
                    </div>

                    {/* Item */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                            </svg>
                            Age
                        </div>
                        <div className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {calculateAge(bovine.birthDate)} years
                        </div>
                    </div>

                     {/* Item */}
                     <div className="group">
                        <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Birth Date
                        </div>
                        <div className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {formatDate(bovine.birthDate)}
                        </div>
                    </div>

                    {/* Item */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-1 text-gray-500 text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Location
                        </div>
                        <div className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {bovine.location}
                        </div>
                    </div>
                </div>
             </div>

             {/* Secondary Info Card */}
             <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-gray-200/50 p-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                         <div>
                             <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Internal ID</p>
                             <p className="text-lg font-mono font-medium text-gray-700">#{bovine.id}</p>
                         </div>
                         <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                         </div>
                     </div>
                     <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                         <div>
                             <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Stable ID</p>
                             <p className="text-lg font-mono font-medium text-gray-700">#{bovine.stableId}</p>
                         </div>
                         <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                         </div>
                     </div>
                 </div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default BovineDetails;