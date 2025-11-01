import { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl,
  Alert
} from 'react-native';
import axios from 'axios';
import { apiService, SensorReading } from '../services/apiService';

interface SensorListScreenProps {
  navigation: any;
}

interface SensorGroup {
  sensorId: string;
  latestReading: SensorReading;
  readingsCount: number;
}

const SensorListScreen = ({ navigation }: SensorListScreenProps) => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReadings();
  }, []);
  
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.dashboardButton} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchReadings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getReadings();
      setReadings(data);
    } catch (error) {
      console.error('Error fetching readings:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Alert.alert('Sessão expirada', 'Faça login novamente.');
        return;
      }
      Alert.alert(
        'Erro de Conexão', 
        'Não foi possível carregar os dados. Verifique as configurações da API.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Configurações', onPress: () => navigation.navigate('Settings') }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReadings();
    setRefreshing(false);
  }, [fetchReadings]);

  const groupedSensors = readings.reduce((acc, reading) => {
    if (!acc[reading.sensorId]) {
      acc[reading.sensorId] = [];
    }
    acc[reading.sensorId].push(reading);
    return acc;
  }, {} as Record<string, SensorReading[]>);

  const sensorList: SensorGroup[] = Object.keys(groupedSensors).map(sensorId => {
    const sensorReadings = groupedSensors[sensorId];
    const latestReading = sensorReadings.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return {
      sensorId,
      latestReading,
      readingsCount: sensorReadings.length
    };
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const renderSensorItem = ({ item }: { item: SensorGroup }) => (
    <TouchableOpacity
      style={styles.sensorItem}
      onPress={() => navigation.navigate('SensorDetail', { sensorId: item.sensorId })}
    >
      <View style={styles.sensorHeader}>
        <Text style={styles.sensorId}>Sensor: {item.sensorId}</Text>
        <Text style={styles.sensorCount}>{item.readingsCount} leituras</Text>
      </View>
      
      <Text style={styles.sensorValue}>
        {item.latestReading.value?.toFixed(2) || 'N/A'}
      </Text>
      
      <Text style={styles.sensorTimestamp}>
        Última leitura: {formatTimestamp(item.latestReading.timestamp)}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Nenhum sensor encontrado</Text>
      <Text style={styles.emptyText}>
        Verifique se o backend está rodando e se há dados cadastrados.
      </Text>
      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.settingsButtonText}>Configurações da API</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando sensores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensores Conectados</Text>
        <TouchableOpacity 
          style={styles.settingsIconButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sensorList}
        renderItem={renderSensorItem}
        keyExtractor={(item) => item.sensorId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={sensorList.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsIconButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  dashboardButton: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dashboardButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  sensorItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sensorCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sensorValue: {
    fontSize: 32,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sensorTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SensorListScreen;