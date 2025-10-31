# Frontend - React Native

## Integrantes

- **Caio Caram de Souza** - RM: 552248
- **Isabella Ventura Diaz** - RM: 551793
- **Lucas Gabriel Gianini Moreira** - RM: 99921
- **Maria Eduarda de Carvalho Goda** - RM: 552276
- **Maria Eloisa da Silva Santos** - RM: 552294

## Instruções para Execução

### Backend e Frontend em Conjunto

1. **Iniciar o Backend:**
```bash
cd back-end
./mvnw spring-boot:run
```

2. **Iniciar o Frontend:**
```bash
cd front-end
npm install
npm start
```

3. **Configurar no App:**
- Abrir o app
- Ir em Configurações
- Definir URL da API:
  - Emulador Android: `http://10.0.2.2:8080/api`
  - iOS Simulator: `http://localhost:8080/api`
  - Dispositivo físico: `http://[SEU_IP]:8080/api`

## Exemplos de Chamadas de API

### GET /api/readings
```json
[
  {
    "id": 1,
    "sensorId": "TEMP001",
    "value": 23.5,
    "timestamp": "2024-12-28T10:30:00"
  }
]
```

### POST /api/readings
```json
{
  "sensorId": "TEMP001",
  "value": 25.0
}
```

### GET /api/readings/TEMP001
```json
[
  {
    "id": 1,
    "sensorId": "TEMP001",
    "value": 23.5,
    "timestamp": "2024-12-28T10:30:00"
  }
]
```

## Prints das Telas

### Tela de Lista de Sensores

![alt](../assets/foto-sensores.png)

### Tela de Detalhes

![alt](../assets/foto-sensor-dados.png)

### Tela de Configurações

![alt](../assets/foto-configuracoes.png)