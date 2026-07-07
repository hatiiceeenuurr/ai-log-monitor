package com.teknokent.ailogmonitor.service.parser;

import com.teknokent.ailogmonitor.model.LogEntry;
import com.teknokent.ailogmonitor.model.Severity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LogParserService {

    public List<LogEntry> parseLogs(List<String> logs) {

        List<LogEntry> entries = new ArrayList<>();

        for (String log : logs) {

            Severity severity = detectSeverity(log);

            if (severity != null) {

                entries.add(new LogEntry(log, severity));

            }
        }

        return entries;
    }

    private Severity detectSeverity(String log) {

        if (log.contains("ERROR") || log.contains("Exception")) {
            return Severity.ERROR;
        }

        if (log.contains("WARN")) {
            return Severity.WARN;
        }

        if (log.contains("INFO")) {
            return Severity.INFO;
        }

        if (log.contains("DEBUG")) {
            return Severity.DEBUG;
        }

        if (log.contains("TRACE")) {
            return Severity.TRACE;
        }

        return null;
    }

}
