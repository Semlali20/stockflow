package com.stock.qualityservice.repository;

import com.stock.qualityservice.entity.QualityProfile;
import com.stock.qualityservice.entity.QualityProfileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QualityProfileRepository extends JpaRepository<QualityProfile, String> {

    Optional<QualityProfile> findByName(String name);

    List<QualityProfile> findByItemId(String itemId);

    List<QualityProfile> findByCategoryId(String categoryId);

    List<QualityProfile> findByProfileType(QualityProfileType profileType);

    List<QualityProfile> findByIsActive(Boolean isActive);

    @Query("SELECT qp FROM QualityProfile qp WHERE qp.isActive = true")
    List<QualityProfile> findAllActiveProfiles();

    @Query("SELECT qp FROM QualityProfile qp WHERE qp.itemId = :itemId AND qp.isActive = true")
    Optional<QualityProfile> findActiveProfileByItemId(@Param("itemId") String itemId);

    @Query("SELECT qp FROM QualityProfile qp WHERE qp.categoryId = :categoryId AND qp.isActive = true")
    List<QualityProfile> findActiveProfilesByCategoryId(@Param("categoryId") String categoryId);

    boolean existsByName(String name);

    boolean existsByItemIdAndIsActive(String itemId, Boolean isActive);

    @Query("SELECT qp FROM QualityProfile qp WHERE " +
            "LOWER(qp.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(qp.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<QualityProfile> searchQualityProfiles(@Param("keyword") String keyword);
}