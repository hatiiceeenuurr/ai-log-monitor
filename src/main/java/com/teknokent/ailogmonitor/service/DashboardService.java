package com.teknokent.ailogmonitor.service;

import com.teknokent.ailogmonitor.dto.DashboardResponse;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.repository.LogAnalysisRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DashboardService {

    private final LogAnalysisRepository logAnalysisRepository;

    public DashboardService(LogAnalysisRepository logAnalysisRepository) {
        this.logAnalysisRepository = logAnalysisRepository;
    }

    public DashboardResponse getDashboardData() {

        long totalLogs = logAnalysisRepository.count();

        long errorCount = logAnalysisRepository.countBySeverity("ERROR");

        long warnCount = logAnalysisRepository.countBySeverity("WARN");

        long infoCount = logAnalysisRepository.countBySeverity("INFO");

        List<LogAnalysis> recentLogs =
                logAnalysisRepository.findTop5ByOrderByAnalyzedAtDesc();

        LocalDateTime lastAnalysis = null;

        if (!recentLogs.isEmpty()) {
            lastAnalysis = recentLogs.get(0).getAnalyzedAt();
        }

        return new DashboardResponse(
                totalLogs,
                errorCount,
                warnCount,
                infoCount,
                lastAnalysis,
                recentLogs
        );
    }
}
