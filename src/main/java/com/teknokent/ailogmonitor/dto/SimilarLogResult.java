package com.teknokent.ailogmonitor.dto;

import com.teknokent.ailogmonitor.entity.LogAnalysis;

public class SimilarLogResult {

    private LogAnalysis analysis;
    private double similarity;

    public SimilarLogResult(LogAnalysis analysis, double similarity) {
        this.analysis = analysis;
        this.similarity = similarity;
    }

    public LogAnalysis getAnalysis() {
        return analysis;
    }

    public double getSimilarity() {
        return similarity;
    }
}
