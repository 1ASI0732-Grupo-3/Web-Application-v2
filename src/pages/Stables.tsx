import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stablesApi } from '../services/api';
import type { Stable } from '../services/api';

const Stables: React.FC = () => {
  const [stables, setStables] = useState<Stable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStables = async () => {
      try {
        setIsLoading(true);
        const data = await stablesApi.getAllStables();
        setStables(data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch stables');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStables();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/home');
  };

  const handleAddStable = () => {
    navigate('/stables/add');
  };

  const handleViewDetails = (stableId: number) => {
    navigate(`/stables/${stableId}`);
  };

  const handleEditStable = (stableId: number) => {
    navigate(`/stables/${stableId}/edit`);
  };

  const handleDeleteStable = async (stableId: number) => {
    try {
      await stablesApi.deleteStable(stableId);
      setStables(stables.filter(stable => stable.id !== stableId));
      setDeleteConfirm(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete stable');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToDashboard}
                className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200"
              >
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Stables Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
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
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Stables</h2>
            <p className="text-gray-600">Manage your stable facilities and capacity</p>
          </div>
          <button
            onClick={handleAddStable}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Stable</span>
          </button>
        </div>

        {/* Error Message */}
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your stables...</p>
            </div>
          </div>
        ) : stables.length === 0 ? (
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Stables Registered</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't registered any stables yet. Start by adding your first stable to begin organizing your livestock facilities.
            </p>
            <button
              onClick={handleAddStable}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg"
            >
              Create Your First Stable
            </button>
          </div>
        ) : (
          /* Stables Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stables.map((stable) => (
              <div key={stable.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition duration-300 transform hover:scale-105">
                {/* Stable Icon */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center relative">
                  <div className="text-center">
                    <svg className="h-20 w-20 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-blue-600 font-medium">Stable #{stable.id}</p>
                  </div>
                </div>
                
                {/* Stable Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{stable.name}</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity Limit:</span>
                      <span className="font-medium text-gray-900">{stable.limit} animals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stable ID:</span>
                      <span className="font-medium text-gray-900">#{stable.id}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                    <button 
                      onClick={() => handleViewDetails(stable.id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-105"
                    >
                      View Details
                    </button>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditStable(stable.id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-105"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(stable.id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-105"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {stables.length > 0 && (
          <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Stable Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{stables.length}</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Stables</h4>
                <p className="text-gray-600">Registered facilities</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{stables.reduce((sum, stable) => sum + stable.limit, 0)}</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Capacity</h4>
                <p className="text-gray-600">Maximum animals</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{Math.round(stables.reduce((sum, stable) => sum + stable.limit, 0) / stables.length)}</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Average Capacity</h4>
                <p className="text-gray-600">Per stable</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this stable? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStable(deleteConfirm)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stables;