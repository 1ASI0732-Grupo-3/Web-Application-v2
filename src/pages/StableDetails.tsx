import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stablesApi, bovinesApi } from '../services/api';
import type { Stable, Bovine } from '../services/api';

// Iconos contextuales
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Cow: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  ChartBar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Exclamation: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
};

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

  const handleEditStable = () => { if (stable) navigate(`/stables/${stable.id}/edit`); };

  const handleDeleteStable = async () => {
    if (!stable || deleteConfirmText !== 'DELETE') return;
    if (bovines.length > 0) {
      setError('Cannot delete stable with animals. Please move or remove all animals first.');
      return;
    }
    setIsDeleting(true);
    try {
      await stablesApi.deleteStable(stable.id);
      navigate('/stables');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete stable');
      setIsDeleting(false);
    }
  };

  const getCapacityStatus = () => {
    if (!stable) return { percentage: 0, status: 'Empty', colorClass: 'bg-gray-200', textClass: 'text-gray-500' };
    const percentage = Math.min((bovines.length / stable.limit) * 100, 100);
    
    if (percentage === 0) return { percentage, status: 'Empty', colorClass: 'bg-emerald-500', textClass: 'text-emerald-600' };
    if (percentage < 50) return { percentage, status: 'Healthy', colorClass: 'bg-emerald-500', textClass: 'text-emerald-600' };
    if (percentage < 85) return { percentage, status: 'Moderate', colorClass: 'bg-amber-500', textClass: 'text-amber-600' };
    return { percentage, status: 'Critical', colorClass: 'bg-red-500', textClass: 'text-red-600' };
  };

  const capacityInfo = getCapacityStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading stable details...</p>
        </div>
      </div>
    );
  }

  if (!stable) return null; // Or generic error component

  return (
    <div className="min-h-screen bg-[#F5F3FF] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-purple-50/30 to-white">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/stables')}
                className="group p-2 rounded-lg hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Icons.ChevronLeft />
              </button>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Stable <span className="text-indigo-600">Details</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-indigo-200 shadow-lg flex items-center justify-center text-white font-bold text-sm">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="text-red-600 mt-0.5">
              <Icons.Exclamation />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
              <Icons.X />
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{stable.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                #{stable.id}
              </span>
            </div>
            <p className="text-gray-500">Manage infrastructure and view livestock occupancy.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEditStable}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-indigo-600 transition-all font-medium text-sm shadow-sm"
            >
              <Icons.Edit /> Edit Stable
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-medium text-sm shadow-sm"
            >
              <Icons.Trash /> Delete
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Capacity Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-indigo-50 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Icons.Home />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Capacity</p>
              <h3 className="text-2xl font-bold text-gray-900">{stable.limit} <span className="text-sm font-normal text-gray-400">heads</span></h3>
            </div>
          </div>

          {/* Occupancy Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-indigo-50 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Icons.Users />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Occupancy</p>
              <h3 className="text-2xl font-bold text-gray-900">{bovines.length} <span className="text-sm font-normal text-gray-400">animals</span></h3>
            </div>
          </div>

          {/* Availability Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-indigo-50 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Icons.ChartBar />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Available Space</p>
              <h3 className="text-2xl font-bold text-gray-900">{stable.limit - bovines.length} <span className="text-sm font-normal text-gray-400">slots</span></h3>
            </div>
          </div>
        </div>

        {/* Capacity Bar Visualization */}
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-indigo-100 p-8 mb-8">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Occupancy Level</h3>
              <p className="text-sm text-gray-500">Real-time utilization of this stable</p>
            </div>
            <div className={`text-right ${capacityInfo.textClass}`}>
              <span className="text-2xl font-bold">{Math.round(capacityInfo.percentage)}%</span>
              <p className="text-xs font-semibold uppercase tracking-wide">{capacityInfo.status}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${capacityInfo.colorClass}`}
              style={{ width: `${capacityInfo.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Animals List */}
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-indigo-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Animals in Residence
            </h3>
            <button
              onClick={() => navigate('/bovines/add')}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20"
            >
              <Icons.Plus /> Add Animal
            </button>
          </div>

          <div className="p-8">
            {isLoadingBovines ? (
               <div className="text-center py-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                 <p className="text-gray-500">Loading livestock...</p>
               </div>
            ) : bovines.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-400">
                  <Icons.Cow />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">No animals assigned</h4>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">This stable is currently empty. Start adding animals to track their growth and status.</p>
                <button
                  onClick={() => navigate('/bovines/add')}
                  className="text-indigo-600 font-semibold hover:text-indigo-700"
                >
                  + Register new animal here
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bovines.map((bovine) => (
                  <div 
                    key={bovine.id} 
                    onClick={() => navigate(`/bovines/${bovine.id}`)}
                    className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className="h-16 w-16 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {bovine.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{bovine.name}</h4>
                      <p className="text-sm text-gray-500">{bovine.breed}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                        ID: #{bovine.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <Icons.Exclamation />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Stable?</h3>
            </div>

            {bovines.length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  This stable currently houses <strong className="text-gray-900">{bovines.length} animals</strong>. 
                  To prevent data loss, you must move or remove all animals before this stable can be deleted.
                </p>
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm text-red-700 font-medium">
                  Action Blocked: Stable is not empty.
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors"
                >
                  Understood
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-600">
                  Are you sure you want to delete <strong className="text-gray-900">{stable.name}</strong>? 
                  This action is permanent and cannot be undone.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="Type DELETE"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteStable}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 transition-all"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
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