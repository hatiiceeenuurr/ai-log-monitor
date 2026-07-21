package com.teknokent.ailogmonitor.service.report;

import com.teknokent.ailogmonitor.dto.DailyAnalysisDTO;
import com.teknokent.ailogmonitor.dto.LogAnalysisResult;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.entity.Scan;
import com.teknokent.ailogmonitor.repository.LogAnalysisRepository;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingStorageService;
import com.teknokent.ailogmonitor.service.notification.NotificationService;
import com.teknokent.ailogmonitor.service.priority.PriorityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    private static final Logger log =
            LoggerFactory.getLogger(ReportService.class);

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

        StringBuilder problem = new StringBuilder();
        StringBuilder cause = new StringBuilder();
        StringBuilder solution = new StringBuilder();

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
                        problem.append(line).append(" ");

                case "cause" ->
                        cause.append(line).append(" ");

                case "solution" ->
                        solution.append(line).append(" ");
            }
        }

        return new LogAnalysisResult(
                problem.toString().trim(),
                cause.toString().trim(),
                solution.toString().trim()
        );
    }

    public LogAnalysis saveAnalysis(Scan scan,
                                    String logContent,
                                    String severity,
                                    String aiResponse) {

        LogAnalysisResult result = parseAIResponse(aiResponse);

        Optional<LogAnalysis> lastAnalysis =
                repository.findFirstByLogContentOrderByAnalyzedAtDesc(logContent);

        if (lastAnalysis.isPresent()) {

            LogAnalysis previous = lastAnalysis.get();

            boolean sameAnalysis =
                    previous.getProblem().equals(result.getProblem())
                            && previous.getCause().equals(result.getCause())
                            && previous.getSolution().equals(result.getSolution());

            if (sameAnalysis) {
                log.info("Analysis unchanged. Skipping save for log: {}", logContent);
                return previous;
            }
        }

        LogAnalysis analysis = new LogAnalysis();

        analysis.setScan(scan);
        analysis.setLogContent(logContent);
        analysis.setSeverity(severity);
        analysis.setProblem(result.getProblem());
        analysis.setCause(result.getCause());
        analysis.setSolution(result.getSolution());
        analysis.setAnalyzedAt(LocalDateTime.now());

        analysis.setPriority(
                priorityService.determinePriority(
                        severity,
                        result.getProblem(),
                        logContent
                )
        );

        LogAnalysis savedAnalysis = repository.save(analysis);

        try {
            embeddingStorageService.saveEmbedding(savedAnalysis);
        } catch (Exception e) {
            log.error("Embedding oluşturulamadı. LogAnalysis ID={}",
                    savedAnalysis.getId(), e);
        }

        try {
            notificationService.notify(savedAnalysis);
        } catch (Exception e) {
            log.error("Notification gönderilemedi. LogAnalysis ID={}",
                    savedAnalysis.getId(), e);
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
                        (Long) result[1]
                ))
                .toList();
    }
    public boolean isAlreadyProcessed(String logContent) {
        return repository.existsByLogContent(logContent);
    }
}