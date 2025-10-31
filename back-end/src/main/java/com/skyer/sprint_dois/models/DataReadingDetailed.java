package com.skyer.sprint_dois.models;

import java.time.LocalDateTime;

public record DataReadingDetailed(
        Long id,
        String sensorId,
        Double value,
        LocalDateTime timestamp
) {
    public DataReadingDetailed(Reading data) {
        this(
                data.getId(),
                data.getSensorId(),
                data.getValue(),
                data.getTimestamp()
        );
    }
}
