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
  const [productionMode, setProductionMode] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    return bovines
      .filter(b => b.weight)
      .reduce((total, bovine) => total + (bovine.weight || 0), 0);
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
    const bovinesWithWeight = bovines.filter(b => b.weight);
    if (bovinesWithWeight.length === 0) return 0;
    const total = bovinesWithWeight.reduce((sum, b) => sum + (b.weight || 0), 0);
    return Math.round(total / bovinesWithWeight.length);
  };

  const calculateTotalValue = () => {
    const meatValue = calculateMeatProduction() * 4.5; // $4.5 per kg
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
    
    bovines.filter(b => b.weight).forEach(bovine => {
      const existing = breedMap.get(bovine.breed) || { totalWeight: 0, count: 0 };
      breedMap.set(bovine.breed, {
        totalWeight: existing.totalWeight + (bovine.weight || 0),
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
    return bovines
      .filter(b => b.weight)
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
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
                Production Calculator
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
        {loading ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-700 text-lg font-medium">Loading production statistics...</p>
          </div>
        ) : bovines.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-12 text-center">
            <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No bovines registered yet</h3>
            <p className="text-slate-600 mb-6">Add bovines to your stables to see production analytics and statistics</p>
            <button
              onClick={() => navigate('/bovines')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition duration-200 transform hover:scale-105 shadow-lg"
            >
              Go to Bovines Management
            </button>
          </div>
        ) : (
          <>
            {/* Overview Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Total Bovines</p>
                <p className="text-3xl font-bold">{bovines.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Total Stables</p>
                <p className="text-3xl font-bold">{stables.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Total Vaccines</p>
                <p className="text-3xl font-bold">{vaccines.length}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-sm opacity-90">Avg Weight</p>
                <p className="text-3xl font-bold">{calculateAverageWeight()}</p>
                <p className="text-xs opacity-90">kg</p>
              </div>
            </div>

            {/* Production Mode Selector */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">View Production:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setProductionMode('daily')}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      productionMode === 'daily'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setProductionMode('monthly')}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      productionMode === 'monthly'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setProductionMode('yearly')}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      productionMode === 'yearly'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    Yearly
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
                    <p className="text-slate-600 text-sm font-medium">Meat Production</p>
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
                    <p className="text-slate-600 text-sm font-medium">Milk Production</p>
                    <p className="text-3xl font-bold text-slate-800">{calculateMilkProduction().toLocaleString()}</p>
                    <p className="text-slate-600 text-xs">Liters / {productionMode}</p>
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
                    <p className="text-slate-600 text-sm font-medium">Average Weight</p>
                    <p className="text-3xl font-bold text-slate-800">{calculateAverageWeight()}</p>
                    <p className="text-slate-600 text-xs">Kg per animal</p>
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
                    <p className="text-slate-600 text-sm font-medium">Estimated Value</p>
                    <p className="text-3xl font-bold text-slate-800">${calculateTotalValue().toLocaleString()}</p>
                    <p className="text-slate-600 text-xs">Production value / {productionMode}</p>
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
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Average Weight by Breed</h3>
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
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Gender Distribution</h3>
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
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Age Distribution</h3>
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
                    <h3 className="text-xl font-bold text-slate-800 mb-6">🏠 Bovines by Stable</h3>
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
                    <h3 className="text-xl font-bold text-slate-800 mb-6">💉 Vaccine Distribution</h3>
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
                  <h3 className="text-xl font-bold text-slate-800 mb-6">🏆 Top 5 Heaviest Bovines</h3>
                  <div className="space-y-3">
                    {getTopBovines().map((bovine, index) => (
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
                          <p className="font-bold text-slate-800">{bovine.weight} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breed Summary */}
                <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">📊 Breed Summary</h3>
                  <div className="space-y-3">
                    {getBreedWeightData().map((breed, index) => {
                      const breedCount = bovines.filter(b => b.breed === breed.breed).length;
                      const breedPercentage = ((breedCount / bovines.length) * 100).toFixed(1);
                      return (
                        <div key={index} className="p-3 bg-white/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-slate-800">{breed.breed}</span>
                            <span className="text-sm text-slate-600">{breedCount} animals ({breedPercentage}%)</span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${breedPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">Avg. Weight: {breed.averageWeight} kg</p>
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
                <h3 className="text-xl font-bold text-slate-800">Animal List ({bovines.length})</h3>
                <div className="text-sm text-slate-600">
                  Total Herd Weight: <span className="font-bold text-slate-800">{calculateMeatProduction().toLocaleString()} kg</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Breed</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Gender</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Age</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Weight (Kg)</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Milk Prod.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bovines.map((bovine) => {
                      const age = calculateAge(bovine.birthDate);
                      const canProduceMilk = bovine.gender === 'Hembra' && age >= 2;
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
                              bovine.gender === 'Hembra' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {bovine.gender === 'Hembra' ? 'Female' : 'Male'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{age.toFixed(1)} years</td>
                          <td className="py-3 px-4 text-slate-800 font-semibold">{bovine.weight || 0} kg</td>
                          <td className="py-3 px-4 text-slate-700">
                            {canProduceMilk ? (
                              <span className="text-green-600 font-medium">{dailyMilk} L/day</span>
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
    </div>
  );
};

export default ProductionAnalytics;