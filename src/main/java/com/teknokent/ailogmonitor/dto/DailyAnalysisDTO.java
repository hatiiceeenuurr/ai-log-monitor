package com.teknokent.ailogmonitor.dto;

public class DailyAnalysisDTO {

    private String date;
    private long count;

    public DailyAnalysisDTO() {
    }

    public DailyAnalysisDTO(String date, long count) {
        this.date = date;
        this.count = count;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
