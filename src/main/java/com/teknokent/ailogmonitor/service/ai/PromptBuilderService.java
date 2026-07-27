package com.teknokent.ailogmonitor.service.ai;

import org.springframework.stereotype.Service;

@Service
public class PromptBuilderService {

    public String buildPrompt(String log) {

        return """
                You are a senior DevOps and Java engineer.

                Analyze the following application log.

                Return ONLY the following format.

                Problem:
                <problem>

                Cause:
                <cause>

                Solution:
                <solution>

                Log:
                """
                + log;

    }
    public String buildTranslationPrompt(
            String targetLanguage,
            String problem,
            String cause,
            String solution
    ) {

        return """
            You are a professional software localization expert.

            Translate the following IT log analysis into %s.

            Rules:
            - Preserve technical meanings.
            - Do not explain.
            - Do not add extra text.
            - Keep the same structure.
            - Return ONLY this format.

            Problem:
            <translated problem>

            Cause:
            <translated cause>

            Solution:
            <translated solution>

            Problem:
            %s

            Cause:
            %s

            Solution:
            %s
            """.formatted(
                targetLanguage,
                problem,
                cause,
                solution
        );
    }

}
