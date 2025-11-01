# Sistema IoT Sensor Monitor

Aplicação full-stack composta por um backend Spring Boot com autenticação JWT e um app mobile (React Native/Expo) para visualização de leituras de sensores IoT.

## Integrantes

- **Caio Caram de Souza** - RM: 552248
- **Isabella Ventura Diaz** - RM: 551793
- **Lucas Gabriel Gianini Moreira** - RM: 99921
- **Maria Eduarda de Carvalho Goda** - RM: 552276
- **Maria Eloisa da Silva Santos** - RM: 552294

## Requisitos

- Java 21 (ou superior compatível) e Maven 3.9+ (há wrapper `./mvnw`)
- MySQL 8.0+ (Testado com MySQL 8.4 / 9.0)
- Node.js 18+ e npm 10+
- Expo CLI (`npm install -g expo-cli`) para rodar no dispositivo/emulador
- Android Studio ou Xcode (opcional) para emuladores móveis

## Banco de Dados (MySQL)

1. Suba uma instância MySQL local. Exemplo usando Docker:
   ```bash
   docker run --name mysql-iot -e MYSQL_ROOT_PASSWORD=root -e MYSQL_USER=admin -e MYSQL_PASSWORD=root -p 3306:3306 -d mysql:8
   ```
2. Confirme que o usuário `admin` possui a database (Flyway cria automaticamente):
   ```sql
   CREATE DATABASE IF NOT EXISTS api_readings;
   GRANT ALL PRIVILEGES ON api_readings.* TO 'admin'@'%';
   FLUSH PRIVILEGES;
   ```
3. Ajuste credenciais se necessário no pom.xml do backend.

## Backend (Spring Boot)

1. Configure o segredo JWT (opcional, usa valor padrão de desenvolvimento):
   ```bash
   export SECURITY_JWT_SECRET="uma-string-segura-aqui"
   export SECURITY_JWT_EXPIRATION=3600000   # opcional: validade em ms
   ```
2. Execute o serviço (na raiz do projeto):
   ```bash
   cd back-end
   ./mvnw spring-boot:run
   ```
3. O backend sobe em `http://localhost:8080` com rotas sob `/api`.
4. Principais endpoints:
   - `POST /api/auth/register` – cria usuário (campo `username` + `password`)
   - `POST /api/auth/login` – retorna `{ token }`
   - `GET /api/readings` – lista leituras (requer header `Authorization: Bearer <token>`)
   - `POST /api/readings` – cadastra leitura

### Fluxo rápido via cURL

Registrar usuário:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'
```

Obter token:
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}' | jq -r '.token')
```

Cadastrar leitura autenticada:
```bash
curl -X POST http://localhost:8080/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sensorId": "TEMP001", "value": 25.5}'
```

## Frontend (React Native / Expo)

1. Instale dependências:
   ```bash
   cd front-end
   npm install
   ```
2. Inicie o bundler do Expo:
   ```bash
   npm start
   # ou expo start
   ```
3. Abra o app no dispositivo/emulador (Expo Go ou build nativo) e configure a URL da API em **Configurações**:
   - Emulador Android: `http://10.0.2.2:8080/api`
   - iOS Simulator: `http://localhost:8080/api`
   - Dispositivo físico: `http://SEU_IP_LOCAL:8080/api`
4. Acesse a tela de login, utilize um usuário existente ou faça cadastro para receber o token. Todas as requisições autenticadas usam esse token automaticamente.

## Fluxo completo de execução

1. Inicie o MySQL e garanta credenciais válidas.
2. Rode o backend (`./mvnw spring-boot:run`). Flyway aplicará as migrations necessárias.
3. Rode o frontend (`npm start`) e abra no dispositivo desejado.
4. Cadastre/efetue login pelo app (ou via cURL) e navegue entre Dashboard, lista e detalhes de sensores.