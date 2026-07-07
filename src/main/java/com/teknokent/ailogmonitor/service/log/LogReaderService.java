package com.teknokent.ailogmonitor.service.log;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class LogReaderService {

    private final Path logFile;

    private int lastReadLine = 0;

    public LogReaderService() throws IOException {
        this.logFile = new ClassPathResource("logs/application.log")
                .getFile()
                .toPath();
    }

    public List<String> readLogs() throws IOException {

        List<String> allLines = Files.readAllLines(logFile);

        if (lastReadLine >= allLines.size()) {
            return List.of();
        }

        List<String> newLogs = allLines.subList(lastReadLine, allLines.size());

        lastReadLine = allLines.size();

        return newLogs;
    }
}

