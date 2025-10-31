package com.skyer.sprint_dois.services;

import com.skyer.sprint_dois.infra.exceptions.NotFoundException;
import com.skyer.sprint_dois.models.DataReadingDetailed;
import com.skyer.sprint_dois.models.DataReadingSave;
import com.skyer.sprint_dois.models.Reading;
import com.skyer.sprint_dois.repositories.ReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReadingService {

    @Autowired
    private ReadingRepository readingRepository;


    public DataReadingDetailed saveReading(DataReadingSave readingDTO) {
        var data = readingRepository.save(new Reading(readingDTO));
        return new DataReadingDetailed(data);
    }

    public List<DataReadingDetailed> getAllReadings() {
        var data = readingRepository.findAll();
        return data.stream()
                .map(DataReadingDetailed::new)
                .toList();
    }

    public List<DataReadingDetailed> getReadingsBySensorId(String sensorId) {
        var data = readingRepository.findAllBySensorId(sensorId);
        if (data.isEmpty()) {
            throw new NotFoundException("No readings found for sensor ID: " + sensorId);
        }
        return data.stream()
                .map(DataReadingDetailed::new)
                .toList();
    }
}
