import { useState, useEffect, useCallback } from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import { apiService, SensorReading, SensorReadingCreate } from '../services/apiService';
import { useNotification } from '../context/NotificationContext';

interface SensorDetailScreenProps {
  route: {
    params: {
      sensorId: string;
    };
  };
  navigation: any;
}

const SensorDetailScreen = ({ route, navigation }: SensorDetailScreenProps) => {
  const { sensorId } = route.params;
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingReading, setAddingReading] = useState(false);
  const { notifyError, notifySuccess } = useNotification();

  useEffect(() => {
    navigation.setOptions({
      title: `Sensor ${sensorId}`,
    });
    fetchSensorReadings();
  }, [sensorId, navigation]);

  const fetchSensorReadings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getReadingsBySensor(sensorId);
      setReadings(data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    } catch (error) {
      console.error('Error fetching sensor readings:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        notifyError('Sessão expirada. Faça login novamente.');
        Alert.alert('Sessão expirada', 'Faça login novamente.');
        return;
      }
      notifyError('Não foi possível carregar os dados do sensor.');
      Alert.alert('Erro', 'Não foi possível carregar os dados do sensor');
    } finally {
      setLoading(false);
    }
  }, [sensorId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSensorReadings();
    setRefreshing(false);
  }, [fetchSensorReadings]);

  const addMockReading = useCallback(async () => {
    setAddingReading(true);
    try {
      // Gerar valor mock baseado no último valor ou um valor aleatório
      const lastValue = readings.length > 0 ? readings[readings.length - 1].value : 20;
      const mockValue = lastValue + (Math.random() - 0.5) * 10; // Variação de ±5
      
      const newReading: SensorReadingCreate = {
        sensorId: sensorId,
        value: Math.max(0, mockValue), // Garantir valor positivo
      };

      await apiService.createReading(newReading);
      notifySuccess('Nova leitura adicionada com sucesso!');
      Alert.alert('Sucesso', 'Nova leitura adicionada com sucesso!');
      await fetchSensorReadings(); // Recarregar dados
    } catch (error) {
      console.error('Error adding reading:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        notifyError('Sessão expirada. Faça login novamente.');
        Alert.alert('Sessão expirada', 'Faça login novamente.');
        return;
      }
      notifyError('Não foi possível adicionar nova leitura.');
      Alert.alert('Erro', 'Não foi possível adicionar nova leitura');
    } finally {
      setAddingReading(false);
    }
  }, [sensorId, readings, fetchSensorReadings]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const getChartData = () => {
    if (readings.length === 0) {
      return {
        labels: ['Sem dados'],
        datasets: [{
          data: [0],
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2
        }]
      };
    }

    // Pegar no máximo 10 pontos mais recentes para não sobrecarregar o gráfico
    const recentReadings = readings.slice(-10);
    
    return {
      labels: recentReadings.map((reading, index) => {
        if (recentReadings.length > 5) {
          // Mostrar apenas alguns labels se houver muitos pontos
          return index % 2 === 0 ? new Date(reading.timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '';
        }
        return new Date(reading.timestamp).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }),
      datasets: [{
        data: recentReadings.map(reading => reading.value),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const screenWidth = Dimensions.get('window').width;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando dados do sensor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Informações atuais */}
      <View style={styles.currentValueCard}>
        <Text style={styles.sensorIdText}>Sensor {sensorId}</Text>
        <Text style={styles.currentValue}>
          {latestReading ? latestReading.value.toFixed(2) : 'N/A'}
        </Text>
        <Text style={styles.lastUpdate}>
          {latestReading ? `Última atualização: ${formatTimestamp(latestReading.timestamp)}` : 'Nenhum dado disponível'}
        </Text>
        <Text style={styles.totalReadings}>
          Total de leituras: {readings.length}
        </Text>
      </View>

      {/* Gráfico */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Histórico de Leituras</Text>
        {readings.length > 0 ? (
          <LineChart
            data={getChartData()}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#007AFF'
              }
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Nenhum dado disponível para exibir no gráfico</Text>
          </View>
        )}
      </View>

      {/* Botões de ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.refreshButton]}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.buttonText}>
            {refreshing ? 'Atualizando...' : '🔄 Atualizar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.addButton]}
          onPress={addMockReading}
          disabled={addingReading}
        >
          <Text style={styles.buttonText}>
            {addingReading ? 'Adicionando...' : '➕ Registrar Leitura'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de leituras recentes */}
      {readings.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Leituras Recentes</Text>
          {readings.slice(-5).reverse().map((reading, index) => (
            <View key={reading.id} style={styles.historyItem}>
              <Text style={styles.historyValue}>{reading.value.toFixed(2)}</Text>
              <Text style={styles.historyTimestamp}>{formatTimestamp(reading.timestamp)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  currentValueCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sensorIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  currentValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  lastUpdate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalReadings: {
    fontSize: 12,
    color: '#999',
  },
  chartCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  refreshButton: {
    backgroundColor: '#34C759',
  },
  addButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  historyTimestamp: {
    fontSize: 14,
    color: '#666',
  },
});

export default SensorDetailScreen;