package com.teknokent.ailogmonitor.dto;

import com.teknokent.ailogmonitor.entity.LogAnalysis;

public class SimilarLogResult {

    private LogAnalysis analysis;

    private double similarity;

    private double distance;

    public SimilarLogResult(LogAnalysis analysis,
                            double similarity,
                            double distance) {

        this.analysis = analysis;
        this.similarity = similarity;
        this.distance = distance;
    }

    public LogAnalysis getAnalysis() {
        return analysis;
    }

    public void setAnalysis(LogAnalysis analysis) {
        this.analysis = analysis;
    }

    public double getSimilarity() {
        return similarity;
    }

    public void setSimilarity(double similarity) {
        this.similarity = similarity;
    }

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }
}
