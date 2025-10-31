import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SensorListScreen from './src/screens/SensorListScreen';
import SensorDetailScreen from './src/screens/SensorDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { apiService } from './src/services/apiService';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Carregar configurações salvas na inicialização
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('apiUrl');
      if (savedUrl) {
        apiService.setBaseURL(savedUrl);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SensorList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="SensorList" 
          component={SensorListScreen}
          options={{ title: 'Sensores IoT' }}
        />
        <Stack.Screen 
          name="SensorDetail" 
          component={SensorDetailScreen}
          options={{ title: 'Detalhes do Sensor' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Configurações' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
