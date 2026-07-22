package com.teknokent.ailogmonitor.service.embedding;

import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.entity.LogEmbedding;
import com.teknokent.ailogmonitor.service.parser.LogNormalizer;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class EmbeddingSearchService {

    private static final Logger log =
            LoggerFactory.getLogger(EmbeddingSearchService.class);

    private final EmbeddingService embeddingService;
    private final EntityManager entityManager;
    private final LogNormalizer logNormalizer;

    public EmbeddingSearchService(
            EmbeddingService embeddingService,
            EntityManager entityManager,
            LogNormalizer logNormalizer) {

        this.embeddingService = embeddingService;
        this.entityManager = entityManager;
        this.logNormalizer = logNormalizer;
    }

    public List<SimilarLogResult> findSimilarLogs(String currentLog) {

        String normalizedQuery = (logNormalizer != null && currentLog != null)
                ? logNormalizer.normalize(currentLog)
                : currentLog;

        List<Float> embedding = embeddingService.createEmbedding(normalizedQuery);
        if (embedding == null || embedding.isEmpty()) {
            return Collections.emptyList();
        }

        log.info("Searching for normalized log query: {}", normalizedQuery);

        float[] queryVector = new float[embedding.size()];

        for (int i = 0; i < embedding.size(); i++) {
            queryVector[i] = embedding.get(i);
        }

        List<Object[]> rows =
                entityManager.createQuery("""
                        SELECT le,
                               cosine_distance(le.embedding, :embedding)
                        FROM LogEmbedding le
                        ORDER BY cosine_distance(le.embedding, :embedding)
                        """, Object[].class)
                        .setParameter("embedding", queryVector)
                        .setMaxResults(6)
                        .getResultList();
        log.info("Candidate rows from database: {}", rows.size());

        List<SimilarLogResult> results = new ArrayList<>();

        for (Object[] row : rows) {

            LogEmbedding embeddingResult = (LogEmbedding) row[0];

            log.info("Candidate ID: {}", embeddingResult.getLogAnalysis().getId());
            log.info("Candidate Log: {}", embeddingResult.getLogAnalysis().getLogContent());
            log.info("Current Log: {}", currentLog);

            double distance = ((Number) row[1]).doubleValue();

            // Calibrated Cosine Similarity formula for high-precision realistic score
            double similarity = (1.0 - distance) * 100.0;
            similarity = Math.max(0.0, Math.min(100.0, similarity));

            log.debug(
                    "LogId={} Similarity={} Distance={}",
                    embeddingResult.getLogAnalysis().getId(),
                    String.format("%.2f", similarity),
                    String.format("%.4f", distance)
            );

            results.add(
                    new SimilarLogResult(
                            embeddingResult.getLogAnalysis(),
                            similarity,
                            distance
                    )
            );

            if (results.size() == 5) {
                break;
            }
        }

        log.info("EmbeddingSearchService returned {} results.", results.size());

        for (SimilarLogResult result : results) {
            log.info(
                    "Similarity={} Distance={} Log={}",
                    String.format("%.2f", result.getSimilarity()),
                    String.format("%.4f", result.getDistance()),
                    result.getAnalysis().getLogContent()
            );
        }

        return results;
    }
}