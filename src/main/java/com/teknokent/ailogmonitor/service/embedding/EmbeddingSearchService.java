package com.teknokent.ailogmonitor.service.embedding;

import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.entity.LogEmbedding;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmbeddingSearchService {

    private static final Logger log =
            LoggerFactory.getLogger(EmbeddingSearchService.class);

    private final EmbeddingService embeddingService;
    private final EntityManager entityManager;

    public EmbeddingSearchService(
            EmbeddingService embeddingService,
            EntityManager entityManager) {

        this.embeddingService = embeddingService;
        this.entityManager = entityManager;
    }

    public List<SimilarLogResult> findSimilarLogs(String currentLog) {

        List<Float> embedding =
                embeddingService.createEmbedding(currentLog);
        log.info("Searching for log: {}", currentLog);

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
            // Aynı logu RAG sonucuna ekleme
          /*  if (embeddingResult.getLogAnalysis()
                    .getId()
                    .equals(currentAnalysisId))
                {
                    log.info(">>> SAME LOG - SKIPPED");
                continue;
            }*/

            double distance = ((Number) row[1]).doubleValue();

            double similarity = (1.0 - distance) * 100.0;

            similarity = Math.max(0.0,
                    Math.min(100.0, similarity));

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

            // En fazla 5 farklı log döndür
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