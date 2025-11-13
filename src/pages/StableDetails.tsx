import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stablesApi, bovinesApi } from '../services/api';
import type { Stable, Bovine } from '../services/api';

const StableDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stable, setStable] = useState<Stable | null>(null);
  const [bovines, setBovines] = useState<Bovine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBovines, setIsLoadingBovines] = useState(true);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStable = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const stableId = parseInt(id);
        if (isNaN(stableId)) {
          setError('Invalid stable ID');
          return;
        }

        const stableData = await stablesApi.getStableById(stableId);
        setStable(stableData);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch stable details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStable();
  }, [id]);

  useEffect(() => {
    const fetchBovinesInStable = async () => {
      if (!stable) return;
      
      try {
        setIsLoadingBovines(true);
        // Get all bovines and filter by stable ID
        const allBovines = await bovinesApi.getAllBovines();
        const stableBovines = allBovines.filter(bovine => bovine.stableId === stable.id);
        setBovines(stableBovines);
      } catch (error: any) {
        console.error('Failed to fetch bovines for stable:', error);
      } finally {
        setIsLoadingBovines(false);
      }
    };

    fetchBovinesInStable();
  }, [stable]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToStables = () => {
    navigate('/stables');
  };

  const handleEditStable = () => {
    if (stable) {
      navigate(`/stables/${stable.id}/edit`);
    }
  };

  const handleDeleteStable = async () => {
    if (!stable || deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm deletion');
      return;
    }

    if (bovines.length > 0) {
      setError('Cannot delete stable with animals. Please move or remove all animals first.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await stablesApi.deleteStable(stable.id);
      navigate('/stables');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete stable');
      setIsDeleting(false);
    }
  };

  const handleViewBovineDetails = (bovineId: number) => {
    navigate(`/bovines/${bovineId}`);
  };

  const handleAddBovine = () => {
    navigate('/bovines/add');
  };

  const getCapacityStatus = () => {
    if (!stable) return { percentage: 0, status: 'empty', color: 'gray' };
    
    const percentage = (bovines.length / stable.limit) * 100;
    
    if (percentage === 0) {
      return { percentage, status: 'Empty', color: 'gray' };
    } else if (percentage < 50) {
      return { percentage, status: 'Low occupancy', color: 'green' };
    } else if (percentage < 80) {
      return { percentage, status: 'Moderate occupancy', color: 'yellow' };
    } else if (percentage < 100) {
      return { percentage, status: 'High occupancy', color: 'orange' };
    } else {
      return { percentage, status: 'At capacity', color: 'red' };
    }
  };

  const capacityInfo = getCapacityStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stable details...</p>
        </div>
      </div>
    );
  }

  if (!stable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
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
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200"
          >
            Back to Stables
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToStables}
                className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200"
              >
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Stable Details
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

        {/* Stable Information Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{stable.name}</h2>
                <p className="text-blue-100">Stable ID: #{stable.id}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditStable}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition duration-200 backdrop-blur-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500/80 hover:bg-red-600/90 text-white px-4 py-2 rounded-lg font-medium transition duration-200 backdrop-blur-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Capacity Information */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{stable.limit}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Maximum Capacity</h3>
                <p className="text-gray-600">Total animals allowed</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{bovines.length}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Occupancy</h3>
                <p className="text-gray-600">Animals currently housed</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{stable.limit - bovines.length}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Space</h3>
                <p className="text-gray-600">Remaining capacity</p>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Occupancy Rate</span>
                <span className={`text-sm font-medium ${
                  capacityInfo.color === 'green' ? 'text-green-600' :
                  capacityInfo.color === 'yellow' ? 'text-yellow-600' :
                  capacityInfo.color === 'orange' ? 'text-orange-600' :
                  capacityInfo.color === 'red' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {Math.round(capacityInfo.percentage)}% - {capacityInfo.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    capacityInfo.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    capacityInfo.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                    capacityInfo.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                    capacityInfo.color === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min(capacityInfo.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Animals in Stable */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Animals in this Stable</h3>
                <p className="text-green-100 mt-1">{bovines.length} of {stable.limit} animals</p>
              </div>
              <button
                onClick={handleAddBovine}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition duration-200 backdrop-blur-sm flex items-center space-x-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Animal</span>
              </button>
            </div>
          </div>

          <div className="p-8">
            {isLoadingBovines ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading animals...</p>
                </div>
              </div>
            ) : bovines.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">No Animals in this Stable</h4>
                <p className="text-gray-600 mb-6">This stable is currently empty. You can add animals to start utilizing this facility.</p>
                <button
                  onClick={handleAddBovine}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg"
                >
                  Add First Animal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bovines.map((bovine) => (
                  <div key={bovine.id} className="bg-white/60 rounded-xl p-4 border border-white/40 hover:shadow-lg transition duration-300 transform hover:scale-105">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">#{bovine.id}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{bovine.name}</h5>
                        <p className="text-sm text-gray-600">{bovine.breed} • {bovine.gender}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewBovineDetails(bovine.id)}
                      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-105"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Stable</h3>
            {bovines.length > 0 ? (
              <div>
                <p className="text-red-600 mb-4">
                  This stable contains {bovines.length} animal(s). You must move or remove all animals before deleting the stable.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition duration-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete "{stable.name}"? This action cannot be undone.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Type DELETE to confirm"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                      setError('');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteStable}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition duration-200 ${
                      deleteConfirmText === 'DELETE' && !isDeleting
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      'Delete Stable'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StableDetails;