package com.teknokent.ailogmonitor.controller;

import com.teknokent.ailogmonitor.entity.AppSetting;
import com.teknokent.ailogmonitor.repository.AppSettingRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final AppSettingRepository appSettingRepository;

    public SettingsController(AppSettingRepository appSettingRepository) {
        this.appSettingRepository = appSettingRepository;
    }

    @GetMapping
    public Map<String, String> getSettings() {
        List<AppSetting> settings = appSettingRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (AppSetting s : settings) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        return map;
    }

    @PostMapping
    public Map<String, String> saveSettings(@RequestBody Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            appSettingRepository.save(new AppSetting(entry.getKey(), entry.getValue()));
        }
        return getSettings();
    }
}
