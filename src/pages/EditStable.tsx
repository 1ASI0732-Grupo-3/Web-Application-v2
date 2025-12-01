import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stablesApi } from '../services/api';
import type { Stable, UpdateStableRequest } from '../services/api';

// Iconos personalizados para el contexto de Establos
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Hash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Info: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const EditStable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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
        setIsFetching(true);
        const stableId = parseInt(id);
        if (isNaN(stableId)) {
          setError('Invalid stable ID');
          return;
        }

        const stableData = await stablesApi.getStableById(stableId);
        setStable(stableData);
        
        setFormData({
          name: stableData.name,
          limit: stableData.limit
        });
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch stable details');
      } finally {
        setIsFetching(false);
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

  const handleBackToStableDetails = () => {
    navigate(stable ? `/stables/${stable.id}` : '/stables');
  };

  // Componente Input Reutilizable (Tema Indigo)
  const FormInput = ({ label, id, icon: Icon, type = "text", ...props }: any) => (
    <div className="group">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 ml-1 transition-colors group-focus-within:text-indigo-600">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon />
        </div>
        <input
          id={id}
          type={type}
          className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:border-gray-300"
          {...props}
        />
      </div>
    </div>
  );

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading stable configuration...</p>
        </div>
      </div>
    );
  }

  if (!stable && !isFetching) {
    return (
        <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 text-center max-w-md">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Icons.X />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Stable Not Found</h3>
          <p className="text-gray-600 mb-6">The requested stable could not be located.</p>
          <button onClick={() => navigate('/stables')} className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition">
            Return to Stables
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-purple-50/30 to-white">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToStableDetails}
                className="group p-2 rounded-lg hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Icons.ChevronLeft />
              </button>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Edit <span className="text-indigo-600">{stable?.name}</span>
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
      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Context & Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
                Stable<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
                  Configuration
                </span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Manage the capacity and details of your infrastructure. Ensure limits are accurate to prevent overpopulation.
              </p>

              {/* ID Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Icons.Home />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Stable ID</p>
                    <p className="text-lg font-mono font-semibold text-gray-800">#{stable?.id}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-indigo-50">
                    <div className="flex items-start gap-2">
                        <Icons.Info />
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Changing the capacity limit will not affect animals currently inside, but may restrict adding new ones.
                        </p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="p-8">

                {/* Messages */}
                {success && (
                  <div className="mb-6 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3 animate-fade-in-down">
                    <div className="p-1 bg-green-100 rounded-full text-green-600 shrink-0"><Icons.Check /></div>
                    <p className="text-sm text-green-700 font-medium">{success}</p>
                  </div>
                )}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 animate-fade-in-down">
                    <div className="p-1 bg-red-100 rounded-full text-red-600 shrink-0"><Icons.X /></div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Name Input */}
                  <FormInput 
                    id="name" 
                    name="name" 
                    label="Stable Name *" 
                    placeholder="e.g. Main Barn"
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                    icon={Icons.Home}
                  />

                  {/* Limit Input */}
                  <FormInput 
                    id="limit" 
                    name="limit" 
                    label="Maximum Capacity *" 
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={formData.limit} 
                    onChange={handleInputChange} 
                    required 
                    icon={Icons.Hash}
                  />

                  {/* Footer Actions */}
                  <div className="pt-8 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleBackToStableDetails}
                      className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </div>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditStable;