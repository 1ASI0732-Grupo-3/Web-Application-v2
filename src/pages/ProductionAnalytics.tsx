import React, { useState } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    breed: '',
    gender: 'Hembra' as 'Macho' | 'Hembra',
    birthDate: ''
  });
  const [nextId, setNextId] = useState(1);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBovine = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.weight || !formData.breed || !formData.birthDate) {
      alert('Please complete all fields');
      return;
    }

    const newBovine: ProductionBovine = {
      id: nextId,
      name: formData.name,
      weight: parseFloat(formData.weight),
      breed: formData.breed,
      gender: formData.gender,
      birthDate: formData.birthDate
    };

    setBovines(prev => [...prev, newBovine]);
    setNextId(prev => prev + 1);
    setFormData({
      name: '',
      weight: '',
      breed: '',
      gender: 'Hembra',
      birthDate: ''
    });
  };

  const handleRemoveBovine = (id: number) => {
    setBovines(prev => prev.filter(bovine => bovine.id !== id));
  };

  const handleClearAll = () => {
    setBovines([]);
    setNextId(1);
  };

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
      { gender: 'Males', count: maleCount },
      { gender: 'Females', count: femaleCount }
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
        {/* Input Form */}
        <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Add Bovine</h3>
            {bovines.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
              >
                Clear All
              </button>
            )}
          </div>
          
          <form onSubmit={handleAddBovine} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g: Aurora"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight (Kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="520"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Breed</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                placeholder="Holstein, Angus, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Hembra">Female</option>
                <option value="Macho">Male</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-1">Birth Date</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div className="md:col-span-5">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 transform hover:scale-105 shadow-md"
              >
                + Add Bovine
              </button>
            </div>
          </form>
        </div>

        {bovines.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-8 text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Start by adding bovines!</h3>
            <p className="text-slate-600">Add information about your animals to see production calculations</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <p className="text-3xl font-bold text-slate-800">{calculateMilkProduction()}</p>
                    <p className="text-slate-600 text-xs">Estimated L/day</p>
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
            )}

            {/* Animals List */}
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Animal List ({bovines.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Breed</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Gender</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Weight (Kg)</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Milk Prod.</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bovines.map((bovine) => (
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
                        <td className="py-3 px-4 text-slate-800 font-semibold">{bovine.weight}</td>
                        <td className="py-3 px-4 text-slate-700">
                          {bovine.gender === 'Hembra' ? 
                            `${bovine.breed.toLowerCase().includes('holstein') ? '25' : '10'} L/day` : 
                            '-'
                          }
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleRemoveBovine(bovine.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition duration-200"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
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