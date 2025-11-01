# Frontend - React Native / Expo

Aplicativo mobile que consome o backend IoT e oferece dashboard, listagem e detalhes de sensores com autenticação JWT.

## Integrantes

- **Caio Caram de Souza** - RM: 552248
- **Isabella Ventura Diaz** - RM: 551793
- **Lucas Gabriel Gianini Moreira** - RM: 99921
- **Maria Eduarda de Carvalho Goda** - RM: 552276
- **Maria Eloisa da Silva Santos** - RM: 552294

## Tecnologias e Arquitetura

- React Native 0.79 com Expo SDK 53
- React Navigation (stack navigator)
- Axios com interceptores JWT (`apiService`)
- AsyncStorage para persistência de token e URL da API
- `NotificationContext` para toasts globais de sucesso/erro
- `react-native-chart-kit` para gráficos

### Estrutura principal

- `App.tsx`: inicialização, controle de autenticação e rotas
- `src/screens/`: Login, Dashboard, SensorList, SensorDetail, Settings
- `src/services/apiService.ts`: cliente Axios com interceptores
- `src/context/NotificationContext.tsx`: provider de notificações visuais
- `src/hooks/useSensorDashboard.ts`: agregações de leituras para dashboard

## Requisitos

- Node.js 18+
- npm 10+ ou Yarn
- Expo CLI (`npm install -g expo-cli`)
- Backend rodando em `http://<host>:8080/api`

## Setup

1. Instale dependências:
   ```bash
   cd front-end
   npm install
   ```
2. Inicie o bundler Expo:
   ```bash
   npm start
   ```
3. Abra o app no Expo Go ou emulador.
4. Acesse **Configurações** dentro do app e configure a URL da API conforme o ambiente:
   - Emulador Android: `http://10.0.2.2:8080/api`
   - iOS Simulator: `http://localhost:8080/api`
   - Dispositivo físico: `http://SEU_IP_LOCAL:8080/api`

## Fluxos principais

- **Login/Cadastro**: chama `/api/auth/login` ou `/api/auth/register`; token é salvo e usado automaticamente.
- **Dashboard**: exibe cards ou gráficos com estatísticas das leituras.
- **Lista de Sensores**: mostra últimas leituras e acessa detalhes.
- **Detalhe do Sensor**: histórico, gráfico e opção de registrar leitura mock.
- **Configurações**: alteração da base URL e teste de conectividade.

## Scripts úteis

- `npm start`: inicia Metro bundler do Expo
- `npm run android`: build/rodar projeto em dispositivo Android
- `npm run ios`: build/rodar no simulador iOS
- `npm run web`: rodar versão web via Expo

## Boas práticas

- Sempre iniciar o backend antes de abrir o app para evitar erros de conexão.
- Utilizar a tela de Configurações para validar a URL da API e teste de conexão.
- Em caso de problemas de login, conferir se o token foi armazenado em `AsyncStorage` (chave `authToken`).