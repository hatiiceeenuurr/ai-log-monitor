package com.teknokent.ailogmonitor.service.embedding;

import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.entity.LogEmbedding;
import com.teknokent.ailogmonitor.repository.LogEmbeddingRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmbeddingSearchService {

    private final EmbeddingService embeddingService;
    private final LogEmbeddingRepository repository;
    private final EntityManager entityManager;

    public EmbeddingSearchService(
            EmbeddingService embeddingService,
            LogEmbeddingRepository repository,
            EntityManager entityManager) {

        this.embeddingService = embeddingService;
        this.repository = repository;
        this.entityManager = entityManager;
    }

    public List<LogAnalysis> findSimilarLogs(String currentLog) {

        List<Float> embedding =
                embeddingService.createEmbedding(currentLog);

        float[] queryVector = new float[embedding.size()];

        for (int i = 0; i < embedding.size(); i++) {
            queryVector[i] = embedding.get(i);
        }

        List<LogEmbedding> results =
                entityManager.createQuery("""
                        FROM LogEmbedding
                        ORDER BY cosine_distance(embedding, :embedding)
                        """, LogEmbedding.class)
                        .setParameter("embedding", queryVector)
                        .setMaxResults(5)
                        .getResultList();

        return results.stream()
                .map(LogEmbedding::getLogAnalysis)
                .toList();
    }

    public List<SimilarLogResult> findSimilarLogsWithScore(String currentLog) {

        List<LogAnalysis> analyses = findSimilarLogs(currentLog);

        List<SimilarLogResult> results = new ArrayList<>();

        for (LogAnalysis analysis : analyses) {

            results.add(
                    new SimilarLogResult(
                            analysis,
                            100.0
                    )
            );
        }

        return results;
    }
}

