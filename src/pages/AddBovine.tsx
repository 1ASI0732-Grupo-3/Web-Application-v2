import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bovinesApi, stablesApi } from '../services/api';
import type { CreateBovineRequest, Stable } from '../services/api';

// Iconos SVG como componentes para mantener el código limpio sin librerías externas
const Icons = {
  Cow: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Dna: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  MapPin: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Upload: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  X: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

const AddBovine: React.FC = () => {
  const [formData, setFormData] = useState<CreateBovineRequest>({
    name: '',
    gender: '',
    birthDate: '',
    breed: '',
    location: '',
    stableId: 0,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [stables, setStables] = useState<Stable[]>([]);
  const [loadingStables, setLoadingStables] = useState(true);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStables = async () => {
      try {
        setLoadingStables(true);
        const stablesData = await stablesApi.getAllStables();
        setStables(stablesData);
      } catch (error) {
        console.error('Error fetching stables:', error);
        setError('Failed to load stables. Please refresh the page.');
      } finally {
        setLoadingStables(false);
      }
    };
    fetchStables();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stableId' ? parseInt(value) || 0 : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const submitData = { ...formData, bovineImg: selectedImage || undefined };
      await bovinesApi.createBovine(submitData);
      navigate('/bovines');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create bovine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.name && formData.gender && formData.birthDate && 
           formData.breed && formData.location && formData.stableId > 0;
  };

  // Componente de Input Reutilizable para consistencia
  const FormInput = ({ 
    label, id, icon: Icon, type = "text", ...props 
  }: any) => (
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

  return (
    <div className="min-h-screen bg-[#F0FDF4] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-teal-50/30 to-white">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/bovines')}
                className="group p-2 rounded-lg hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors"
              >
                <Icons.ChevronLeft />
              </button>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                Add New <span className="text-emerald-600">Bovine</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-gray-700 leading-none">{user?.username}</span>
                <span className="text-xs text-emerald-600 font-medium">Administrator</span>
              </div>
              <div className="h-9 w-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-emerald-200 shadow-lg flex items-center justify-center text-white font-bold text-sm">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="ml-2 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Header & Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
                Register<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  New Livestock
                </span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Complete the details to add a new animal to your herd inventory. Ensure all mandatory fields marked with asterisks are filled correctly.
              </p>
              
              {/* Status Card */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">Quick Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    Images should be clear and well-lit.
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    Double check the Stable ID assignment.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: The Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="p-8">
                
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                    <div className="p-1 bg-red-100 rounded-full text-red-600 shrink-0">
                      <Icons.X />
                    </div>
                    <p className="text-sm text-red-700 mt-0.5">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload Area - Full Width */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bovine Image</label>
                    <div 
                      className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-200 text-center ${
                        imagePreview 
                          ? 'border-emerald-200 bg-emerald-50/30' 
                          : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                      }`}
                    >
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="h-48 w-full object-contain rounded-lg shadow-md"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-3 -right-3 bg-white text-red-500 p-1.5 rounded-full shadow-lg border border-gray-100 hover:bg-red-50 transition-colors"
                          >
                            <Icons.X />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 cursor-pointer pointer-events-none">
                          <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-emerald-500 transition-colors">
                            <Icons.Upload />
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-emerald-600">Click to upload</span> or drag and drop
                          </div>
                          <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${imagePreview ? 'hidden' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput 
                      id="name" name="name" label="Bovine Name *" 
                      placeholder="e.g. Bessie" 
                      value={formData.name} onChange={handleChange} required icon={Icons.Cow}
                    />

                    <div className="group">
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Gender *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500">
                          <Icons.Users />
                        </div>
                        <select
                          id="gender" name="gender" required
                          value={formData.gender} onChange={handleChange}
                          className="block w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm appearance-none"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <FormInput 
                      id="birthDate" name="birthDate" label="Birth Date *" type="date"
                      value={formData.birthDate} onChange={handleChange} required icon={Icons.Calendar}
                    />

                    <FormInput 
                      id="breed" name="breed" label="Breed *" placeholder="e.g. Holstein"
                      value={formData.breed} onChange={handleChange} required icon={Icons.Dna}
                    />

                    <FormInput 
                      id="location" name="location" label="Location/Pasture *" placeholder="e.g. North Field"
                      value={formData.location} onChange={handleChange} required icon={Icons.MapPin}
                    />

                    <div className="group">
                      <label htmlFor="stableId" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Assigned Stable *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500">
                          <Icons.Home />
                        </div>
                        {loadingStables ? (
                           <div className="block w-full pl-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400">Loading...</div>
                        ) : (
                          <select
                            id="stableId" name="stableId" required
                            value={formData.stableId || ''} onChange={handleChange}
                            className="block w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm appearance-none"
                          >
                            <option value="">Select a stable</option>
                            {stables.map((stable) => (
                              <option key={stable.id} value={stable.id}>
                                {stable.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/bovines')}
                      className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !isFormValid()}
                      className="relative px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : 'Create Record'}
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

export default AddBovine;