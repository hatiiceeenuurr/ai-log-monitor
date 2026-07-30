package com.teknokent.ailogmonitor.service.report;

import com.teknokent.ailogmonitor.dto.DailyAnalysisDTO;
import com.teknokent.ailogmonitor.dto.LogAnalysisResult;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.entity.Scan;
import com.teknokent.ailogmonitor.repository.LogAnalysisRepository;
import com.teknokent.ailogmonitor.repository.LogEmbeddingRepository;
import com.teknokent.ailogmonitor.repository.ScanRepository;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingStorageService;
import com.teknokent.ailogmonitor.service.notification.NotificationService;
import com.teknokent.ailogmonitor.service.parser.LogNormalizer;
import com.teknokent.ailogmonitor.service.priority.PriorityService;
import com.teknokent.ailogmonitor.service.rag.RagService;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    private static final Logger log =
            LoggerFactory.getLogger(ReportService.class);

    private final LogAnalysisRepository repository;
    private final LogEmbeddingRepository logEmbeddingRepository;
    private final ScanRepository scanRepository;
    private final EmbeddingStorageService embeddingStorageService;
    private final PriorityService priorityService;
    private final NotificationService notificationService;
    private final LogNormalizer logNormalizer;
    private final EntityManager entityManager;

    public ReportService(LogAnalysisRepository repository,
                         LogEmbeddingRepository logEmbeddingRepository,
                         ScanRepository scanRepository,
                         EmbeddingStorageService embeddingStorageService,
                         PriorityService priorityService,
                         NotificationService notificationService,
                         LogNormalizer logNormalizer,
                         EntityManager entityManager) {

        this.repository = repository;
        this.logEmbeddingRepository = logEmbeddingRepository;
        this.scanRepository = scanRepository;
        this.embeddingStorageService = embeddingStorageService;
        this.priorityService = priorityService;
        this.notificationService = notificationService;
        this.logNormalizer = logNormalizer;
        this.entityManager = entityManager;
    }

    public LogAnalysisResult parseAIResponse(String response) {

        StringBuilder problem = new StringBuilder();
        StringBuilder cause = new StringBuilder();
        StringBuilder solution = new StringBuilder();

        if (response == null || response.isBlank()) {
            return new LogAnalysisResult("", "", "");
        }

        String[] lines = response.split("\\R");
        String currentSection = "";

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank()) continue;

            String cleanedLine = line.replaceAll("^\\*+|\\*+$", "").trim();
            String lower = cleanedLine.toLowerCase();

            if (lower.startsWith("problem:") || lower.startsWith("problem :") || lower.startsWith("### problem")) {
                currentSection = "problem";
                String val = cleanedLine.replaceAll("(?i)^(?:###\\s*)?problem\\s*:\\s*", "").trim();
                if (!val.isEmpty()) problem.append(val).append(" ");
                continue;
            }

            if (lower.startsWith("cause:") || lower.startsWith("probable cause:") || lower.startsWith("cause :") || lower.startsWith("### cause")) {
                currentSection = "cause";
                String val = cleanedLine.replaceAll("(?i)^(?:###\\s*)?(?:probable\\s+)?cause\\s*:\\s*", "").trim();
                if (!val.isEmpty()) cause.append(val).append(" ");
                continue;
            }

            if (lower.startsWith("solution:") || lower.startsWith("recommended solution:") || lower.startsWith("solution :") || lower.startsWith("### solution")) {
                currentSection = "solution";
                String val = cleanedLine.replaceAll("(?i)^(?:###\\s*)?(?:recommended\\s+)?solution\\s*:\\s*", "").trim();
                if (!val.isEmpty()) solution.append(val).append(" ");
                continue;
            }

            switch (currentSection) {
                case "problem" -> problem.append(line).append(" ");
                case "cause" -> cause.append(line).append(" ");
                case "solution" -> solution.append(line).append(" ");
            }
        }

        return new LogAnalysisResult(
                problem.toString().trim(),
                cause.toString().trim(),
                solution.toString().trim()
        );
    }

    public LogAnalysis processLog(Scan scan,
                                  String logContent,
                                  String severity,
                                  RagService ragService) {

        String normalizedMessage = logNormalizer.normalize(logContent);
        String normalizedHash = logNormalizer.generateHash(normalizedMessage);

        Optional<LogAnalysis> existingPattern =
                repository.findFirstByNormalizedHashOrderByAnalyzedAtDesc(normalizedHash);

        if (existingPattern.isPresent()) {
            LogAnalysis patternLog = existingPattern.get();
            patternLog.setOccurrenceCount(patternLog.getOccurrenceCount() + 1);
            patternLog.setLastSeenAt(LocalDateTime.now());
            log.info("Pattern deduplicated. Incremented occurrence count to {} for hash {}",
                    patternLog.getOccurrenceCount(), normalizedHash);
            LogAnalysis updated = repository.save(patternLog);
            notificationService.notify(updated);
            return updated;
        }

        String aiResponse = ragService.analyze(logContent);
        LogAnalysisResult result = parseAIResponse(aiResponse);

        LogAnalysis analysis = new LogAnalysis();

        analysis.setScan(scan);
        analysis.setLogContent(logContent);
        analysis.setNormalizedMessage(normalizedMessage);
        analysis.setNormalizedHash(normalizedHash);
        analysis.setSeverity(severity);
        analysis.setProblem(result.getProblem());
        analysis.setCause(result.getCause());
        analysis.setSolution(result.getSolution());
        analysis.setOccurrenceCount(1);
        analysis.setAnalyzedAt(LocalDateTime.now());
        analysis.setLastSeenAt(LocalDateTime.now());

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

    public LogAnalysis saveAnalysis(Scan scan,
                                    String logContent,
                                    String severity,
                                    String aiResponse) {
        String normalizedMessage = logNormalizer.normalize(logContent);
        String normalizedHash = logNormalizer.generateHash(normalizedMessage);

        LogAnalysisResult result = parseAIResponse(aiResponse);

        LogAnalysis analysis = new LogAnalysis();
        analysis.setScan(scan);
        analysis.setLogContent(logContent);
        analysis.setNormalizedMessage(normalizedMessage);
        analysis.setNormalizedHash(normalizedHash);
        analysis.setSeverity(severity);
        analysis.setProblem(result.getProblem());
        analysis.setCause(result.getCause());
        analysis.setSolution(result.getSolution());
        analysis.setOccurrenceCount(1);
        analysis.setAnalyzedAt(LocalDateTime.now());
        analysis.setLastSeenAt(LocalDateTime.now());

        analysis.setPriority(
                priorityService.determinePriority(
                        severity,
                        result.getProblem(),
                        logContent
                )
        );

        return repository.save(analysis);
    }

    @Transactional
    public void resetAllData() {
        try {
            entityManager.createNativeQuery("TRUNCATE TABLE log_embedding, log_analysis, scan RESTART IDENTITY CASCADE").executeUpdate();
            log.info("TRUNCATE CASCADE executed successfully for log_embedding, log_analysis, and scan.");
        } catch (Exception e) {
            log.warn("TRUNCATE failed ({}), falling back to JPA deleteAll...", e.getMessage());
            logEmbeddingRepository.deleteAll();
            repository.deleteAll();
            scanRepository.deleteAll();
        }
        log.info("Tüm veritabanı analiz kayıtları sıfırlandı.");
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

    public long getInfoCount() {
        return repository.countBySeverity("INFO");
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

    public List<LogAnalysis> getAllLogs() {
        return repository.findAllByOrderByAnalyzedAtDesc();
    }

    public Page<LogAnalysis> getLogsPaginated(Pageable pageable, String severity, String search) {
        return repository.findByFilterAndSearch(severity, search, pageable);
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
        String normalized = logNormalizer.normalize(logContent);
        String hash = logNormalizer.generateHash(normalized);
        return repository.existsByNormalizedHash(hash);
    }
}