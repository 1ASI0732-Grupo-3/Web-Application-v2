import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, bovinesApi, stablesApi, vaccinationApi } from '../services/api';
import { getCurrentApiConfig } from '../services/config';

interface TestResult {
  status: 'success' | 'error';
  data?: unknown;
  error?: string;
}

const ApiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiConfig = getCurrentApiConfig();

  const runApiTest = async (testName: string, testFunction: () => Promise<unknown>) => {
    try {
      setLoading(true);
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'success', data: result, error: undefined }
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResults(prev => ({
        ...prev,
        [testName]: { 
          status: 'error', 
          data: undefined, 
          error: errorMessage
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    const tests = [
      {
        name: 'getUserInfo',
        test: () => authApi.getUserInfo()
      },
      {
        name: 'getProfile',
        test: () => authApi.getProfile()
      },
      {
        name: 'getAllBovines',
        test: () => bovinesApi.getAllBovines()
      },
      {
        name: 'getAllStables',
        test: () => stablesApi.getAllStables()
      },
      {
        name: 'getAllVaccinations',
        test: () => vaccinationApi.getAllVaccinations()
      }
    ];

    for (const { name, test } of tests) {
      await runApiTest(name, test);
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔧 API Integration Test
              </h1>
              <p className="text-gray-600">
                Probando la integración con <span className="font-semibold text-blue-600">{apiConfig.name}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                URL: <code className="bg-gray-100 px-2 py-1 rounded">{apiConfig.baseUrl}</code>
              </p>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Pruebas de Conectividad</h2>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Ejecutando...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>Ejecutar Todas las Pruebas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`px-6 py-4 border-l-4 ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{testName}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(result.status)}`}>
                    {result.status === 'success' ? '✅ Éxito' : '❌ Error'}
                  </div>
                </div>
                
                {result.error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">Error:</p>
                    <p className="text-sm text-red-600">{result.error}</p>
                  </div>
                )}
                
                {result.data !== undefined && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Respuesta:</p>
                    <div className="bg-gray-50 p-3 rounded-lg overflow-auto max-h-40">
                      <pre className="text-xs text-gray-600">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Instrucciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🔍 Qué Verificar:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Conectividad con el nuevo backend</li>
                <li>• Estructura de respuestas de la API</li>
                <li>• Compatibilidad de endpoints</li>
                <li>• Manejo de errores</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">⚙️ Si hay Errores:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verificar que el backend esté activo</li>
                <li>• Revisar los endpoints en Swagger</li>
                <li>• Ajustar las interfaces TypeScript</li>
                <li>• Actualizar los nombres de campos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => runApiTest('userInfo', () => authApi.getUserInfo())}
              className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
            >
              Probar Usuario
            </button>
            <button
              onClick={() => runApiTest('bovines', () => bovinesApi.getAllBovines())}
              className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition text-sm font-medium"
            >
              Probar Bovinos
            </button>
            <button
              onClick={() => runApiTest('vaccinations', () => vaccinationApi.getAllVaccinations())}
              className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition text-sm font-medium"
            >
              Probar Vacunaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;