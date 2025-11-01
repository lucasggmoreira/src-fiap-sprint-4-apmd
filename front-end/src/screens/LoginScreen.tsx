import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { apiService } from '../services/apiService';

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess: (token: string) => Promise<void> | void;
}

const LoginScreen = (props: LoginScreenProps) => {
  const { navigation, onLoginSuccess } = props;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setFeedback({ message: 'Informe usuário e senha.', tone: 'error' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const action = mode === 'login' ? apiService.login : apiService.register;
      const { token } = await action.call(apiService, username.trim(), password.trim());
      apiService.setToken(token);
      await onLoginSuccess(token);
      if (mode === 'register') {
        setFeedback({ message: 'Cadastro realizado com sucesso!', tone: 'success' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      let message = mode === 'login'
        ? 'Não foi possível realizar o login. Verifique as credenciais ou a URL da API.'
        : 'Não foi possível realizar o cadastro. Tente novamente.';

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const backendMessage = (error.response?.data as { message?: string } | undefined)?.message;

        if (backendMessage) {
          message = backendMessage;
        } else if (status === 401) {
          message = 'Usuário ou senha inválidos.';
        } else if (status === 409) {
          message = 'Nome de usuário já está sendo utilizado.';
        } else if (status === 400) {
          message = 'Dados inválidos. Verifique os campos e tente novamente.';
        } else if (!error.response) {
          message = 'Não foi possível conectar ao backend. Verifique a URL e se o serviço está disponível.';
        }
      }

      setFeedback({ message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFeedback(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Skyer IoT</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' ? 'Entre com sua conta' : 'Cadastre-se para começar'}
          </Text>

          {feedback && (
            <View style={[styles.feedbackBox, feedback.tone === 'error' ? styles.feedbackError : styles.feedbackSuccess]}>
              <Text style={styles.feedbackText}>{feedback.message}</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Usuário</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Digite seu usuário"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Entrar' : 'Cadastrar'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={switchMode}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {mode === 'login'
                ? 'Não possui conta? Cadastre-se'
                : 'Já possui conta? Faça login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsButtonText}>Precisa ajustar a URL da API?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  switchText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: '600',
  },
  settingsButton: {
    marginTop: 24,
  },
  settingsButtonText: {
    textAlign: 'center',
    color: '#666',
    textDecorationLine: 'underline',
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackError: {
    backgroundColor: '#FDECEA',
    borderWidth: 1,
    borderColor: '#F5C2C0',
  },
  feedbackSuccess: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#A8D5BA',
  },
  feedbackText: {
    color: '#333',
    textAlign: 'center',
  },
});

export default LoginScreen;
