import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stablesApi } from '../services/api';
import type { Stable, UpdateStableRequest } from '../services/api';

const EditStable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStable, setIsLoadingStable] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [stable, setStable] = useState<Stable | null>(null);
  
  const [formData, setFormData] = useState<UpdateStableRequest>({
    name: '',
    limit: 0
  });

  useEffect(() => {
    const fetchStable = async () => {
      if (!id) return;
      
      try {
        setIsLoadingStable(true);
        const stableId = parseInt(id);
        if (isNaN(stableId)) {
          setError('Invalid stable ID');
          return;
        }

        const stableData = await stablesApi.getStableById(stableId);
        setStable(stableData);
        
        // Pre-fill form with current data
        setFormData({
          name: stableData.name,
          limit: stableData.limit
        });
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch stable details');
      } finally {
        setIsLoadingStable(false);
      }
    };

    fetchStable();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stable) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedStable = await stablesApi.updateStable(stable.id, formData);
      setStable(updatedStable);
      setSuccess('Stable updated successfully!');
      
      // Redirect to stable details after a short delay
      setTimeout(() => {
        navigate(`/stables/${stable.id}`);
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update stable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limit' ? parseInt(value) || 0 : value
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToStableDetails = () => {
    if (stable) {
      navigate(`/stables/${stable.id}`);
    }
  };

  const handleBackToStables = () => {
    navigate('/stables');
  };

  const isFormValid = () => {
    return formData.name.trim() && formData.limit > 0;
  };

  if (isLoadingStable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stable details...</p>
        </div>
      </div>
    );
  }

  if (!stable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Stable Not Found</h3>
          <p className="text-gray-600 mb-4">The stable you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={handleBackToStables}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200"
          >
            Back to Stables
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToStableDetails}
                className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:from-indigo-700 hover:to-purple-700 transition duration-200"
              >
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Edit Stable
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
            <h2 className="text-2xl font-bold text-white">Edit Stable</h2>
            <p className="text-indigo-100 mt-2">Update the details of {stable.name}</p>
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

            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
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
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-500"
                    placeholder="Enter stable name"
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
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-500"
                    placeholder="Enter maximum number of animals"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">Maximum number of animals this stable can accommodate</p>
                </div>
              </div>

              {/* Preview Card */}
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
                      <p className="text-sm text-gray-500">ID: #{stable.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBackToStableDetails}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || isLoading || success !== ''}
                  className={`px-8 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 ${
                    isFormValid() && !isLoading && success === ''
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : success ? (
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Updated!</span>
                    </div>
                  ) : (
                    'Update Stable'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Current Information */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Original Name</h4>
              <p className="text-gray-600">{stable.name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Original Capacity</h4>
              <p className="text-gray-600">{stable.limit} animals</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditStable;