package com.teknokent.ailogmonitor.service.report;

import com.teknokent.ailogmonitor.dto.DailyAnalysisDTO;
import com.teknokent.ailogmonitor.dto.LogAnalysisResult;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.entity.Scan;
import com.teknokent.ailogmonitor.repository.LogAnalysisRepository;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingStorageService;
import org.springframework.stereotype.Service;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingStorageService;
import java.time.LocalDateTime;
import java.util.List;
import com.teknokent.ailogmonitor.service.priority.PriorityService;
import com.teknokent.ailogmonitor.service.notification.NotificationService;

@Service
public class ReportService {

    private final LogAnalysisRepository repository;
    private final EmbeddingStorageService embeddingStorageService;
    private final PriorityService priorityService;
    private final NotificationService notificationService;

    public ReportService(LogAnalysisRepository repository,
                         EmbeddingStorageService embeddingStorageService,
                         PriorityService priorityService,
                         NotificationService notificationService) {

        this.repository = repository;
        this.embeddingStorageService = embeddingStorageService;
        this.priorityService = priorityService;
        this.notificationService = notificationService;
    }

    public LogAnalysisResult parseAIResponse(String response) {

        String problem = "";
        String cause = "";
        String solution = "";

        String[] lines = response.split("\\R");

        String currentSection = "";

        for (String line : lines) {

            line = line.trim();

            if (line.startsWith("Problem:")) {
                currentSection = "problem";
                continue;
            }

            if (line.startsWith("Cause:")) {
                currentSection = "cause";
                continue;
            }

            if (line.startsWith("Solution:")) {
                currentSection = "solution";
                continue;
            }

            if (line.isBlank()) {
                continue;
            }

            switch (currentSection) {

                case "problem" ->
                        problem += line + " ";

                case "cause" ->
                        cause += line + " ";

                case "solution" ->
                        solution += line + " ";
            }

        }

        return new LogAnalysisResult(
                problem.trim(),
                cause.trim(),
                solution.trim()
        );
    }

    public LogAnalysis saveAnalysis(Scan scan,
                                    String log,
                                    String severity,
                                    String aiResponse) {

        LogAnalysisResult result = parseAIResponse(aiResponse);

        LogAnalysis analysis = new LogAnalysis();

        analysis.setScan(scan);
        analysis.setLogContent(log);
        analysis.setSeverity(severity);
        analysis.setProblem(result.getProblem());
        analysis.setCause(result.getCause());
        analysis.setSolution(result.getSolution());
        analysis.setAnalyzedAt(LocalDateTime.now());
        analysis.setPriority(
                priorityService.determinePriority(
                        severity,
                        result.getProblem(),
                        log
                )
        );
        LogAnalysis savedAnalysis = repository.save(analysis);

// Embedding oluştur
        try {

            embeddingStorageService.saveEmbedding(savedAnalysis);

        } catch (Exception e) {

            System.out.println("Embedding oluşturulamadı: " + e.getMessage());

        }

// Notification gönder
        try {

            notificationService.notify(savedAnalysis);

        } catch (Exception e) {

            System.out.println("Notification gönderilemedi: " + e.getMessage());

        }

        return savedAnalysis;

    }

    public long getTotalLogs() {
        return repository.count();
    }

    public long getErrorCount() {
        return repository.countBySeverity("ERROR");
    }

    public long getWarnCount() {
        return repository.countBySeverity("WARN");
    }

    public LocalDateTime getLastAnalysisTime() {

        return repository.findTop5ByOrderByAnalyzedAtDesc()
                .stream()
                .findFirst()
                .map(LogAnalysis::getAnalyzedAt)
                .orElse(null);
    }

    public List<LogAnalysis> getRecentLogs() {

        return repository.findTop5ByOrderByAnalyzedAtDesc();

    }

    public List<DailyAnalysisDTO> getDailyAnalysis() {

        return repository.getDailyAnalysisCounts()
                .stream()
                .map(result -> new DailyAnalysisDTO(
                        result[0].toString(),
                        ((Long) result[1])
                ))
                .toList();

    }

}
