package com.teknokent.ailogmonitor.repository;

import com.teknokent.ailogmonitor.entity.LogEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogEmbeddingRepository extends JpaRepository<LogEmbedding, Long> {

    List<LogEmbedding> findTop5ByOrderByCreatedAtDesc();
    void deleteByCreatedAtBefore(LocalDateTime dateTime);
}