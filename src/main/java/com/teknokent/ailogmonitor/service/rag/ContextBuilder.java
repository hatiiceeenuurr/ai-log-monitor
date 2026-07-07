package com.teknokent.ailogmonitor.service.rag;

import com.teknokent.ailogmonitor.entity.LogAnalysis;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ContextBuilder {

    public String buildContext(List<LogAnalysis> previousAnalyses) {

        if (previousAnalyses.isEmpty()) {
            return "No previous analyses found.";
        }

        StringBuilder context = new StringBuilder();

        context.append("Previous Analyses:\n\n");

        int index = 1;

        for (LogAnalysis analysis : previousAnalyses) {

            context.append(index++)
                    .append(". Log:\n")
                    .append(analysis.getLogContent())
                    .append("\n");

            context.append("Problem:\n")
                    .append(analysis.getProblem())
                    .append("\n");

            context.append("Cause:\n")
                    .append(analysis.getCause())
                    .append("\n");

            context.append("Solution:\n")
                    .append(analysis.getSolution())
                    .append("\n\n");
        }

        return context.toString();
    }
}