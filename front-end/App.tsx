import { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import SensorListScreen from './src/screens/SensorListScreen';
import SensorDetailScreen from './src/screens/SensorDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import { apiService } from './src/services/apiService';
import { NotificationProvider } from './src/context/NotificationContext';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const handleLogout = useCallback(() => {
    AsyncStorage.removeItem('authToken').catch(console.error);
    apiService.clearToken();
    setIsAuthenticated(false);
  }, []);

  const handleLoginSuccess = useCallback((token: string) => {
    AsyncStorage.setItem('authToken', token).catch(console.error);
    apiService.setToken(token);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    apiService.setUnauthorizedHandler(handleLogout);
  }, [handleLogout]);

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem('apiUrl');
        if (savedUrl) {
          apiService.setBaseURL(savedUrl);
        }

        const savedToken = await AsyncStorage.getItem('authToken');
        if (savedToken) {
          apiService.setToken(savedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading stored configuration:', error);
      } finally {
        setInitializing(false);
      }
    };

    loadAppState();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator
          key={isAuthenticated ? 'auth-stack' : 'guest-stack'}
          initialRouteName={isAuthenticated ? 'Dashboard' : 'Login'}
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
          {isAuthenticated ? (
            <>
              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Dashboard' }}
              />
              <Stack.Screen
                name="SensorList"
                component={SensorListScreen}
                options={{ title: 'Sensores IoT' }}
              />
              <Stack.Screen
                name="SensorDetail"
                options={{ title: 'Detalhes do Sensor' }}
              >
                {(props) => <SensorDetailScreen {...(props as any)} />}
              </Stack.Screen>
              <Stack.Screen
                name="Settings"
                options={{ title: 'Configurações' }}
              >
                {(props) => <SettingsScreen {...props} onLogout={handleLogout} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                options={{ headerShown: false }}
              >
                {(props) => (
                  <LoginScreen
                    {...props}
                    onLoginSuccess={handleLoginSuccess}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen
                name="Settings"
                options={{ title: 'Configurações' }}
              >
                {(props) => <SettingsScreen {...props} onLogout={handleLogout} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
}
