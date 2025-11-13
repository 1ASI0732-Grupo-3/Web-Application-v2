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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToStables}
                className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:from-indigo-700 hover:to-purple-700 transition duration-200"
              >
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Add New Stable
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 transform hover:scale-105 shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Create New Stable</h2>
            <p className="text-indigo-100 mt-2">Add a new stable facility to manage your livestock</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stable Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Stable Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-500"
                    placeholder="Enter stable name (e.g., North Barn, Main Stable)"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">Give your stable a descriptive name for easy identification</p>
                </div>

                {/* Capacity Limit */}
                <div className="md:col-span-2">
                  <label htmlFor="limit" className="block text-sm font-semibold text-gray-900 mb-2">
                    Capacity Limit *
                  </label>
                  <input
                    type="number"
                    id="limit"
                    name="limit"
                    value={formData.limit || ''}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-500"
                    placeholder="Enter maximum number of animals"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">Maximum number of animals this stable can accommodate</p>
                </div>
              </div>

              {/* Preview Card */}
              {(formData.name || formData.limit > 0) && (
                <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                  <div className="bg-white/80 rounded-xl p-4 border border-white/40">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {formData.name || 'Stable Name'}
                        </h4>
                        <p className="text-gray-600">
                          Capacity: {formData.limit > 0 ? `${formData.limit} animals` : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBackToStables}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || isLoading}
                  className={`px-8 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 ${
                    isFormValid() && !isLoading
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Stable'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Stables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Stable Management</h4>
              <p>Stables help you organize your livestock by grouping animals in specific facilities. Each stable has a capacity limit to help you manage space efficiently.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Capacity Planning</h4>
              <p>Set realistic capacity limits based on your physical facility size, feeding capacity, and management capabilities to ensure optimal animal welfare.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddStable;