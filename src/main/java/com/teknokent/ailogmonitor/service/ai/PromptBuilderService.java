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

}
