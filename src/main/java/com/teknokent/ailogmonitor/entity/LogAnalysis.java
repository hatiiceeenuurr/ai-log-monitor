package com.teknokent.ailogmonitor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.teknokent.ailogmonitor.priority.Priority;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "log_analysis", indexes = {
        @Index(name = "idx_normalized_hash", columnList = "normalized_hash")
})
public class LogAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String logContent;

    @Column(nullable = false)
    private String severity;

    @Column(columnDefinition = "TEXT")
    private String problem;

    @Column(columnDefinition = "TEXT")
    private String cause;

    @Column(columnDefinition = "TEXT")
    private String solution;

    @Column(columnDefinition = "TEXT")
    private String normalizedMessage;

    @Column(name = "normalized_hash", length = 64)
    private String normalizedHash;

    @Column(name = "occurrence_count")
    private Integer occurrenceCount = 1;

    private LocalDateTime analyzedAt;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id")
    @JsonIgnore
    private Scan scan;

    @Enumerated(EnumType.STRING)
    @Column
    private Priority priority;

    public LogAnalysis() {
    }

    public Long getId() {
        return id;
    }

    public String getLogContent() {
        return logContent;
    }

    public void setLogContent(String logContent) {
        this.logContent = logContent;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getProblem() {
        return problem;
    }

    public void setProblem(String problem) {
        this.problem = problem;
    }

    public String getCause() {
        return cause;
    }

    public void setCause(String cause) {
        this.cause = cause;
    }

    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }

    public String getNormalizedMessage() {
        return normalizedMessage;
    }

    public void setNormalizedMessage(String normalizedMessage) {
        this.normalizedMessage = normalizedMessage;
    }

    public String getNormalizedHash() {
        return normalizedHash;
    }

    public void setNormalizedHash(String normalizedHash) {
        this.normalizedHash = normalizedHash;
    }

    public Integer getOccurrenceCount() {
        return occurrenceCount != null ? occurrenceCount : 1;
    }

    public void setOccurrenceCount(Integer occurrenceCount) {
        this.occurrenceCount = occurrenceCount;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }

    public LocalDateTime getLastSeenAt() {
        return lastSeenAt != null ? lastSeenAt : analyzedAt;
    }

    public void setLastSeenAt(LocalDateTime lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }

    public Scan getScan() {
        return scan;
    }

    public void setScan(Scan scan) {
        this.scan = scan;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }
}
