package com.teknokent.ailogmonitor.service.log;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Collections;
import java.util.List;

@Service
public class LogReaderService {

    private static final Logger log = LoggerFactory.getLogger(LogReaderService.class);

    @Value("${log.file.path}")
    private String logFilePath;

    public List<String> readLogs() throws IOException {
        Path path = Path.of(logFilePath);
        if (!Files.exists(path)) {
            return Collections.emptyList();
        }
        return Files.readAllLines(path);
    }

    public synchronized List<String> readAndClearLogs() throws IOException {
        Path path = Path.of(logFilePath);
        if (!Files.exists(path)) {
            return Collections.emptyList();
        }

        List<String> lines = Files.readAllLines(path);
        if (!lines.isEmpty()) {
            Files.write(path, new byte[0], StandardOpenOption.TRUNCATE_EXISTING);
            log.info("Read {} log lines and cleared {}", lines.size(), logFilePath);
        }
        return lines;
    }
}
