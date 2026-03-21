package com.stock.qualityservice.repository;

import com.stock.qualityservice.entity.InspectionResult;
import com.stock.qualityservice.entity.QualityControl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionResultRepository extends JpaRepository<InspectionResult, String> {

    List<InspectionResult> findByQualityControlId(String qualityControlId);

    List<InspectionResult> findByQualityControl(QualityControl qualityControl);

    List<InspectionResult> findByQualityControlAndIsPassedFalse(QualityControl qualityControl);

    void deleteByQualityControl(QualityControl qualityControl);

    @Query("SELECT ir FROM InspectionResult ir WHERE ir.qualityControl.id = :qualityControlId ORDER BY ir.sequenceOrder ASC")
    List<InspectionResult> findByQualityControlIdOrderBySequence(@Param("qualityControlId") String qualityControlId);

    @Query("SELECT ir FROM InspectionResult ir WHERE ir.qualityControl.id = :qualityControlId AND ir.isPassed = :isPassed")
    List<InspectionResult> findByQualityControlIdAndIsPassed(@Param("qualityControlId") String qualityControlId,
                                                             @Param("isPassed") Boolean isPassed);

    @Query("SELECT ir FROM InspectionResult ir WHERE ir.qualityControl.id = :qualityControlId AND ir.defectSeverity = :severity")
    List<InspectionResult> findByQualityControlIdAndDefectSeverity(@Param("qualityControlId") String qualityControlId,
                                                                   @Param("severity") String severity);

    @Query("SELECT COUNT(ir) FROM InspectionResult ir WHERE ir.qualityControl.id = :qualityControlId AND ir.isPassed = false")
    Long countFailedResultsByQualityControl(@Param("qualityControlId") String qualityControlId);

    @Query("SELECT ir FROM InspectionResult ir WHERE ir.testParameter = :parameter AND ir.isPassed = false")
    List<InspectionResult> findFailedResultsByParameter(@Param("parameter") String parameter);

    void deleteByQualityControlId(String qualityControlId);
}