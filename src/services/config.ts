// Configuración de entornos para diferentes backends
export interface ApiConfig {
  baseUrl: string;
  name: string;
  description: string;
}

export const API_ENVIRONMENTS: Record<string, ApiConfig> = {
  vacapp: {
    baseUrl: 'https://vacappexpbackend-cahacmh4atbxd0g3.brazilsouth-01.azurewebsites.net/api/v1',
    name: 'VacApp Backend',
    description: 'Nuevo backend de VacApp con funcionalidades extendidas'
  },
  muusmart: {
    baseUrl: 'https://muusmart-avc7fxh4ajhufre3.brazilsouth-01.azurewebsites.net/api/v1',
    name: 'MuuSmart Backend',
    description: 'Backend original de MuuSmart'
  },
  local: {
    baseUrl: 'http://localhost:5001/api/v1',
    name: 'Local Development',
    description: 'Servidor de desarrollo local'
  }
};

// Configuración activa (cambiar aquí para usar diferente backend)
export const ACTIVE_ENVIRONMENT: keyof typeof API_ENVIRONMENTS = 'vacapp';

// URL del backend activo
export const API_BASE_URL = API_ENVIRONMENTS[ACTIVE_ENVIRONMENT].baseUrl;

// Función para obtener la configuración actual
export const getCurrentApiConfig = (): ApiConfig => {
  return API_ENVIRONMENTS[ACTIVE_ENVIRONMENT];
};

// Función para cambiar el entorno (útil para testing)
export const switchEnvironment = (env: keyof typeof API_ENVIRONMENTS): string => {
  return API_ENVIRONMENTS[env].baseUrl;
};