import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { bovinesApi, vaccinesApi, stablesApi, type Bovine, type Vaccine, type Stable } from '../services/api';

interface BreedWeightData {
  breed: string;
  averageWeight: number;
  [key: string]: string | number;
}

interface GenderData {
  gender: string;
  count: number;
  [key: string]: string | number;
}

interface AgeDistribution {
  ageGroup: string;
  count: number;
  [key: string]: string | number;
}

interface StableStats {
  stable: string;
  count: number;
  [key: string]: string | number;
}

const ProductionAnalytics: React.FC = () => {
  const [bovines, setBovines] = useState<Bovine[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [stables, setStables] = useState<Stable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [productionMode, setProductionMode] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Función para simular peso basado en raza, edad y género
  const getSimulatedWeight = (bovine: Bovine): number => {
    const age = calculateAge(bovine.birthDate);
    const breed = bovine.breed?.toLowerCase() || '';
    const isFemale = bovine.gender?.toLowerCase() === 'hembra' || bovine.gender?.toLowerCase() === 'female';
    
    // Peso base por raza (kg para adulto)
    let baseWeight = 450;
    
    if (breed.includes('holstein')) baseWeight = isFemale ? 680 : 1000;
    else if (breed.includes('angus')) baseWeight = isFemale ? 550 : 850;
    else if (breed.includes('hereford')) baseWeight = isFemale ? 540 : 820;
    else if (breed.includes('brahman') || breed.includes('cebu')) baseWeight = isFemale ? 500 : 800;
    else if (breed.includes('jersey')) baseWeight = isFemale ? 400 : 650;
    else if (breed.includes('simmental')) baseWeight = isFemale ? 600 : 950;
    else if (breed.includes('charolais')) baseWeight = isFemale ? 650 : 1050;
    else if (breed.includes('limousin')) baseWeight = isFemale ? 580 : 900;
    else if (breed.includes('brown swiss') || breed.includes('pardo suizo')) baseWeight = isFemale ? 600 : 900;
    else if (breed.includes('guernsey')) baseWeight = isFemale ? 450 : 700;
    else if (breed.includes('nelore')) baseWeight = isFemale ? 480 : 750;
    else if (breed.includes('gyr') || breed.includes('gir')) baseWeight = isFemale ? 400 : 600;
    
    // Factor de crecimiento según edad
    let ageFactor = 1;
    if (age < 0.5) ageFactor = 0.15;
    else if (age < 1) ageFactor = 0.35;
    else if (age < 1.5) ageFactor = 0.55;
    else if (age < 2) ageFactor = 0.70;
    else if (age < 3) ageFactor = 0.85;
    else if (age < 5) ageFactor = 1.0;
    else if (age < 8) ageFactor = 1.05;
    else ageFactor = 0.95;
    
    // Variación para hacerlo realista (+/- 10%)
    const variation = 0.9 + ((bovine.id % 20) / 100);
    
    return Math.round(baseWeight * ageFactor * variation);
  };

  // Obtener peso real o calculado
  const getEffectiveWeight = (bovine: Bovine): number => {
    if (bovine.weight && bovine.weight > 0) return bovine.weight;
    return getSimulatedWeight(bovine);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bovinesData, vaccinesData, stablesData] = await Promise.all([
          bovinesApi.getAllBovines(),
          vaccinesApi.getAllVaccines(),
          stablesApi.getAllStables()
        ]);
        setBovines(bovinesData);
        setVaccines(vaccinesData);
        setStables(stablesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Production calculations
  const calculateMeatProduction = () => {
    return bovines.reduce((total, bovine) => total + getEffectiveWeight(bovine), 0);
  };

  const calculateMilkProduction = () => {
    const dailyProduction = bovines
      .filter(bovine => 
        (bovine.gender?.toLowerCase() === 'female' || bovine.gender?.toLowerCase() === 'hembra') &&
        bovine.birthDate
      )
      .reduce((total, bovine) => {
        const age = calculateAge(bovine.birthDate);
        if (age < 2) return total; // Young cows don't produce milk
        
        let dailyMilk = 0;
        const breed = bovine.breed.toLowerCase();
        
        if (breed.includes('holstein')) dailyMilk = 25;
        else if (breed.includes('jersey')) dailyMilk = 20;
        else if (breed.includes('brown swiss')) dailyMilk = 22;
        else if (breed.includes('guernsey')) dailyMilk = 18;
        else dailyMilk = 10; // Default for other breeds
        
        return total + dailyMilk;
      }, 0);
    
    const multiplier = productionMode === 'daily' ? 1 : productionMode === 'monthly' ? 30 : 365;
    return Math.round(dailyProduction * multiplier);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInYears = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears;
  };

  const calculateAverageWeight = () => {
    if (bovines.length === 0) return 0;
    const total = bovines.reduce((sum, b) => sum + getEffectiveWeight(b), 0);
    return Math.round(total / bovines.length);
  };

  const calculateTotalValue = () => {
    const meatValue = calculateMeatProduction() * 4.5; // $4.5 por kg
    const milkDaily = bovines
      .filter(bovine => 
        (bovine.gender?.toLowerCase() === 'female' || bovine.gender?.toLowerCase() === 'hembra') &&
        bovine.birthDate
      )
      .reduce((total, bovine) => {
        const age = calculateAge(bovine.birthDate);
        if (age < 2) return total;
        const breed = bovine.breed.toLowerCase();
        let dailyMilk = 0;
        if (breed.includes('holstein')) dailyMilk = 25;
        else if (breed.includes('jersey')) dailyMilk = 20;
        else dailyMilk = 10;
        return total + dailyMilk;
      }, 0);
    
    const milkValue = milkDaily * 0.35 * (productionMode === 'daily' ? 1 : productionMode === 'monthly' ? 30 : 365); // $0.35 per liter
    return Math.round(meatValue + milkValue);
  };

  const getAgeDistribution = (): AgeDistribution[] => {
    const distribution = {
      '0-1 years': 0,
      '1-2 years': 0,
      '2-5 years': 0,
      '5+ years': 0
    };

    bovines.filter(b => b.birthDate).forEach(bovine => {
      const age = calculateAge(bovine.birthDate);
      if (age < 1) distribution['0-1 years']++;
      else if (age < 2) distribution['1-2 years']++;
      else if (age < 5) distribution['2-5 years']++;
      else distribution['5+ years']++;
    });

    return Object.entries(distribution).map(([ageGroup, count]) => ({
      ageGroup,
      count
    }));
  };

  // Chart data preparation
  const getBreedWeightData = (): BreedWeightData[] => {
    const breedMap = new Map<string, { totalWeight: number; count: number }>();
    
    bovines.forEach(bovine => {
      const weight = getEffectiveWeight(bovine);
      const existing = breedMap.get(bovine.breed) || { totalWeight: 0, count: 0 };
      breedMap.set(bovine.breed, {
        totalWeight: existing.totalWeight + weight,
        count: existing.count + 1
      });
    });

    return Array.from(breedMap.entries()).map(([breed, data]) => ({
      breed,
      averageWeight: Math.round(data.totalWeight / data.count)
    }));
  };

  const getGenderData = (): GenderData[] => {
    const genderCounts: { [key: string]: number } = {};
    
    bovines.forEach(b => {
      const gender = b.gender || 'Unknown';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });
    
    return Object.entries(genderCounts).map(([gender, count]) => ({
      gender,
      count
    }));
  };

  const getStableStats = (): StableStats[] => {
    const stableMap = new Map<number, number>();
    
    bovines.forEach(bovine => {
      const count = stableMap.get(bovine.stableId) || 0;
      stableMap.set(bovine.stableId, count + 1);
    });

    return Array.from(stableMap.entries())
      .map(([stableId, count]) => {
        const stable = stables.find(s => s.id === stableId);
        return {
          stable: stable?.name || `Stable ${stableId}`,
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getVaccineStats = () => {
    const vaccineTypes: { [key: string]: number } = {};
    vaccines.forEach(v => {
      vaccineTypes[v.vaccineType] = (vaccineTypes[v.vaccineType] || 0) + 1;
    });
    return Object.entries(vaccineTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getTopBovines = () => {
    return [...bovines]
      .sort((a, b) => getEffectiveWeight(b) - getEffectiveWeight(a))
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
                Análisis de Producción
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
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-700 text-lg font-medium">Cargando estadísticas de producción...</p>
          </div>
        ) : bovines.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-12 text-center">
            <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No hay bovinos registrados</h3>
            <p className="text-slate-600 mb-6">Agrega bovinos a tus establos para ver análisis y estadísticas de producción</p>
            <button
              onClick={() => navigate('/bovines')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg"
            >
              Ir a Gestión de Bovinos
            </button>
          </div>
        ) : (
          <>
            {/* Overview Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Total Bovinos</p>
                <p className="text-3xl font-bold">{bovines.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Total Establos</p>
                <p className="text-3xl font-bold">{stables.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Total Vacunas</p>
                <p className="text-3xl font-bold">{vaccines.length}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Peso Promedio</p>
                <p className="text-3xl font-bold">{calculateAverageWeight()}</p>
                <p className="text-xs opacity-90">kg</p>
              </div>
            </div>

            {/* Production Mode Selector */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-4 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-700 font-medium">Ver Producción:</span>
                  <button
                    onClick={() => setShowInfoModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition duration-200 flex items-center space-x-1"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>¿Cómo se calcula?</span>
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setProductionMode('daily')}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      productionMode === 'daily'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    Diario
                  </button>
                  <button
                    onClick={() => setProductionMode('monthly')}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      productionMode === 'monthly'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    Mensual
                  </button>
                  <button
                    onClick={() => setProductionMode('yearly')}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      productionMode === 'yearly'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    Anual
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Meat Production */}
              <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6 transform hover:scale-105 transition duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Producción de Carne</p>
                    <p className="text-3xl font-bold text-slate-800">{calculateMeatProduction().toLocaleString()}</p>
                    <p className="text-slate-600 text-xs">Total Kg</p>
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
                    <p className="text-slate-600 text-sm font-medium">Producción de Leche</p>
                    <p className="text-3xl font-bold text-slate-800">{calculateMilkProduction().toLocaleString()}</p>
                    <p className="text-slate-600 text-xs">Litros / {productionMode === 'daily' ? 'diario' : productionMode === 'monthly' ? 'mensual' : 'anual'}</p>
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

              {/* Estimated Value */}
              <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6 transform hover:scale-105 transition duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Valor Estimado</p>
                    <p className="text-3xl font-bold text-slate-800">${calculateTotalValue().toLocaleString()}</p>
                    <p className="text-slate-600 text-xs">Valor producción / {productionMode === 'daily' ? 'diario' : productionMode === 'monthly' ? 'mensual' : 'anual'}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {bovines.length > 1 && (
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
                        label
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {getGenderData().map((_entry, index) => (
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

                {/* Age Distribution Chart */}
                <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6 lg:col-span-2">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Distribución por Edad</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getAgeDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                      <XAxis dataKey="ageGroup" tick={{ fill: '#475569', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          border: 'none', 
                          borderRadius: '8px',
                          backdropFilter: 'blur(10px)'
                        }} 
                      />
                      <Bar dataKey="count" fill="url(#ageGradient)" />
                      <defs>
                        <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Additional Stats: Stables & Vaccines */}
            {(stables.length > 0 || vaccines.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Stables Distribution */}
                {stables.length > 0 && getStableStats().length > 0 && (
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Bovinos por Establo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getStableStats()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                        <XAxis dataKey="stable" tick={{ fill: '#475569', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            border: 'none', 
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                        <Bar dataKey="count" fill="url(#stableGradient)" />
                        <defs>
                          <linearGradient id="stableGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Vaccine Types Distribution */}
                {vaccines.length > 0 && getVaccineStats().length > 0 && (
                  <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Distribución de Vacunas</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getVaccineStats()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                        <XAxis dataKey="type" tick={{ fill: '#475569', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            border: 'none', 
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                        <Bar dataKey="count" fill="url(#vaccineGradient)" />
                        <defs>
                          <linearGradient id="vaccineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Top Producers Section */}
            {bovines.length >= 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top 5 Heaviest */}
                <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Top 5 Bovinos Más Pesados</h3>
                  <div className="space-y-3">
                    {getTopBovines().map((bovine, index) => {
                      const weight = getEffectiveWeight(bovine);
                      return (
                        <div key={bovine.id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg hover:bg-white/40 transition duration-200">
                          <div className="flex items-center space-x-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-yellow-400 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              index === 2 ? 'bg-orange-400 text-orange-900' :
                              'bg-blue-200 text-blue-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{bovine.name}</p>
                              <p className="text-xs text-slate-600">{bovine.breed}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800">{weight} kg</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Breed Summary */}
                <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Resumen por Raza</h3>
                  <div className="space-y-3">
                    {getBreedWeightData().map((breed, index) => {
                      const breedCount = bovines.filter(b => b.breed === breed.breed).length;
                      const breedPercentage = ((breedCount / bovines.length) * 100).toFixed(1);
                      return (
                        <div key={index} className="p-3 bg-white/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-slate-800">{breed.breed}</span>
                            <span className="text-sm text-slate-600">{breedCount} animales ({breedPercentage}%)</span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${breedPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">Peso Prom: {breed.averageWeight} kg</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Animals List */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Lista de Animales ({bovines.length})</h3>
                <div className="text-sm text-slate-600">
                  Peso Total del Rebaño: <span className="font-bold text-slate-800">{calculateMeatProduction().toLocaleString()} kg</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Nombre</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Raza</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Género</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Edad</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Peso (Kg)</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Prod. Leche</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bovines.map((bovine) => {
                      const age = calculateAge(bovine.birthDate);
                      const canProduceMilk = (bovine.gender?.toLowerCase() === 'hembra' || bovine.gender?.toLowerCase() === 'female') && age >= 2;
                      const effectiveWeight = getEffectiveWeight(bovine);
                      let dailyMilk = 0;
                      if (canProduceMilk) {
                        const breed = bovine.breed.toLowerCase();
                        if (breed.includes('holstein')) dailyMilk = 25;
                        else if (breed.includes('jersey')) dailyMilk = 20;
                        else dailyMilk = 10;
                      }
                      
                      return (
                        <tr key={bovine.id} className="border-b border-white/10 hover:bg-white/10 transition duration-200">
                          <td className="py-3 px-4 text-slate-800 font-medium">{bovine.name}</td>
                          <td className="py-3 px-4 text-slate-700">{bovine.breed}</td>
                          <td className="py-3 px-4 text-slate-700">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bovine.gender?.toLowerCase() === 'hembra' || bovine.gender?.toLowerCase() === 'female' 
                                ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {bovine.gender?.toLowerCase() === 'hembra' || bovine.gender?.toLowerCase() === 'female' ? 'Hembra' : 'Macho'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{age.toFixed(1)} años</td>
                          <td className="py-3 px-4 text-slate-800 font-semibold">{effectiveWeight} kg</td>
                          <td className="py-3 px-4 text-slate-700">
                            {canProduceMilk ? (
                              <span className="text-green-600 font-medium">{dailyMilk} L/día</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal Informativo */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">¿Cómo se calculan las métricas?</h2>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="h-8 w-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition duration-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Producción de Carne */}
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
                  <span className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  Producción de Carne
                </h3>
                <p className="text-slate-700 mb-2"><strong>Fórmula:</strong> Suma total del peso de todos los bovinos registrados</p>
                <div className="bg-white p-3 rounded-lg font-mono text-sm">
                  Total Kg = Peso₁ + Peso₂ + ... + Peso_n
                </div>
                <p className="text-slate-600 text-sm mt-2">
                  <strong>Ejemplo:</strong> Si tienes 3 bovinos de 400kg, 350kg y 450kg → <strong>1,200 kg</strong>
                </p>
              </div>

              {/* Producción de Leche */}
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
                  <span className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </span>
                  Producción de Leche
                </h3>
                <p className="text-slate-700 mb-2"><strong>Criterios:</strong></p>
                <ul className="list-disc list-inside text-slate-700 space-y-1 mb-2">
                  <li>Solo hembras mayores de 2 años producen leche</li>
                  <li>Producción diaria según raza:</li>
                </ul>
                <div className="bg-white p-3 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between"><span>Holstein:</span><strong>25 L/día</strong></div>
                  <div className="flex justify-between"><span>Jersey:</span><strong>20 L/día</strong></div>
                  <div className="flex justify-between"><span>Brown Swiss:</span><strong>22 L/día</strong></div>
                  <div className="flex justify-between"><span>Guernsey:</span><strong>18 L/día</strong></div>
                  <div className="flex justify-between"><span>Otras razas:</span><strong>10 L/día</strong></div>
                </div>
                <p className="text-slate-600 text-sm mt-2">
                  <strong>Multiplicadores:</strong> Diario (×1) | Mensual (×30) | Anual (×365)
                </p>
                <p className="text-slate-600 text-sm">
                  <strong>Ejemplo:</strong> 2 Holstein adultas = 2 × 25L = 50 L/día → <strong>1,500 L/mes</strong>
                </p>
              </div>

              {/* Peso Promedio */}
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
                  <span className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-9m3 9l3-9" />
                    </svg>
                  </span>
                  Peso Promedio
                </h3>
                <p className="text-slate-700 mb-2"><strong>Fórmula:</strong> Peso total dividido entre número de animales</p>
                <div className="bg-white p-3 rounded-lg font-mono text-sm">
                  Peso Promedio = (Σ Pesos) ÷ Número de Bovinos
                </div>
                <p className="text-slate-600 text-sm mt-2">
                  <strong>Ejemplo:</strong> (400 + 350 + 450) ÷ 3 = <strong>400 kg</strong>
                </p>
              </div>

              {/* Valor Estimado */}
              <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
                  <span className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Valor Estimado
                </h3>
                <p className="text-slate-700 mb-2"><strong>Fórmula:</strong> Valor de carne + Valor de leche</p>
                <div className="bg-white p-3 rounded-lg space-y-2 text-sm">
                  <div>
                    <strong>Precios de referencia:</strong>
                    <div className="flex justify-between mt-1">
                      <span>Carne:</span>
                      <strong>$4.5 USD por kg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Leche:</span>
                      <strong>$0.35 USD por litro</strong>
                    </div>
                  </div>
                  <div className="border-t pt-2 font-mono text-xs">
                    Valor Total = (Peso Total × $4.5) + (Leche × $0.35 × Multiplicador)
                  </div>
                </div>
                <p className="text-slate-600 text-sm mt-2">
                  <strong>Ejemplo (Mensual):</strong>
                </p>
                <ul className="text-slate-600 text-sm list-disc list-inside">
                  <li>Carne: 1,200 kg × $4.5 = $5,400</li>
                  <li>Leche: 50 L/día × $0.35 × 30 = $525</li>
                  <li><strong>Total: $5,925</strong></li>
                </ul>
              </div>

              {/* Nota importante */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-1">Nota Importante</h4>
                    <p className="text-yellow-700 text-sm">
                      Si las métricas aparecen en 0, verifica que tus bovinos tengan los campos completos: 
                      <strong> peso, género, fecha de nacimiento y raza</strong>. Solo los registros completos se incluyen en los cálculos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl border-t">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionAnalytics;