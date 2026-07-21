package com.teknokent.ailogmonitor.service.rag;

import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PromptBuilder {

    private static final Logger log =
            LoggerFactory.getLogger(PromptBuilder.class);

    public String buildPrompt(String currentLog,
                              List<SimilarLogResult> similarLogs) {

        StringBuilder context = new StringBuilder(4096);

        if (similarLogs.isEmpty()) {

            context.append("No similar incidents were found.\n");

        } else {

            int index = 1;

            for (SimilarLogResult result : similarLogs) {

                LogAnalysis analysis = result.getAnalysis();

                context.append("==================================================\n");
                context.append("Previous Incident ").append(index++).append("\n");
                context.append("Similarity : ")
                        .append(String.format("%.2f", result.getSimilarity()))
                        .append("%\n");

                context.append("Distance : ")
                        .append(String.format("%.4f", result.getDistance()))
                        .append("\n\n");

                context.append("Problem:\n")
                        .append(nullSafe(analysis.getProblem()))
                        .append("\n\n");

                context.append("Cause:\n")
                        .append(nullSafe(analysis.getCause()))
                        .append("\n\n");

                context.append("Solution:\n")
                        .append(nullSafe(analysis.getSolution()))
                        .append("\n\n");
            }
        }

        String finalPrompt = """
                You are a Senior Software Reliability Engineer.

                Analyze the CURRENT log.

                You may use PREVIOUS INCIDENTS only if they are relevant.

                Rules:

                - Focus primarily on the current log.
                - Reuse previous solutions only when appropriate.
                - Never invent technical details.
                - If previous incidents are unrelated, ignore them.
                - Keep the response concise and technical.

                ==================================================

                PREVIOUS INCIDENTS

                %s

                ==================================================

                CURRENT LOG

                %s

                ==================================================

                Respond ONLY using the format below.

                Problem:
                ...

                Cause:
                ...

                Solution:
                ...
                """.formatted(context, currentLog);

        log.debug("""
                
================= PROMPT SENT TO AI =================
{}
=====================================================
""", finalPrompt);

        return finalPrompt;
    }

    private String nullSafe(String value) {
        return value == null ? "N/A" : value;
    }
}