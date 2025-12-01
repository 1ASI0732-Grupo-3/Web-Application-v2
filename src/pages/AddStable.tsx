import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stablesApi } from '../services/api';
import type { CreateStableRequest } from '../services/api';

const AddStable: React.FC = () => {
  const [formData, setFormData] = useState<CreateStableRequest>({
    name: '',
    limit: 0,
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limit' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await stablesApi.createStable(formData);
      navigate('/stables');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create stable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToStables = () => {
    navigate('/stables');
  };

  const isFormValid = () => {
    return formData.name.trim() && formData.limit > 0;
  };

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
                onClick={handleBackToStables}
                className="group p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                title="Go back"
              >
                <svg className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                 </span>
                 Add New Stable
              </h1>
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
      <main className="flex-grow max-w-4xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
          
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create New Stable</h2>
              <p className="mt-2 text-gray-500">Add a new stable facility to manage your livestock efficiently.</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start mb-6">
                <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Stable Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Stable Name *
                  </label>
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200"
                        placeholder="e.g. North Barn, Main Stable"
                        required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">Give your stable a unique, descriptive name.</p>
                </div>

                {/* Capacity Limit */}
                <div className="md:col-span-1">
                  <label htmlFor="limit" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Capacity Limit *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <input
                        type="number"
                        id="limit"
                        name="limit"
                        value={formData.limit || ''}
                        onChange={handleChange}
                        min="1"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200"
                        placeholder="e.g. 50"
                        required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">Max number of animals.</p>
                </div>

                {/* Preview Card */}
                <div className="md:col-span-1">
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5 opacity-0 md:opacity-100">
                        Preview
                    </label>
                    <div className="h-[52px] md:h-auto flex items-center"> {/* Align with input height */}
                        <div className={`w-full p-4 rounded-xl border border-dashed transition-all duration-300 ${formData.name ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-gray-50'}`}>
                             <div className="flex items-center space-x-3">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${formData.name ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold truncate max-w-[150px] ${formData.name ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {formData.name || 'Stable Name'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Capacity: {formData.limit > 0 ? <span className="font-medium text-emerald-600">{formData.limit}</span> : '-'}
                                    </p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-4 sm:justify-end">
                <button
                  type="button"
                  onClick={handleBackToStables}
                  className="px-6 py-3 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className="px-8 py-3 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 flex items-center justify-center min-w-[160px]"
                >
                  {isLoading ? (
                    <>
                       <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                    </>
                  ) : (
                    'Create Stable'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-emerald-50/50">
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Stable Management</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">Organize your livestock by grouping animals in specific facilities. Use names that are easy to identify on the map.</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-emerald-50/50">
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Capacity Planning</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">Set realistic capacity limits based on your facility size to ensure optimal animal welfare and prevent overcrowding.</p>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AddStable;