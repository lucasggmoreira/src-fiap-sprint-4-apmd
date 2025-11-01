import axios, { AxiosError, AxiosInstance, AxiosRequestHeaders } from 'axios';

export interface SensorReading {
  id: number;
  sensorId: string;
  value: number;
  timestamp: string;
}

export interface SensorReadingCreate {
  sensorId: string;
  value: number;
}

interface AuthResponse {
  token: string;
}

type UnauthorizedHandler = () => void;

class ApiService {
  private client: AxiosInstance;
  private rawBaseURL = 'http://localhost:8080/api';
  private rootURL = 'http://localhost:8080';
  private token: string | null = null;
  private unauthorizedHandler?: UnauthorizedHandler;

  constructor() {
    this.client = axios.create();
    this.configureInterceptors();
    this.setBaseURL(this.rawBaseURL);
  }
  
  setBaseURL(url: string) {
    const trimmed = url.replace(/\/$/, '');
    this.rawBaseURL = trimmed;
    this.rootURL = trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
  }

  getBaseURL(): string {
    return this.rawBaseURL;
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    this.unauthorizedHandler = handler;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  async getReadings(): Promise<SensorReading[]> {
    try {
      const response = await this.client.get<SensorReading[]>(this.apiUrl('/readings'));
      return response.data;
    } catch (error) {
      console.error('Error fetching readings:', error);
      throw error;
    }
  }

  async createReading(reading: SensorReadingCreate): Promise<SensorReading> {
    try {
      const response = await this.client.post<SensorReading>(this.apiUrl('/readings'), reading);
      return response.data;
    } catch (error) {
      console.error('Error creating reading:', error);
      throw error;
    }
  }

  async getReadingsBySensor(sensorId: string): Promise<SensorReading[]> {
    try {
      const response = await this.client.get<SensorReading[]>(this.apiUrl(`/readings/${sensorId}`));
      return response.data;
    } catch (error) {
      console.error('Error fetching sensor readings:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get(this.apiUrl('/readings'));
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(this.authUrl('/login'), {
      username,
      password,
    });
    return response.data;
  }

  async register(username: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(this.authUrl('/register'), {
      username,
      password,
    });
    return response.data;
  }

  private apiUrl(path: string) {
    return `${this.rootURL}/api${path}`;
  }

  private authUrl(path: string) {
    return `${this.rootURL}/auth${path}`;
  }

  private configureInterceptors() {
    this.client.interceptors.request.use((config) => {
      const headers = (config.headers ?? {}) as Record<string, string>;

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      } else {
        delete headers.Authorization;
      }

      config.headers = headers as AxiosRequestHeaders;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401) {
            this.clearToken();
            if (this.unauthorizedHandler) {
              this.unauthorizedHandler();
            }
          }
        }
        return Promise.reject(error as AxiosError);
      }
    );
  }
}

export const apiService = new ApiService();