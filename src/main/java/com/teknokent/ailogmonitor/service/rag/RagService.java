package com.teknokent.ailogmonitor.service.rag;

import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.service.ai.AIProvider;
import com.teknokent.ailogmonitor.service.embedding.EmbeddingSearchService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagService {

    private final AIProvider aiProvider;
    private final EmbeddingSearchService embeddingSearchService;
    private final ContextBuilder contextBuilder;
    private final PromptBuilder promptBuilder;

    public RagService(AIProvider aiProvider,
                      EmbeddingSearchService embeddingSearchService,
                      ContextBuilder contextBuilder,
                      PromptBuilder promptBuilder) {

        this.aiProvider = aiProvider;
        this.embeddingSearchService = embeddingSearchService;
        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
    }

    public String analyze(String currentLog) {

        List<SimilarLogResult> previousAnalyses =
                embeddingSearchService.findSimilarLogsWithScore(currentLog);

        String context =
                contextBuilder.buildContextWithSimilarity(previousAnalyses);

        String prompt =
                promptBuilder.buildPrompt(currentLog, context);

        return aiProvider.analyze(prompt);
    }
}
