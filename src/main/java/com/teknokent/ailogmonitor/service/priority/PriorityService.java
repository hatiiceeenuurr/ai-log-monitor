package com.teknokent.ailogmonitor.service.priority;

import com.teknokent.ailogmonitor.priority.Priority;
import org.springframework.stereotype.Service;

@Service
public class PriorityService {

    public Priority determinePriority(String severity,
                                      String problem,
                                      String logContent) {

        String text =
                (problem + " " + logContent).toLowerCase();

        // CRITICAL
        if (text.contains("outofmemory")
                || text.contains("database connection lost")
                || text.contains("database connection timeout")
                || text.contains("disk full")
                || text.contains("service unavailable")
                || text.contains("unable to connect")) {

            return Priority.CRITICAL;
        }

        // HIGH
        if ("ERROR".equalsIgnoreCase(severity)) {
            return Priority.HIGH;
        }

        // MEDIUM
        if ("WARN".equalsIgnoreCase(severity)) {
            return Priority.MEDIUM;
        }

        // LOW
        return Priority.LOW;
    }
}
