package com.teknokent.ailogmonitor.dto;

import com.teknokent.ailogmonitor.entity.LogAnalysis;

import java.time.LocalDateTime;
import java.util.List;

public class DashboardResponse {

    private long totalLogs;
    private long errorCount;
    private long warnCount;
    private LocalDateTime lastAnalysis;
    private List<LogAnalysis> recentLogs;

    public DashboardResponse() {
    }

    public DashboardResponse(long totalLogs,
                             long errorCount,
                             long warnCount,
                             LocalDateTime lastAnalysis,
                             List<LogAnalysis> recentLogs) {

        this.totalLogs = totalLogs;
        this.errorCount = errorCount;
        this.warnCount = warnCount;
        this.lastAnalysis = lastAnalysis;
        this.recentLogs = recentLogs;
    }

    public long getTotalLogs() {
        return totalLogs;
    }

    public void setTotalLogs(long totalLogs) {
        this.totalLogs = totalLogs;
    }

    public long getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(long errorCount) {
        this.errorCount = errorCount;
    }

    public long getWarnCount() {
        return warnCount;
    }

    public void setWarnCount(long warnCount) {
        this.warnCount = warnCount;
    }

    public LocalDateTime getLastAnalysis() {
        return lastAnalysis;
    }

    public void setLastAnalysis(LocalDateTime lastAnalysis) {
        this.lastAnalysis = lastAnalysis;
    }

    public List<LogAnalysis> getRecentLogs() {
        return recentLogs;
    }

    public void setRecentLogs(List<LogAnalysis> recentLogs) {
        this.recentLogs = recentLogs;
    }
}