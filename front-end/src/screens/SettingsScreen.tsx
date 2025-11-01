import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

interface SettingsScreenProps {
  onLogout: () => Promise<void> | void;
  navigation?: any;
  route?: any;
}

const SettingsScreen = ({ onLogout }: SettingsScreenProps) => {
  const [apiUrl, setApiUrl] = useState(apiService.getBaseURL() || 'http://localhost:8080/api');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    loadApiUrl();
  }, []);

  const loadApiUrl = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('apiUrl');
      const urlToUse = savedUrl || apiService.getBaseURL();
      if (urlToUse) {
        setApiUrl(urlToUse);
        apiService.setBaseURL(urlToUse);
      }
    } catch (error) {
      console.error('Error loading API URL:', error);
    }
  };

  const saveApiUrl = async () => {
    try {
      await AsyncStorage.setItem('apiUrl', apiUrl);
      apiService.setBaseURL(apiUrl);
      Alert.alert('Sucesso', 'URL da API salva com sucesso!');
    } catch (error) {
      console.error('Error saving API URL:', error);
      Alert.alert('Erro', 'Falha ao salvar URL da API');
    }
  };

  const testConnection = async () => {
    if (!apiService.getToken()) {
      Alert.alert('Autenticação necessária', 'Realize login antes de testar a conexão.');
      return;
    }
    setIsTestingConnection(true);
    try {
      const isConnected = await apiService.testConnection();
      if (isConnected) {
        Alert.alert('Sucesso', 'Conexão com a API estabelecida com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível conectar com a API. Verifique a URL e se o backend está rodando.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao testar conexão com a API');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja encerrar a sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            onLogout();
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Configurações da API</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>URL da API:</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://localhost:8080/api"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <Text style={styles.help}>
          Para emulador Android: http://10.0.2.2:8080/api{'\n'}
          Para dispositivo físico: http://SEU_IP:8080/api{'\n'}
          Para iOS Simulator: http://localhost:8080/api
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveApiUrl}
        >
          <Text style={styles.saveButtonText}>Salvar URL</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, { opacity: isTestingConnection ? 0.6 : 1 }]} 
          onPress={testConnection}
          disabled={isTestingConnection}
        >
          <Text style={styles.testButtonText}>
            {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Informações:</Text>
        <Text style={styles.infoText}>
          • Certifique-se de que o backend Spring Boot está rodando{'\n'}
          • Verifique se a URL está correta para seu ambiente{'\n'}
          • Para dispositivos físicos, use o IP da sua máquina
        </Text>
      </View>
    </ScrollView>
  );

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 16,
  },
  help: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    lineHeight: 16,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;