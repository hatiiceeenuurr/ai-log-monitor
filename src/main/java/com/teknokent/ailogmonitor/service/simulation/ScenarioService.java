package com.teknokent.ailogmonitor.service.simulation;

import com.teknokent.ailogmonitor.model.LogScenario;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class ScenarioService {

    private final Random random = new Random();

    private final List<LogScenario> scenarios = List.of(

            new LogScenario(
                    "Database Failure",
                    List.of(
                            "INFO Connection pool initialized",
                            "WARN Slow query detected",
                            "ERROR Database connection timeout",
                            "ERROR Database unavailable"
                    )
            ),

            new LogScenario(
                    "Redis Failure",
                    List.of(
                            "INFO Redis initialized",
                            "WARN Redis latency increased",
                            "ERROR Redis connection lost"
                    )
            ),

            new LogScenario(
                    "Memory Leak",
                    List.of(
                            "INFO JVM Started",
                            "WARN Heap usage reached 90%",
                            "ERROR OutOfMemoryError"
                    )
            )

    );

    public LogScenario getRandomScenario() {

        return scenarios.get(
                random.nextInt(scenarios.size())
        );

    }

}
