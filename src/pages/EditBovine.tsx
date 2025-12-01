import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bovinesApi, stablesApi } from '../services/api'; // Asegúrate de importar stablesApi
import type { Bovine, UpdateBovineRequest, Stable } from '../services/api';

// Reutilizamos los mismos iconos para mantener consistencia
const Icons = {
  Cow: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Dna: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  MapPin: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Edit: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

const EditBovine: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [bovine, setBovine] = useState<Bovine | null>(null);
  const [stables, setStables] = useState<Stable[]>([]);
  
  const [formData, setFormData] = useState<UpdateBovineRequest>({
    name: '',
    gender: '',
    birthDate: '',
    breed: '',
    location: '',
    stableId: 0
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsFetching(true);
        const bovineId = parseInt(id);
        
        // Cargar datos en paralelo para mayor velocidad
        const [bovineData, stablesData] = await Promise.all([
          bovinesApi.getBovineById(bovineId),
          stablesApi.getAllStables()
        ]);

        setBovine(bovineData);
        setStables(stablesData);
        
        setFormData({
          name: bovineData.name,
          gender: bovineData.gender,
          birthDate: bovineData.birthDate.split('T')[0],
          breed: bovineData.breed,
          location: bovineData.location,
          stableId: bovineData.stableId
        });
      } catch (error: any) {
        console.error("Error loading data", error);
        setError(error.response?.data?.message || 'Failed to fetch details');
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bovine) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedBovine = await bovinesApi.updateBovine(bovine.id, formData);
      setBovine(updatedBovine);
      setSuccess('Changes saved successfully!');
      
      setTimeout(() => {
        navigate(`/bovines/${bovine.id}`);
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update bovine');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stableId' ? parseInt(value) || 0 : value
    }));
  };

  const handleBackToBovineDetails = () => {
    navigate(bovine ? `/bovines/${bovine.id}` : '/bovines');
  };

  // Componente Input Reutilizable
  const FormInput = ({ label, id, icon: Icon, type = "text", ...props }: any) => (
    <div className="group">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 ml-1 transition-colors group-focus-within:text-emerald-600">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
          <Icon />
        </div>
        <input
          id={id}
          type={type}
          className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:border-gray-300"
          {...props}
        />
      </div>
    </div>
  );

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0FDF4] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-teal-50/30 to-white">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToBovineDetails}
                className="group p-2 rounded-lg hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors"
              >
                <Icons.ChevronLeft />
              </button>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Edit <span className="text-emerald-600">{bovine?.name || 'Bovine'}</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-emerald-200 shadow-lg flex items-center justify-center text-white font-bold text-sm">
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
          {/* Left Column: Context */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
                Update<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Information
                </span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Make changes to the animal's file. Ensure location and stable data is accurate for inventory tracking.
              </p>

              {/* Read Only ID Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Icons.Cow />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">System ID</p>
                    <p className="text-lg font-mono font-semibold text-gray-800">#{bovine?.id}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <FormInput 
                      id="name" name="name" label="Name *" 
                      value={formData.name} onChange={handleInputChange} required icon={Icons.Cow}
                    />

                    <div className="group">
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Gender *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500">
                          <Icons.Users />
                        </div>
                        <select
                          id="gender" name="gender" required
                          value={formData.gender} onChange={handleInputChange}
                          className="block w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm appearance-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <FormInput 
                      id="birthDate" name="birthDate" label="Birth Date *" type="date"
                      value={formData.birthDate} onChange={handleInputChange} required icon={Icons.Calendar}
                    />

                    <FormInput 
                      id="breed" name="breed" label="Breed *" 
                      value={formData.breed} onChange={handleInputChange} required icon={Icons.Dna}
                    />

                    <FormInput 
                      id="location" name="location" label="Location *" 
                      value={formData.location} onChange={handleInputChange} required icon={Icons.MapPin}
                    />

                    {/* Stable Selection Dropdown instead of simple Input */}
                    <div className="group">
                      <label htmlFor="stableId" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Assigned Stable *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500">
                          <Icons.Home />
                        </div>
                        <select
                          id="stableId" name="stableId" required
                          value={formData.stableId} onChange={handleInputChange}
                          className="block w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm appearance-none"
                        >
                          <option value={0} disabled>Select a stable</option>
                          {stables.map((stable) => (
                            <option key={stable.id} value={stable.id}>
                              {stable.name} {stable.location ? `(${stable.location})` : ''}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleBackToBovineDetails}
                      className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
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

export default EditBovine;