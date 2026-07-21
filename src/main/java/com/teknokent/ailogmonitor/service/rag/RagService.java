package com.teknokent.ailogmonitor.service.rag;

import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.service.ai.AIProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagService {

    private static final Logger log =
            LoggerFactory.getLogger(RagService.class);

    private final RetrievalService retrievalService;
    private final PromptBuilder promptBuilder;
    private final AIProvider aiProvider;

    public RagService(RetrievalService retrievalService,
                      PromptBuilder promptBuilder,
                      AIProvider aiProvider) {

        this.retrievalService = retrievalService;
        this.promptBuilder = promptBuilder;
        this.aiProvider = aiProvider;
    }

    public String analyze(String currentLog) {
        log.info("Current Log -> {}", currentLog);
        List<SimilarLogResult> similarLogs =
                retrievalService.retrieve(currentLog);

        log.info("========== RAG ==========");
        log.info("Similar logs found : {}", similarLogs.size());

        for (SimilarLogResult result : similarLogs) {
            log.info("Matched Log -> {}",
                    result.getAnalysis().getLogContent());
            log.info(
                    "Similarity: {}% | Distance: {} | LogId: {}",
                    String.format("%.2f", result.getSimilarity()),
                    String.format("%.4f", result.getDistance()),
                    result.getAnalysis().getId()
            );
        }

        String prompt =
                promptBuilder.buildPrompt(
                        currentLog,
                        similarLogs
                );

        return aiProvider.analyze(prompt);
    }
}