package com.teknokent.ailogmonitor.service.log;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class LogReaderService {

    @Value("${log.file.path}")
    private String logFilePath;

    public List<String> readLogs() throws IOException {

        return Files.readAllLines(
                Path.of(logFilePath)
        );

    }

}

