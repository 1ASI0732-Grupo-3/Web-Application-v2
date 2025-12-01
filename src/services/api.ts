import axios from 'axios';
import { API_BASE_URL, getCurrentApiConfig } from './config';

// Configuración de la API usando el sistema de configuración
console.log(`🔗 Conectando a: ${getCurrentApiConfig().name} - ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============== INTERFACES Y TIPOS (Actualizadas para VacApp) ==============

// Interfaces de Autenticación
export interface SignUpRequest {
  username: string;
  password: string;
  email: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInRequest {
  userName: string;
  password: string;
  // Campos alternativos para compatibilidad
  email?: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
  userName: string;
  email: string;
  // Campos adicionales que podría tener VacApp
  user?: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  refreshToken?: string;
}

export interface UserProfile {
  id?: number;
  username: string;
  email: string;
  emailConfirmed: boolean;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserInfo {
  name: string;
  totalBovines: number;
  totalVaccinations: number;
  totalStables: number;
  // Campos adicionales para VacApp
  totalCattle?: number;
  upcomingVaccinations?: number;
}

// Interfaces de Bovinos (expandidas para VacApp)
export interface Bovine {
  id: number;
  name: string;
  gender: string;
  birthDate: string;
  breed: string;
  location: string;
  bovineImg: string;
  stableId: number;
  // Campos adicionales para VacApp
  weight?: number;
  color?: string;
  motherCode?: string;
  fatherCode?: string;
  registrationDate?: string;
  healthStatus?: string;
  notes?: string;
  isActive?: boolean;
  userId?: number;
}

export interface CreateBovineRequest {
  name: string;
  gender: string;
  birthDate: string;
  breed: string;
  location: string;
  bovineImg?: File;
  stableId: number;
  // Campos adicionales
  weight?: number;
  color?: string;
  motherCode?: string;
  fatherCode?: string;
  notes?: string;
}

export interface UpdateBovineRequest {
  name: string;
  gender: string;
  birthDate: string;
  breed: string;
  location: string;
  stableId: number;
  // Campos adicionales
  weight?: number;
  color?: string;
  motherCode?: string;
  fatherCode?: string;
  notes?: string;
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Interfaces de Establos (expandidas)
export interface Stable {
  id: number;
  name: string;
  limit: number;
  // Campos adicionales para VacApp
  capacity?: number;
  location?: string;
  description?: string;
  isActive?: boolean;
  currentOccupancy?: number;
}

export interface CreateStableRequest {
  name: string;
  limit: number;
  capacity?: number;
  location?: string;
  description?: string;
}

export interface UpdateStableRequest {
  name: string;
  limit: number;
  capacity?: number;
  location?: string;
  description?: string;
}

// Interfaces para Vacunaciones (nuevas para VacApp)
export interface Vaccine {
  id: number;
  name: string;
  vaccineType: string;
  vaccineDate: string;
  vaccineImg: string;
  bovineId: number;
}

export interface Vaccination {
  id: number;
  bovineId: number;
  vaccineName: string;
  applicationDate: string;
  nextApplicationDate?: string;
  veterinarian?: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaccineRequest {
  name: string;
  vaccineType: string;
  vaccineDate: string;
  fileData?: File;
  bovineId: number;
}

export interface CreateVaccinationRequest {
  bovineId: number;
  vaccineName: string;
  applicationDate: string;
  nextApplicationDate?: string;
  veterinarian?: string;
  notes?: string;
}

// ============== SERVICIOS API (Adaptados para VacApp) ==============

export const authApi = {
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    // Intentar con el endpoint principal de VacApp
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch {
      // Fallback al endpoint original
      const response = await api.post('/user/sign-up', data);
      return response.data;
    }
  },

  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch {
      // Fallback al endpoint original
      const response = await api.post('/user/sign-in', data);
      return response.data;
    }
  },

  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch {
      // Fallback al endpoint original
      const response = await api.get('/user/profile');
      return response.data;
    }
  },

  getUserInfo: async (): Promise<UserInfo> => {
    try {
      const response = await api.get('/user/info');
      return response.data;
    } catch {
      // Fallback al endpoint original
      const response = await api.get('/user/get-info');
      return response.data;
    }
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    try {
      const response = await api.put('/auth/profile', data);
      return response.data;
    } catch {
      // Fallback al endpoint original
      const response = await api.put('/user/update-profile', data);
      return response.data;
    }
  },

  deleteAccount: async (): Promise<void> => {
    try {
      const response = await api.delete('/auth/account');
      return response.data;
    } catch {
      // Fallback al endpoint original
      const response = await api.delete('/user/delete-account');
      return response.data;
    }
  },

  // Nuevos métodos para VacApp
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  logout: async (): Promise<void> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const bovinesApi = {
  getAllBovines: async (): Promise<Bovine[]> => {
    try {
      const response = await api.get('/bovines');
      return response.data;
    } catch {
      // Fallback para posible endpoint alternativo
      const response = await api.get('/cattle');
      return response.data;
    }
  },

  createBovine: async (data: CreateBovineRequest): Promise<Bovine> => {
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('Gender', data.gender);
    formData.append('BirthDate', data.birthDate);
    formData.append('Breed', data.breed);
    formData.append('Location', data.location);
    formData.append('StableId', data.stableId.toString());
    
    // Campos adicionales para VacApp
    if (data.weight) formData.append('Weight', data.weight.toString());
    if (data.color) formData.append('Color', data.color);
    if (data.motherCode) formData.append('MotherCode', data.motherCode);
    if (data.fatherCode) formData.append('FatherCode', data.fatherCode);
    if (data.notes) formData.append('Notes', data.notes);
    
    if (data.bovineImg) {
      formData.append('FileData', data.bovineImg);
      // Intentar también con nombres de campo comunes
      formData.append('Image', data.bovineImg);
      formData.append('File', data.bovineImg);
    }

    try {
      const response = await api.post('/bovines', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch {
      // Fallback para posible endpoint alternativo
      const response = await api.post('/cattle', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  },

  getBovineById: async (id: number): Promise<Bovine> => {
    try {
      const response = await api.get(`/bovines/${id}`);
      return response.data;
    } catch {
      const response = await api.get(`/cattle/${id}`);
      return response.data;
    }
  },

  updateBovine: async (id: number, data: UpdateBovineRequest): Promise<Bovine> => {
    const updateData = {
      Name: data.name,
      Gender: data.gender,
      BirthDate: data.birthDate,
      Breed: data.breed,
      Location: data.location,
      StableId: data.stableId,
      // Campos adicionales
      Weight: data.weight,
      Color: data.color,
      MotherCode: data.motherCode,
      FatherCode: data.fatherCode,
      Notes: data.notes
    };

    try {
      const response = await api.put(`/bovines/${id}`, updateData);
      return response.data;
    } catch {
      const response = await api.put(`/cattle/${id}`, updateData);
      return response.data;
    }
  },

  deleteBovine: async (id: number): Promise<void> => {
    try {
      const response = await api.delete(`/bovines/${id}`);
      return response.data;
    } catch {
      const response = await api.delete(`/cattle/${id}`);
      return response.data;
    }
  },
};

export const stablesApi = {
  getAllStables: async (): Promise<Stable[]> => {
    const response = await api.get('/stables');
    return response.data;
  },

  createStable: async (data: CreateStableRequest): Promise<Stable> => {
    const response = await api.post('/stables', data);
    return response.data;
  },

  getStableById: async (id: number): Promise<Stable> => {
    const response = await api.get(`/stables/${id}`);
    return response.data;
  },

  updateStable: async (id: number, data: UpdateStableRequest): Promise<Stable> => {
    const response = await api.put(`/stables/${id}`, data);
    return response.data;
  },

  deleteStable: async (id: number): Promise<void> => {
    const response = await api.delete(`/stables/${id}`);
    return response.data;
  },
};

// ============== NUEVOS SERVICIOS PARA VACAPP ==============

// Servicios para Vacunas (específicos de VacApp)
export const vaccinesApi = {
  getAllVaccines: async (): Promise<Vaccine[]> => {
    const response = await api.get('/vaccines');
    return response.data;
  },

  getVaccinesByBovine: async (bovineId: number): Promise<Vaccine[]> => {
    const response = await api.get(`/vaccines/bovine/${bovineId}`);
    return response.data;
  },

  createVaccine: async (data: CreateVaccineRequest): Promise<Vaccine> => {
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('VaccineType', data.vaccineType);
    formData.append('VaccineDate', data.vaccineDate);
    formData.append('BovineId', data.bovineId.toString());
    
    if (data.fileData) {
      formData.append('FileData', data.fileData);
    }

    const response = await api.post('/vaccines', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getVaccineById: async (id: number): Promise<Vaccine> => {
    const response = await api.get(`/vaccines/${id}`);
    return response.data;
  },

  updateVaccine: async (id: number, data: CreateVaccineRequest): Promise<Vaccine> => {
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('VaccineType', data.vaccineType);
    formData.append('VaccineDate', data.vaccineDate);
    formData.append('BovineId', data.bovineId.toString());
    
    if (data.fileData) {
      formData.append('FileData', data.fileData);
    }

    const response = await api.put(`/vaccines/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteVaccine: async (id: number): Promise<void> => {
    const response = await api.delete(`/vaccines/${id}`);
    return response.data;
  },
};

