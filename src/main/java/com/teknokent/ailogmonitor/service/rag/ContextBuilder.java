package com.teknokent.ailogmonitor.service.rag;

import com.teknokent.ailogmonitor.dto.SimilarLogResult;
import com.teknokent.ailogmonitor.entity.LogAnalysis;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ContextBuilder {

    public String buildContext(List<LogAnalysis> previousAnalyses) {

        if (previousAnalyses.isEmpty()) {
            return """
                    No similar incidents were found in the knowledge base.
                    Analyze the current log independently.
                    """;
        }

        StringBuilder context = new StringBuilder();

        context.append("""
                The following incidents were retrieved from the knowledge base.

                """);

        int index = 1;

        for (LogAnalysis analysis : previousAnalyses) {

            context.append("========== INCIDENT ")
                    .append(index++)
                    .append(" ==========\n");

            context.append("Original Log:\n")
                    .append(analysis.getLogContent())
                    .append("\n\n");

            context.append("Problem:\n")
                    .append(analysis.getProblem())
                    .append("\n\n");

            context.append("Cause:\n")
                    .append(analysis.getCause())
                    .append("\n\n");

            context.append("Solution:\n")
                    .append(analysis.getSolution())
                    .append("\n\n");
        }

        return context.toString();
    }

    public String buildContextWithSimilarity(List<SimilarLogResult> previousAnalyses) {

        if (previousAnalyses.isEmpty()) {
            return """
                    No similar incidents were found in the knowledge base.
                    Analyze the current log independently.
                    """;
        }

        StringBuilder context = new StringBuilder();

        context.append("""
                The following similar incidents were retrieved from the knowledge base.

                """);

        int index = 1;

        for (SimilarLogResult result : previousAnalyses) {

            LogAnalysis analysis = result.getAnalysis();

            context.append("========== INCIDENT ")
                    .append(index++)
                    .append(" ==========\n");

            context.append("Similarity: ")
                    .append(String.format("%.2f", result.getSimilarity()))
                    .append("%\n\n");

            context.append("Original Log:\n")
                    .append(analysis.getLogContent())
                    .append("\n\n");

            context.append("Problem:\n")
                    .append(analysis.getProblem())
                    .append("\n\n");

            context.append("Cause:\n")
                    .append(analysis.getCause())
                    .append("\n\n");

            context.append("Solution:\n")
                    .append(analysis.getSolution())
                    .append("\n\n");
        }

        return context.toString();
    }
}