package com.teknokent.ailogmonitor.dto;

public class VectorSearchResult {

    private Long logAnalysisId;
    private double distance;

    public VectorSearchResult(Long logAnalysisId, double distance) {
        this.logAnalysisId = logAnalysisId;
        this.distance = distance;
    }

    public Long getLogAnalysisId() {
        return logAnalysisId;
    }

    public double getDistance() {
        return distance;
    }
}
