package com.teknokent.ailogmonitor.controller;

import com.teknokent.ailogmonitor.dto.DashboardResponse;
import com.teknokent.ailogmonitor.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getDashboard() {
        return dashboardService.getDashboardData();
    }

    @GetMapping("/daily")
    public List<Object[]> getDailyAnalysis() {
        return dashboardService.getDailyAnalysis();
    }
}