// Servicios para Vacunaciones (específicos de VacApp) - Legacy support
export const vaccinationApi = {
  getAllVaccinations: async (): Promise<Vaccine[]> => {
    const response = await api.get('/vaccines');
    return response.data;
  },

  getVaccinationsByBovine: async (bovineId: number): Promise<Vaccine[]> => {
    const response = await api.get(`/vaccines/bovine/${bovineId}`);
    return response.data;
  },

  createVaccination: async (data: CreateVaccinationRequest): Promise<Vaccination> => {
    const response = await api.post('/vaccines', data);
    return response.data;
  },

  getVaccinationById: async (id: number): Promise<Vaccination> => {
    const response = await api.get(`/vaccines/${id}`);
    return response.data;
  },

  updateVaccination: async (id: number, data: Partial<CreateVaccinationRequest>): Promise<Vaccination> => {
    const response = await api.put(`/vaccines/${id}`, data);
    return response.data;
  },

  deleteVaccination: async (id: number): Promise<void> => {
    const response = await api.delete(`/vaccines/${id}`);
    return response.data;
  },

  getUpcomingVaccinations: async (): Promise<Vaccination[]> => {
    const response = await api.get('/vaccines/upcoming');
    return response.data;
  },

  markAsCompleted: async (id: number): Promise<Vaccination> => {
    const response = await api.patch(`/vaccines/${id}/complete`);
    return response.data;
  },
};

// (Removed voiceCommandApi - mantenido para compatibilidad)

export default api;