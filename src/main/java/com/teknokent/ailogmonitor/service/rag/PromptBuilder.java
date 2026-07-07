package com.teknokent.ailogmonitor.service.rag;

import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {

    public String buildPrompt(String currentLog,
                              String context) {

        return """
                You are an experienced Software Reliability Engineer.

                Analyze the application log.

                Previous Context:
                %s

                Current Log:
                %s

                Respond exactly in this format.

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
