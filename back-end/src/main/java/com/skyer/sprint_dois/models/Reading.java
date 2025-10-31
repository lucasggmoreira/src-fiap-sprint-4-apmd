package com.skyer.sprint_dois.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Reading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String sensorId;
    @Column(name = "\"value\"")
    Double value;
    LocalDateTime timestamp;

    public Reading(DataReadingSave readingDTO) {
        this.sensorId = readingDTO.sensorId();
        this.value = readingDTO.value();
        if (readingDTO.timestamp() != null) {
            this.timestamp = readingDTO.timestamp();
        } else {
            this.timestamp = LocalDateTime.now();
        }
    }
}
