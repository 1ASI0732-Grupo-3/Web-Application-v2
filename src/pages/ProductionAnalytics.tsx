import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProductionBovine {
  id: number;
  name: string;
  weight: number;
  breed: string;
  gender: 'Macho' | 'Hembra';
  birthDate: string;
}

interface BreedWeightData {
  breed: string;
  averageWeight: number;
}

interface GenderData {
  gender: string;
  count: number;
}

const ProductionAnalytics: React.FC = () => {
  const [bovines, setBovines] = useState<ProductionBovine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockBovines: ProductionBovine[] = [
    { id: 1, name: 'Aurora', weight: 520, breed: 'Holstein', gender: 'Hembra', birthDate: '2020-03-15' },
    { id: 2, name: 'Toro Máximo', weight: 780, breed: 'Angus', gender: 'Macho', birthDate: '2019-08-22' },
    { id: 3, name: 'Bella', weight: 485, breed: 'Holstein', gender: 'Hembra', birthDate: '2021-01-10' },
    { id: 4, name: 'Champion', weight: 720, breed: 'Hereford', gender: 'Macho', birthDate: '2020-06-18' },
    { id: 5, name: 'Luna', weight: 460, breed: 'Jersey', gender: 'Hembra', birthDate: '2021-11-05' },
    { id: 6, name: 'Titán', weight: 850, breed: 'Brahman', gender: 'Macho', birthDate: '2018-12-03' },
    { id: 7, name: 'Esperanza', weight: 495, breed: 'Holstein', gender: 'Hembra', birthDate: '2020-09-28' },
    { id: 8, name: 'Rayo', weight: 690, breed: 'Simmental', gender: 'Macho', birthDate: '2019-05-14' },
    { id: 9, name: 'Estrella', weight: 430, breed: 'Jersey', gender: 'Hembra', birthDate: '2022-02-20' },
    { id: 10, name: 'Coloso', weight: 800, breed: 'Charolais', gender: 'Macho', birthDate: '2018-10-07' }
  ];

  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be: const data = await productionApi.getProductionData();
        setBovines(mockBovines);
      } catch (error: any) {
        setError('Failed to fetch production data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductionData();
  }, []);

  // Production calculations
  const calculateMeatProduction = () => {
    return bovines.reduce((total, bovine) => total + bovine.weight, 0);
  };

  const calculateMilkProduction = () => {
    return bovines
      .filter(bovine => bovine.gender === 'Hembra')
      .reduce((total, bovine) => {
        const dailyMilk = bovine.breed.toLowerCase().includes('holstein') ? 25 : 10;
        return total + dailyMilk;
      }, 0);
  };

  const calculateAverageWeight = () => {
    if (bovines.length === 0) return 0;
    return Math.round(calculateMeatProduction() / bovines.length);
  };

  // Chart data preparation
  const getBreedWeightData = (): BreedWeightData[] => {
    const breedMap = new Map<string, { totalWeight: number; count: number }>();
    
    bovines.forEach(bovine => {
      const existing = breedMap.get(bovine.breed) || { totalWeight: 0, count: 0 };
      breedMap.set(bovine.breed, {
        totalWeight: existing.totalWeight + bovine.weight,
        count: existing.count + 1
      });
    });

    return Array.from(breedMap.entries()).map(([breed, data]) => ({
      breed,
      averageWeight: Math.round(data.totalWeight / data.count)
    }));
  };

  const getGenderData = (): GenderData[] => {
    const maleCount = bovines.filter(b => b.gender === 'Macho').length;
    const femaleCount = bovines.filter(b => b.gender === 'Hembra').length;
    
    return [
      { gender: 'Machos', count: maleCount },
      { gender: 'Hembras', count: femaleCount }
    ];
  };

  const getTopBovines = () => {
    return bovines
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading production analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToHome}
                className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg hover:from-green-700 hover:to-emerald-700 transition duration-200"
              >
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Production Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Meat Production */}
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6 transform hover:scale-105 transition duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Producción Carne</p>
                <p className="text-3xl font-bold text-slate-800">{calculateMeatProduction().toLocaleString()}</p>
                <p className="text-slate-600 text-xs">Kg totales</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Milk Production */}
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6 transform hover:scale-105 transition duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Producción Leche</p>
                <p className="text-3xl font-bold text-slate-800">{calculateMilkProduction()}</p>
                <p className="text-slate-600 text-xs">Litros/día estimados</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Weight */}
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6 transform hover:scale-105 transition duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Peso Promedio</p>
                <p className="text-3xl font-bold text-slate-800">{calculateAverageWeight()}</p>
                <p className="text-slate-600 text-xs">Kg por animal</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-9m3 9l3-9" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart - Average Weight by Breed */}
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Peso Promedio por Raza</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getBreedWeightData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis dataKey="breed" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <Bar dataKey="averageWeight" fill="url(#colorGradient)" />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Gender Distribution */}
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Distribución por Género</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getGenderData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ gender, count, percent }) => `${gender}: ${count} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {getGenderData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Heaviest Animals */}
        <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Top 5 Animales con Mayor Peso</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Posición</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Raza</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Género</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Peso (Kg)</th>
                </tr>
              </thead>
              <tbody>
                {getTopBovines().map((bovine, index) => (
                  <tr key={bovine.id} className="border-b border-white/10 hover:bg-white/10 transition duration-200">
                    <td className="py-3 px-4 text-slate-800">
                      <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{bovine.name}</td>
                    <td className="py-3 px-4 text-slate-700">{bovine.breed}</td>
                    <td className="py-3 px-4 text-slate-700">{bovine.gender}</td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">{bovine.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductionAnalytics;