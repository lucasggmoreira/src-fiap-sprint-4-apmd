# Backend - Spring Boot

Backend RESTful responsável por autenticação JWT, persistência das leituras de sensores e exposição das APIs consumidas pelo app mobile.

## Integrantes

- **Caio Caram de Souza** - RM: 552248
- **Isabella Ventura Diaz** - RM: 551793
- **Lucas Gabriel Gianini Moreira** - RM: 99921
- **Maria Eduarda de Carvalho Goda** - RM: 552276
- **Maria Eloisa da Silva Santos** - RM: 552294

## Tecnologias e Arquitetura

- Spring Boot 3.5 (Web, Security, Data JPA, Validation)
- MySQL 8/9 com migrations Flyway
- JWT via biblioteca JJWT 0.11.5
- Lombok para reduzir boilerplate

### Estrutura de pacotes

- `controllers`: `AuthController`, `ReadingController`
- `services`: `AuthService`, `JwtService`, `ReadingService`
- `models`: entidades `User`, `Reading` e DTOs
- `config`: `SecurityConfig`, `JwtAuthenticationFilter`

## Requisitos

- Java 21
- Maven 3.9+ (wrapper `./mvnw` incluído)
- MySQL acessível em `jdbc:mysql://localhost:3306/api_readings`

## Configuração do Banco

1. Suba o MySQL (exemplo Docker):
   ```bash
   docker run --name mysql-iot -e MYSQL_ROOT_PASSWORD=root -e MYSQL_USER=admin -e MYSQL_PASSWORD=root -p 3306:3306 -d mysql:8
   ```
2. Garanta privilégios:
   ```sql
   CREATE DATABASE IF NOT EXISTS api_readings;
   GRANT ALL PRIVILEGES ON api_readings.* TO 'admin'@'%';
   FLUSH PRIVILEGES;
   ```

## Execução

```bash
cd back-end
./mvnw spring-boot:run
```

O servidor fica acessível em `http://localhost:8080` com rotas sob `/api`.

## Endpoints Principais

- `POST /api/auth/register` – cadastro de usuários
- `POST /api/auth/login` – login e emissão de JWT
- `GET /api/readings` – lista leituras (requer JWT)
- `POST /api/readings` – cria leitura (requer JWT)

### Exemplo rápido de uso

```bash
# Registrar usuário
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'

# Obter token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}' | jq -r '.token')

# Criar leitura autenticada
curl -X POST http://localhost:8080/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sensorId": "TEMP001", "value": 25.5}'
```

## Testes e Verificação

- Execução de testes automatizados (quando adicionados):
  ```bash
  ./mvnw test
  ```