package com.stock.qualityservice.repository;

import com.stock.qualityservice.entity.SamplingPlan;
import com.stock.qualityservice.entity.SamplingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SamplingPlanRepository extends JpaRepository<SamplingPlan, String> {

    Optional<SamplingPlan> findByName(String name);

    List<SamplingPlan> findBySamplingType(SamplingType samplingType);

    List<SamplingPlan> findByIsActive(Boolean isActive);

    @Query("SELECT sp FROM SamplingPlan sp WHERE sp.isDefault = true AND sp.isActive = true")
    Optional<SamplingPlan> findDefaultSamplingPlan();

    @Query("SELECT sp FROM SamplingPlan sp WHERE sp.isActive = true")
    List<SamplingPlan> findAllActiveSamplingPlans();

    @Query("SELECT sp FROM SamplingPlan sp WHERE " +
            "sp.lotSizeMin <= :lotSize AND sp.lotSizeMax >= :lotSize AND sp.isActive = true")
    List<SamplingPlan> findByLotSize(@Param("lotSize") Integer lotSize);

    @Query("SELECT sp FROM SamplingPlan sp WHERE " +
            "sp.lotSizeMin <= :lotSize AND sp.lotSizeMax >= :lotSize " +
            "AND sp.inspectionLevel = :level AND sp.isActive = true")
    Optional<SamplingPlan> findByLotSizeAndInspectionLevel(@Param("lotSize") Integer lotSize,
                                                           @Param("level") String level);

    @Query("SELECT sp FROM SamplingPlan sp WHERE sp.aqlPercentage <= :aql AND sp.isActive = true")
    List<SamplingPlan> findByMaxAql(@Param("aql") Double aql);

    boolean existsByName(String name);

    @Query("SELECT COUNT(sp) FROM SamplingPlan sp WHERE sp.isDefault = true AND sp.isActive = true")
    Long countDefaultPlans();

    @Query("SELECT sp FROM SamplingPlan sp WHERE " +
            "LOWER(sp.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(sp.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<SamplingPlan> searchSamplingPlans(@Param("keyword") String keyword);
}