package com.teknokent.ailogmonitor.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "scan")
public class Scan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime scanTime;

    private Integer totalLogCount;

    private Integer errorCount;

    private Integer warnCount;

    @Enumerated(EnumType.STRING)
    private ScanStatus status;

    @OneToMany(mappedBy = "scan",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<LogAnalysis> analyses = new ArrayList<>();

    public Scan() {
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getScanTime() {
        return scanTime;
    }

    public void setScanTime(LocalDateTime scanTime) {
        this.scanTime = scanTime;
    }

    public Integer getTotalLogCount() {
        return totalLogCount;
    }

    public void setTotalLogCount(Integer totalLogCount) {
        this.totalLogCount = totalLogCount;
    }

    public Integer getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(Integer errorCount) {
        this.errorCount = errorCount;
    }

    public Integer getWarnCount() {
        return warnCount;
    }

    public void setWarnCount(Integer warnCount) {
        this.warnCount = warnCount;
    }

    public ScanStatus getStatus() {
        return status;
    }

    public void setStatus(ScanStatus status) {
        this.status = status;
    }

    public List<LogAnalysis> getAnalyses() {
        return analyses;
    }

    public void setAnalyses(List<LogAnalysis> analyses) {
        this.analyses = analyses;
    }

}
