package com.teknokent.ailogmonitor.repository;

import com.teknokent.ailogmonitor.entity.LogEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogEmbeddingRepository
        extends JpaRepository<LogEmbedding, Long> {
}