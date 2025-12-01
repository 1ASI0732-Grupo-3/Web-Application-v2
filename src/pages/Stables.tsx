import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stablesApi } from '../services/api';
import type { Stable } from '../services/api';

// Iconos personalizados
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  ChevronRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Chart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
};

const Stables: React.FC = () => {
  const [stables, setStables] = useState<Stable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Filter logic
  const filteredStables = stables.filter(stable => 
    stable.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteStable = async (stableId: number) => {
    try {
      await stablesApi.deleteStable(stableId);
      setStables(stables.filter(stable => stable.id !== stableId));
      setDeleteConfirm(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete stable');
    }
  };

  // Stats Calculation
  const totalCapacity = stables.reduce((acc, curr) => acc + curr.limit, 0);

  return (
    <div className="min-h-screen bg-[#F5F3FF] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100/50 via-purple-50/30 to-white">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/home')}
                className="group p-2 rounded-lg hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Stables <span className="text-indigo-600">Management</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-indigo-200 shadow-lg flex items-center justify-center text-white font-bold text-sm">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header & Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Infrastructure</h2>
            <p className="text-gray-500 text-lg">Manage your farm's facilities and capacity limits.</p>
            
            <div className="mt-6 flex gap-4">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-indigo-50 shadow-sm">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Icons.Home /></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Active Stables</p>
                  <p className="text-xl font-bold text-gray-800">{stables.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-indigo-50 shadow-sm">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Icons.Chart /></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Capacity</p>
                  <p className="text-xl font-bold text-gray-800">{totalCapacity} <span className="text-xs font-normal text-gray-400">Heads</span></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-end items-start md:items-end gap-4">
            <button
              onClick={() => navigate('/stables/add')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02]"
            >
              <Icons.Plus /> Add New Stable
            </button>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-64 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Search stables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 animate-fade-in-down">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Content Grid */}
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) => (
               <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100"></div>
             ))}
           </div>
        ) : filteredStables.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="mx-auto h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Stables Found</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              {searchTerm ? 'No results match your search.' : 'Get started by creating your first stable facility.'}
            </p>
            <button
              onClick={() => navigate('/stables/add')}
              className="px-6 py-2.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold rounded-xl transition-colors"
            >
              Create Stable
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStables.map((stable) => (
              <div 
                key={stable.id} 
                className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.08)] hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Card Top */}
                <div 
                  onClick={() => navigate(`/stables/${stable.id}`)}
                  className="p-6 cursor-pointer flex-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <Icons.Home />
                    </div>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg border border-gray-200">
                      #{stable.id}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {stable.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      {/* Simple visual indicator for capacity - assumes filled for design, needs real data for accuracy */}
                      <div className="h-full bg-indigo-500 w-1/3 rounded-full opacity-30"></div> 
                    </div>
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                      Max: {stable.limit}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                  <button 
                    onClick={() => navigate(`/stables/${stable.id}`)}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    Details <Icons.ChevronRight />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/stables/${stable.id}/edit`); }}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Icons.Edit />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(stable.id); }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Stable?</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to remove this stable? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStable(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-red-500/20 transition-colors"
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