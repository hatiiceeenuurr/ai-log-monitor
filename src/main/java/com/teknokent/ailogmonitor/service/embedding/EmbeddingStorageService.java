package com.teknokent.ailogmonitor.service.embedding;

import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.entity.LogEmbedding;
import com.teknokent.ailogmonitor.repository.LogEmbeddingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmbeddingStorageService {

    private static final Logger log =
            LoggerFactory.getLogger(EmbeddingStorageService.class);

    private final EmbeddingService embeddingService;
    private final LogEmbeddingRepository repository;

    public EmbeddingStorageService(
            EmbeddingService embeddingService,
            LogEmbeddingRepository repository) {

        this.embeddingService = embeddingService;
        this.repository = repository;
    }

    public void saveEmbedding(LogAnalysis analysis) {

        log.info("Creating embedding for LogAnalysis ID={}", analysis.getId());

        List<Float> embedding =
                embeddingService.createEmbedding(
                        analysis.getLogContent()
                );
        log.info("Embedding first 10 values: {}",
                embedding.subList(0, 10));

        if (embedding == null || embedding.isEmpty()) {
            throw new IllegalStateException("Embedding could not be created.");
        }

        float[] vector = new float[embedding.size()];

        for (int i = 0; i < embedding.size(); i++) {
            vector[i] = embedding.get(i);
        }

        LogEmbedding entity = new LogEmbedding();
        entity.setLogAnalysis(analysis);
        entity.setEmbedding(vector);

        repository.save(entity);

        log.info("Embedding saved successfully. LogAnalysis ID={}", analysis.getId());
    }
}