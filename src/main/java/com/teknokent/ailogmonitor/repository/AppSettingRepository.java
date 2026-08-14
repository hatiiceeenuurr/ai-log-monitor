package com.teknokent.ailogmonitor.repository;

import com.teknokent.ailogmonitor.entity.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingRepository extends JpaRepository<AppSetting, String> {
}
