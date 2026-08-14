package com.teknokent.ailogmonitor.service.ai;

import com.teknokent.ailogmonitor.dto.LogAnalysisResult;
import org.springframework.stereotype.Service;

@Service
public class AIResponseParser {

    public LogAnalysisResult parse(String response) {
        if (response == null || response.isBlank()) {
            return new LogAnalysisResult("", "", "");
        }

        StringBuilder problem = new StringBuilder();
        StringBuilder cause = new StringBuilder();
        StringBuilder solution = new StringBuilder();
        Section currentSection = Section.NONE;

        for (String rawLine : response.split("\\R")) {
            String line = rawLine.trim();
            if (line.isBlank()) {
                continue;
            }

            String normalized = line.replaceAll("^\\*+|\\*+$", "").trim();
            String lower = normalized.toLowerCase();

            if (lower.startsWith("problem:")) {
                currentSection = Section.PROBLEM;
                append(problem, normalized.substring("problem:".length()).trim());
            } else if (lower.startsWith("cause:") || lower.startsWith("probable cause:")) {
                currentSection = Section.CAUSE;
                String value = lower.startsWith("probable cause:")
                        ? normalized.substring("probable cause:".length()).trim()
                        : normalized.substring("cause:".length()).trim();
                append(cause, value);
            } else if (lower.startsWith("solution:") || lower.startsWith("recommended solution:")) {
                currentSection = Section.SOLUTION;
                String value = lower.startsWith("recommended solution:")
                        ? normalized.substring("recommended solution:".length()).trim()
                        : normalized.substring("solution:".length()).trim();
                append(solution, value);
            } else {
                append(currentSection, problem, cause, solution, normalized);
            }
        }

        return new LogAnalysisResult(
                problem.toString().trim(),
                cause.toString().trim(),
                solution.toString().trim()
        );
    }

    private void append(Section section, StringBuilder problem, StringBuilder cause,
                        StringBuilder solution, String value) {
        switch (section) {
            case PROBLEM -> append(problem, value);
            case CAUSE -> append(cause, value);
            case SOLUTION -> append(solution, value);
            case NONE -> { }
        }
    }

    private void append(StringBuilder target, String value) {
        if (!value.isBlank()) {
            if (!target.isEmpty()) {
                target.append(' ');
            }
            target.append(value);
        }
    }

    private enum Section {
        NONE, PROBLEM, CAUSE, SOLUTION
    }
}
