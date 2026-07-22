package com.teknokent.ailogmonitor.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "logAnalysisExecutor")
    public Executor logAnalysisExecutor() {
        // Java 21 Virtual Threads Executor for high concurrency & non-blocking IO
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
