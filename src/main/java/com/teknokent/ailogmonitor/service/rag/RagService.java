package com.teknokent.ailogmonitor.service.rag;

import com.teknokent.ailogmonitor.entity.LogAnalysis;
import com.teknokent.ailogmonitor.repository.LogAnalysisRepository;
import com.teknokent.ailogmonitor.service.ai.AIService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagService {

    private final AIService aiService;
    private final LogAnalysisRepository repository;
    private final ContextBuilder contextBuilder;
    private final PromptBuilder promptBuilder;

    public RagService(AIService aiService,
                      LogAnalysisRepository repository,
                      ContextBuilder contextBuilder,
                      PromptBuilder promptBuilder) {

        this.aiService = aiService;
        this.repository = repository;
        this.contextBuilder = contextBuilder;
        this.promptBuilder = promptBuilder;
    }

    public String analyze(String currentLog) {

        List<LogAnalysis> previousAnalyses =
                repository.findTop5ByOrderByAnalyzedAtDesc();

        String context =
                contextBuilder.buildContext(previousAnalyses);

        String prompt =
                promptBuilder.buildPrompt(currentLog, context);

        return aiService.askAI(prompt);
    }

}
