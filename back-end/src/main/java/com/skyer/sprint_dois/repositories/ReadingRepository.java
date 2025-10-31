package com.skyer.sprint_dois.repositories;

import com.skyer.sprint_dois.models.Reading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReadingRepository extends JpaRepository<Reading, Long> {

    List<Reading> findAllBySensorId(String sensorId);
}
