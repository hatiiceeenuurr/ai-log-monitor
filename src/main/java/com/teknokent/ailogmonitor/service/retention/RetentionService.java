package com.teknokent.ailogmonitor.service.retention;

import com.teknokent.ailogmonitor.repository.LogAnalysisRepository;
import com.teknokent.ailogmonitor.repository.LogEmbeddingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class RetentionService {

    private static final Logger log =
            LoggerFactory.getLogger(RetentionService.class);

    private final LogAnalysisRepository logAnalysisRepository;
    private final LogEmbeddingRepository logEmbeddingRepository;

    @Value("${retention.days}")
    private int retentionDays;

    public RetentionService(LogAnalysisRepository logAnalysisRepository,
                            LogEmbeddingRepository logEmbeddingRepository) {

        this.logAnalysisRepository = logAnalysisRepository;
        this.logEmbeddingRepository = logEmbeddingRepository;
    }

    @Scheduled(cron =  "0 0 3 * * *")
    public void cleanupOldLogs() {

        LocalDateTime threshold =
                LocalDateTime.now().minusDays(retentionDays);

        log.info("Retention job started. Threshold: {}", threshold);

        logEmbeddingRepository.deleteByCreatedAtBefore(threshold);

        logAnalysisRepository.deleteByAnalyzedAtBefore(threshold);

        log.info("Retention job completed.");
    }

}
