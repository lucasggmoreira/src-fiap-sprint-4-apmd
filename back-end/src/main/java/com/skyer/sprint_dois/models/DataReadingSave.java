package com.skyer.sprint_dois.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.NumberFormat;

import java.time.LocalDateTime;

public record DataReadingSave(
        @NotBlank
        String sensorId,
        double value,
        LocalDateTime timestamp
) {
}
