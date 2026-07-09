package com.teknokent.ailogmonitor.service.rag;

import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {

    public String buildPrompt(String currentLog, String context) {

        return """
                You are a Senior Software Reliability Engineer responsible for analyzing application logs.

                Your task is to analyze the current log using both the current log data and the retrieved previous incidents.

                Instructions:
                - Carefully analyze the current log.
                - Use previous incidents only if they are relevant.
                - Reuse successful solutions when appropriate.
                - If the current issue differs from previous incidents, explain the difference.
                - Never invent information that is not supported by the log.
                - Keep your answer technical, concise and actionable.

                Previous Similar Incidents:
                %s

                Current Log:
                %s

                Respond ONLY in the following format.

                Problem:
                ...

                Cause:
                ...

                Solution:
                ...
                """.formatted(
                context,
                currentLog
        );
    }
}