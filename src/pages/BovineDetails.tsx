import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bovinesApi } from '../services/api';
import type { Bovine } from '../services/api';

const Bovines: React.FC = () => {
  const [bovines, setBovines] = useState<Bovine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBovines = async () => {
      try {
        setIsLoading(true);
        const data = await bovinesApi.getAllBovines();
        setBovines(data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch bovines');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBovines();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToDashboard = () => {
    navigate('/home');
  };

  const handleAddBovine = () => {
    navigate('/bovines/add');
  };

  const handleViewDetails = (bovineId: number) => {
    navigate(`/bovines/${bovineId}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder-icon');
    if (placeholder) {
        placeholder.classList.remove('hidden');
    }
  };
  
  // Filter bovines based on search
  const filteredBovines = bovines.filter(bovine => 
    bovine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bovine.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bovine.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                onClick={handleBackToDashboard}
                className="group p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                title="Back to Dashboard"
              >
                <svg className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
               <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                 </span>
                 Herd Management
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
      <main className="flex-grow max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Bovines</h2>
            <p className="mt-2 text-gray-500">Manage, track and update your livestock records.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="relative group flex-grow sm:flex-grow-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full sm:w-64 pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out sm:text-sm"
                  placeholder="Search by name, breed..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            <button
                onClick={handleAddBovine}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Bovine
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start mb-6">
            <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
             <p className="text-gray-500 font-medium">Loading your herd...</p>
          </div>
        ) : filteredBovines.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-12 w-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'No bovines match your search' : 'No Bovines Registered'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                {searchTerm 
                    ? `We couldn't find any bovine matching "${searchTerm}". Try a different term.` 
                    : "You haven't registered any bovines yet. Start by adding your first animal to the system."}
            </p>
            {!searchTerm && (
                <button
                onClick={handleAddBovine}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                Register First Bovine
                </button>
            )}
            {searchTerm && (
                 <button
                 onClick={() => setSearchTerm('')}
                 className="text-emerald-600 font-medium hover:text-emerald-700"
                 >
                 Clear Search
                 </button>
            )}
          </div>
        ) : (
          /* Bovines Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBovines.map((bovine) => (
              <div 
                key={bovine.id} 
                onClick={() => handleViewDetails(bovine.id)}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Bovine Image Header */}
                <div className="h-48 relative overflow-hidden bg-gray-100">
                    {bovine.bovineImg ? (
                        <img 
                            src={bovine.bovineImg} 
                            alt={bovine.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={handleImageError}
                        />
                    ) : null}
                    
                    {/* Placeholder (shown if no image or error) */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-emerald-50/50 placeholder-icon ${bovine.bovineImg ? 'hidden' : ''}`}>
                         <svg className="h-16 w-16 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>

                    {/* Status Badge (Example) */}
                    <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-emerald-800 shadow-sm backdrop-blur-sm">
                            Active
                        </span>
                    </div>
                </div>
                
                {/* Content */}
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{bovine.name}</h3>
                     <span className="text-xs font-mono text-gray-400">#{bovine.id}</span>
                  </div>
                  
                  <div className="space-y-2.5 mb-4 flex-grow">
                     <div className="flex items-center text-sm text-gray-600">
                        <svg className="flex-shrink-0 mr-2 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="truncate">{bovine.breed}</span>
                     </div>
                     <div className="flex items-center text-sm text-gray-600">
                        <svg className="flex-shrink-0 mr-2 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{bovine.location}</span>
                     </div>
                      <div className="flex items-center text-sm text-gray-600">
                         <svg className="flex-shrink-0 mr-2 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                         </svg>
                        <span>Stable #{bovine.stableId}</span>
                     </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-emerald-600 text-sm font-semibold group-hover:underline flex items-center">
                        View Details
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics Section (Only shown if there are bovines) */}
        {bovines.length > 0 && !isLoading && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Animals</p>
                        <p className="text-2xl font-bold text-gray-900">{bovines.length}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex items-center space-x-4">
                     <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Unique Breeds</p>
                        <p className="text-2xl font-bold text-gray-900">{new Set(bovines.map(b => b.breed)).size}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-50 flex items-center space-x-4">
                     <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Locations</p>
                        <p className="text-2xl font-bold text-gray-900">{new Set(bovines.map(b => b.location)).size}</p>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default Bovines;