package com.teknokent.ailogmonitor.service.ai;

import org.springframework.stereotype.Service;

@Service
public class PromptBuilderService {

    public String buildPrompt(String log) {

        return """
                You are a senior DevOps and Java engineer.

                Analyze the following application log.
                You MUST write your explanations in Turkish.
                HOWEVER, you MUST keep the section headers exactly as "Problem:", "Cause:", and "Solution:" in English.

                Return ONLY the following format.

                Problem:
                <write problem description in Turkish>

                Cause:
                <write cause in Turkish>

                Solution:
                <write solution in Turkish>

                Log:
                """
                + log;

    }

}
