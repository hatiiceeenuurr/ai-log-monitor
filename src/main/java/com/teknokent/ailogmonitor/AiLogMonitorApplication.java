package com.teknokent.ailogmonitor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AiLogMonitorApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiLogMonitorApplication.class, args);
    }

}