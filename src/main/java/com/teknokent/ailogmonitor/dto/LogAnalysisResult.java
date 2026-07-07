package com.teknokent.ailogmonitor.dto;

public class LogAnalysisResult {

    private String problem;
    private String cause;
    private String solution;

    public LogAnalysisResult() {
    }

    public LogAnalysisResult(String problem, String cause, String solution) {
        this.problem = problem;
        this.cause = cause;
        this.solution = solution;
    }

    public String getProblem() {
        return problem;
    }

    public void setProblem(String problem) {
        this.problem = problem;
    }

    public String getCause() {
        return cause;
    }

    public void setCause(String cause) {
        this.cause = cause;
    }

    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }
}

