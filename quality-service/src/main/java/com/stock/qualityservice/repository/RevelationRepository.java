package com.stock.qualityservice.repository;

import com.stock.qualityservice.entity.Revelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 📏 Revelation Repository
 * Database operations for quality testing standards
 */
@Repository
public interface RevelationRepository extends JpaRepository<Revelation, UUID> {

    /**
     * Find all revelations for a quality profile
     */
    List<Revelation> findByQualityProfileId(UUID qualityProfileId);

    /**
     * Find mandatory revelations for a quality profile
     */
    List<Revelation> findByQualityProfileIdAndIsMandatoryTrue(UUID qualityProfileId);

    /**
     * Find revelations by test type
     */
    List<Revelation> findByTestType(Revelation.TestType testType);

    /**
     * Find revelations by name (case-insensitive)
     */
    List<Revelation> findByNameContainingIgnoreCase(String name);

    /**
     * Check if revelation exists by name
     */
    boolean existsByName(String name);
}
