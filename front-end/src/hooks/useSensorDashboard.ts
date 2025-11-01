import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { apiService, SensorReading } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';

export interface SensorSummary {
  sensorId: string;
  readings: SensorReading[];
  latest?: SensorReading;
  average?: number;
  min?: number;
  max?: number;
}

export interface DashboardState {
  summaries: SensorSummary[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
}

const computeSummary = (readings: SensorReading[]): Omit<SensorSummary, 'sensorId' | 'readings'> => {
  if (!readings.length) {
    return {};
  }

  const sorted = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const values = sorted.map((reading) => reading.value ?? 0);
  const latest = sorted[sorted.length - 1];
  const average = values.reduce((acc, value) => acc + value, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { latest, average, min, max };
};

export const useSensorDashboard = (): DashboardState => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const { notifyError } = useNotification();

  const fetchReadings = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await apiService.getReadings();
      setReadings(data);
    } catch (fetchError) {
      console.error('Error fetching readings for dashboard:', fetchError);
      let message = 'Não foi possível carregar os dados dos sensores.';
      if (axios.isAxiosError(fetchError)) {
        if (fetchError.response?.status === 401) {
          message = 'Sessão expirada. Faça login novamente.';
        } else if (!fetchError.response) {
          message = 'Falha de conexão com a API. Verifique a URL e tente novamente.';
        }
      }
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings().catch(console.error);
  }, []);

  const summaries = useMemo(() => {
    const grouped = readings.reduce<Record<string, SensorReading[]>>((acc, reading) => {
      if (!acc[reading.sensorId]) {
        acc[reading.sensorId] = [];
      }
      acc[reading.sensorId].push(reading);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([sensorId, sensorReadings]) => {
        const orderedReadings = [...sensorReadings].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const summaryDetails = computeSummary(orderedReadings);
        return {
          sensorId,
          readings: orderedReadings,
          ...summaryDetails,
        };
      })
      .sort((a, b) => a.sensorId.localeCompare(b.sensorId));
  }, [readings]);

  return {
    summaries,
    loading,
    error,
    refresh: fetchReadings,
  };
};
