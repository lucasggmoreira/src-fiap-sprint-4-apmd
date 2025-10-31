import axios from 'axios';

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

class ApiService {
  private baseURL: string = 'http://localhost:8080/api'; // Para emulador Android
  
  setBaseURL(url: string) {
    this.baseURL = url;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  async getReadings(): Promise<SensorReading[]> {
    try {
      const response = await axios.get(`${this.baseURL}/readings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching readings:', error);
      throw error;
    }
  }

  async createReading(reading: SensorReadingCreate): Promise<SensorReading> {
    try {
      const response = await axios.post(`${this.baseURL}/readings`, reading);
      return response.data;
    } catch (error) {
      console.error('Error creating reading:', error);
      throw error;
    }
  }

  async getReadingsBySensor(sensorId: string): Promise<SensorReading[]> {
    try {
      const response = await axios.get(`${this.baseURL}/readings/${sensorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sensor readings:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/readings`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService();