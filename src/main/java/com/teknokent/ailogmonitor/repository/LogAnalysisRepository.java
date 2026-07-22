package com.teknokent.ailogmonitor.repository;

import com.teknokent.ailogmonitor.entity.LogAnalysis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LogAnalysisRepository
        extends JpaRepository<LogAnalysis, Long> {

    long countBySeverity(String severity);

    List<LogAnalysis> findTop5ByOrderByAnalyzedAtDesc();

    List<LogAnalysis> findAllByOrderByAnalyzedAtDesc();

    Page<LogAnalysis> findAllByOrderByAnalyzedAtDesc(Pageable pageable);

    Optional<LogAnalysis> findFirstByLogContentOrderByAnalyzedAtDesc(String logContent);

    Optional<LogAnalysis> findFirstByNormalizedHashOrderByAnalyzedAtDesc(String normalizedHash);

    boolean existsByLogContent(String logContent);

    boolean existsByNormalizedHash(String normalizedHash);

    @Query("""
            SELECT
                FUNCTION('DATE', l.analyzedAt),
                COUNT(l)
            FROM LogAnalysis l
            GROUP BY FUNCTION('DATE', l.analyzedAt)
            ORDER BY FUNCTION('DATE', l.analyzedAt)
            """)
    List<Object[]> getDailyAnalysisCounts();

    void deleteByAnalyzedAtBefore(LocalDateTime dateTime);
}