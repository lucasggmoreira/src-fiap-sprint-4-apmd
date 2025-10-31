CREATE TABLE reading (
         id BIGINT AUTO_INCREMENT PRIMARY KEY,
         sensor_id VARCHAR(255) NOT NULL,
         "value" DOUBLE PRECISION NOT NULL,
         timestamp TIMESTAMP NOT NULL
);