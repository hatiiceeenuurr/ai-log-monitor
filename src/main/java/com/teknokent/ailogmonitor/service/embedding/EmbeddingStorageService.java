package com.teknokent.ailogmonitor.service.embedding;

import com.pgvector.PGvector;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.entity.LogEmbedding;
import com.teknokent.ailogmonitor.repository.LogEmbeddingRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmbeddingStorageService {

    private final EmbeddingService embeddingService;
    private final LogEmbeddingRepository repository;

    public EmbeddingStorageService(
            EmbeddingService embeddingService,
            LogEmbeddingRepository repository) {

        this.embeddingService = embeddingService;
        this.repository = repository;
    }

    public void saveEmbedding(LogAnalysis analysis) {
        System.out.println("Embedding oluşturuluyor...");
        List<Float> embedding =
                embeddingService.createEmbedding(
                        analysis.getLogContent()
                );

        float[] vector = new float[embedding.size()];

        for (int i = 0; i < embedding.size(); i++) {
            vector[i] = embedding.get(i);
        }

        LogEmbedding entity = new LogEmbedding();

        entity.setLogAnalysis(analysis);
        entity.setEmbedding(vector);

        repository.save(entity);
        System.out.println("Embedding başarıyla kaydedildi.");
    }
}
