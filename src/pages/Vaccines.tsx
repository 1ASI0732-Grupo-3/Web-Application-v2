import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vaccinesApi, bovinesApi, type Vaccine, type Bovine } from '../services/api';

const Vaccines: React.FC = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [bovines, setBovines] = useState<Bovine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [filterBovineId, setFilterBovineId] = useState<string>('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    vaccineType: '',
    vaccineDate: '',
    bovineId: '',
    fileData: null as File | null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [vaccinesData, bovinesData] = await Promise.all([
        vaccinesApi.getAllVaccines(),
        bovinesApi.getAllBovines()
      ]);
      setVaccines(vaccinesData);
      setBovines(bovinesData);
    } catch (error: any) {
      setError('Error al cargar los datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, fileData: e.target.files![0] }));
    }
  };

  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (!formData.name || !formData.vaccineType || !formData.vaccineDate || !formData.bovineId) {
        setError('Todos los campos son obligatorios');
        return;
      }

      await vaccinesApi.createVaccine({
        name: formData.name,
        vaccineType: formData.vaccineType,
        vaccineDate: formData.vaccineDate,
        bovineId: parseInt(formData.bovineId),
        fileData: formData.fileData || undefined,
      });

      setSuccess('Vacuna agregada exitosamente');
      setShowAddModal(false);
      resetForm();
      await fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al agregar la vacuna');
      console.error(error);
    }
  };

  const handleEditVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaccine) return;

    try {
      setError('');
      setSuccess('');

      if (!formData.name || !formData.vaccineType || !formData.vaccineDate || !formData.bovineId) {
        setError('Todos los campos son obligatorios');
        return;
      }

      await vaccinesApi.updateVaccine(selectedVaccine.id, {
        name: formData.name,
        vaccineType: formData.vaccineType,
        vaccineDate: formData.vaccineDate,
        bovineId: parseInt(formData.bovineId),
        fileData: formData.fileData || undefined,
      });

      setSuccess('Vacuna actualizada exitosamente');
      setShowEditModal(false);
      setSelectedVaccine(null);
      resetForm();
      await fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar la vacuna');
      console.error(error);
    }
  };

  const handleDeleteVaccine = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta vacuna?')) return;

    try {
      setError('');
      setSuccess('');
      await vaccinesApi.deleteVaccine(id);
      setSuccess('Vacuna eliminada exitosamente');
      await fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar la vacuna');
      console.error(error);
    }
  };

  const openEditModal = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setFormData({
      name: vaccine.name,
      vaccineType: vaccine.vaccineType,
      vaccineDate: vaccine.vaccineDate.split('T')[0],
      bovineId: vaccine.bovineId.toString(),
      fileData: null,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      vaccineType: '',
      vaccineDate: '',
      bovineId: '',
      fileData: null,
    });
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const getBovineName = (bovineId: number) => {
    const bovine = bovines.find(b => b.id === bovineId);
    return bovine ? bovine.name : 'Unknown';
  };

  const filteredVaccines = filterBovineId
    ? vaccines.filter(v => v.bovineId === parseInt(filterBovineId))
    : vaccines;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-500 font-medium">Cargando registros de vacunación...</p>
        </div>
      </div>
    );
  }

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
                onClick={handleBackToHome}
                className="group p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                title="Volver al Inicio"
              >
                <svg className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                 </span>
                 Gestión de Vacunas
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
                title="Cerrar Sesión"
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
        
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start mb-6 animate-fade-in-up">
            <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start mb-6 animate-fade-in-up">
            <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Registro de Vacunación</h2>
            <p className="mt-2 text-gray-500">Administra el historial sanitario de tu ganado.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             {/* Filter Dropdown */}
             <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                     </svg>
                 </div>
                 <select
                    value={filterBovineId}
                    onChange={(e) => setFilterBovineId(e.target.value)}
                    className="block w-full sm:w-64 pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out sm:text-sm appearance-none"
                  >
                    <option value="">Todos los bovinos</option>
                    {bovines.map(bovine => (
                      <option key={bovine.id} value={bovine.id}>{bovine.name}</option>
                    ))}
                  </select>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
             </div>

            <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Vacuna
            </button>
          </div>
        </div>

        {/* Vaccines Grid */}
        {filteredVaccines.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-12 w-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron registros</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
               No hay vacunas registradas con los filtros actuales. Comienza agregando una nueva.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVaccines.map(vaccine => (
              <div key={vaccine.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {/* Image / Placeholder */}
                <div className="h-40 relative overflow-hidden bg-gray-50">
                    {vaccine.vaccineImg ? (
                        <img 
                          src={vaccine.vaccineImg} 
                          alt={vaccine.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                             e.currentTarget.style.display = 'none';
                             e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                    ) : null}
                     <div className={`absolute inset-0 flex items-center justify-center bg-emerald-50/50 ${vaccine.vaccineImg ? 'hidden' : ''}`}>
                         <svg className="h-12 w-12 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                         </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col">
                    <div className="mb-3">
                         <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{vaccine.name}</h3>
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mt-1">
                            {vaccine.vaccineType}
                         </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-600 flex-grow">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium">Bovino:</span>
                            <span className="ml-1 text-gray-900">{getBovineName(vaccine.bovineId)}</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                             <span className="font-medium">Fecha:</span>
                             <span className="ml-1 text-gray-900">{new Date(vaccine.vaccineDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex space-x-2 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => openEditModal(vaccine)}
                            className="flex-1 py-2 px-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1"
                        >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                             </svg>
                             Editar
                        </button>
                        <button
                            onClick={() => handleDeleteVaccine(vaccine.id)}
                            className="py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                            title="Eliminar"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all scale-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {showAddModal ? 'Nueva Vacuna' : 'Editar Vacuna'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={showAddModal ? handleAddVaccine : handleEditVaccine} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la Vacuna *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none"
                    placeholder="Ej. Fiebre Aftosa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Vacuna *</label>
                  <input
                    type="text"
                    name="vaccineType"
                    value={formData.vaccineType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none"
                    placeholder="Ej. Viral"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Aplicación *</label>
                        <input
                            type="date"
                            name="vaccineDate"
                            value={formData.vaccineDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none text-gray-700"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bovino *</label>
                        <select
                            name="bovineId"
                            value={formData.bovineId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none bg-white"
                            required
                        >
                            <option value="">Seleccionar...</option>
                            {bovines.map(bovine => (
                            <option key={bovine.id} value={bovine.id}>{bovine.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Comprobante / Foto (Opcional)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                            <span>Subir archivo</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                        {formData.fileData && (
                            <p className="text-xs font-semibold text-emerald-600 mt-2">
                                Archivo seleccionado: {formData.fileData.name}
                            </p>
                        )}
                      </div>
                    </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-white text-gray-700 px-4 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition duration-200"
                  >
                    {showAddModal ? 'Guardar Vacuna' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vaccines;