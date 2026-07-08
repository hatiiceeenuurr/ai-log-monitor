package com.teknokent.ailogmonitor.service.simulation;

import com.teknokent.ailogmonitor.model.LogScenario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;

@Service
public class LogSimulationService {

    private final ScenarioService scenarioService;

    @Value("${log.file.path}")
    private String logFilePath;

    public LogSimulationService(ScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    @Scheduled(fixedRateString = "${simulation.interval}")
    public void generateLogs() throws IOException {

        LogScenario scenario = scenarioService.getRandomScenario();

        for (String message : scenario.logs()) {

            String log = "%s %s%n".formatted(
                    LocalDateTime.now(),
                    message
            );

            Files.writeString(
                    Path.of(logFilePath),
                    log,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            );

        }

        System.out.println("Generated Scenario -> " + scenario.name());

    }
}
