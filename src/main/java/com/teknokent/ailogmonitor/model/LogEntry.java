package com.teknokent.ailogmonitor.model;

/*log deneme commit*/
public class LogEntry {

    private final String content;
    private final Severity severity;

    public LogEntry(String content, Severity severity) {
        this.content = content;
        this.severity = severity;
    }

    public String getContent() {
        return content;
    }

    public Severity getSeverity() {
        return severity;
    }
}
