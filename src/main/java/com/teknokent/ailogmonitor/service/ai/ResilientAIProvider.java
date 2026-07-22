package com.teknokent.ailogmonitor.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
public class ResilientAIProvider implements AIProvider {

    private static final Logger log = LoggerFactory.getLogger(ResilientAIProvider.class);

    private final AIProvider ollamaAIProvider;
    private final AIProvider openRouterAIProvider;

    public ResilientAIProvider(
            @Qualifier("ollamaAIProvider") AIProvider ollamaAIProvider,
            @Qualifier("openRouterAIProvider") AIProvider openRouterAIProvider) {
        this.ollamaAIProvider = ollamaAIProvider;
        this.openRouterAIProvider = openRouterAIProvider;
    }

    @Override
    public String analyze(String prompt) {
        // 1. Try Ollama (Local LLM)
        try {
            log.info("Attempting AI Analysis using primary provider: Ollama");
            return ollamaAIProvider.analyze(prompt);
        } catch (Exception e) {
            log.warn("Ollama AI provider failed: {}. Falling back to OpenRouter...", e.getMessage());
        }

        // 2. Fallback to OpenRouter API
        try {
            log.info("Attempting AI Analysis using secondary provider: OpenRouter");
            return openRouterAIProvider.analyze(prompt);
        } catch (Exception e) {
            log.warn("OpenRouter AI provider failed: {}. Generating structured rule-based fallback response...", e.getMessage());
        }

        // 3. Fallback to Rule-based structured response
        return generateRuleBasedFallback(prompt);
    }

    private String generateRuleBasedFallback(String prompt) {
        return """
                Problem: Sistem hatası tespit edildi (AI Servisleri Geçici Olarak Erişilemiyor).
                Cause: Servis veya kaynak hatası oluştu, ancak harici/yerel LLM servislerine ulaşılamadı.
                Solution: Sistem yöneticisi ile iletişime geçin, servis bağlantılarını ve log detaylarını inceleyin.
                """;
    }
}
