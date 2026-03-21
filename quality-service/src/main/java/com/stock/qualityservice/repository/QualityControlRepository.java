package com.stock.qualityservice.repository;

import com.stock.qualityservice.entity.QualityControl;
import com.stock.qualityservice.entity.QCStatus;
import com.stock.qualityservice.entity.QCType;
import com.stock.qualityservice.entity.Disposition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QualityControlRepository extends JpaRepository<QualityControl, String> {

    Optional<QualityControl> findByInspectionNumber(String inspectionNumber);

    List<QualityControl> findByItemId(String itemId);

    List<QualityControl> findByLotId(String lotId);

    Optional<QualityControl> findBySerialNumber(String serialNumber);

    List<QualityControl> findByInspectionType(QCType inspectionType);

    List<QualityControl> findByStatus(QCStatus status);

    Page<QualityControl> findByStatus(QCStatus status, Pageable pageable);

    List<QualityControl> findByDisposition(Disposition disposition);

    List<QualityControl> findByInspectorId(String inspectorId);

    List<QualityControl> findByQuarantineId(String quarantineId);

    @Query("SELECT qc FROM QualityControl qc WHERE qc.status = 'PENDING'")
    List<QualityControl> findAllPendingInspections();

    @Query("SELECT qc FROM QualityControl qc WHERE qc.status = 'IN_PROGRESS'")
    List<QualityControl> findAllInProgressInspections();

    @Query("SELECT qc FROM QualityControl qc WHERE qc.inspectorId = :inspectorId AND qc.status IN ('PENDING', 'IN_PROGRESS')")
    List<QualityControl> findActiveInspectionsByInspector(@Param("inspectorId") String inspectorId);

    @Query("SELECT qc FROM QualityControl qc WHERE qc.itemId = :itemId AND qc.status = :status")
    List<QualityControl> findByItemIdAndStatus(@Param("itemId") String itemId, @Param("status") QCStatus status);

    @Query("SELECT qc FROM QualityControl qc WHERE qc.createdAt BETWEEN :startDate AND :endDate")
    List<QualityControl> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT qc FROM QualityControl qc WHERE qc.scheduledDate BETWEEN :startDate AND :endDate")
    List<QualityControl> findByScheduledDateBetween(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    @Query("SELECT qc FROM QualityControl qc WHERE qc.inspectionType = :type AND qc.status = :status")
    List<QualityControl> findByInspectionTypeAndStatus(@Param("type") QCType type, @Param("status") QCStatus status);

    @Query("SELECT COUNT(qc) FROM QualityControl qc WHERE qc.status = :status")
    Long countByStatus(@Param("status") QCStatus status);

    @Query("SELECT COUNT(qc) FROM QualityControl qc WHERE qc.disposition = :disposition")
    Long countByDisposition(@Param("disposition") Disposition disposition);

    @Query("SELECT COUNT(qc) FROM QualityControl qc WHERE qc.disposition = 'ACCEPT' AND qc.createdAt BETWEEN :startDate AND :endDate")
    Long countPassedInspections(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(qc) FROM QualityControl qc WHERE qc.disposition = 'REJECT' AND qc.createdAt BETWEEN :startDate AND :endDate")
    Long countFailedInspections(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(qc.defectRate) FROM QualityControl qc WHERE qc.createdAt BETWEEN :startDate AND :endDate")
    Double getAverageDefectRate(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT qc FROM QualityControl qc WHERE qc.itemId = :itemId AND qc.lotId = :lotId AND qc.status IN ('PENDING', 'IN_PROGRESS')")
    Optional<QualityControl> findActiveInspectionByItemAndLot(@Param("itemId") String itemId, @Param("lotId") String lotId);

    boolean existsByInspectionNumber(String inspectionNumber);

    boolean existsByItemIdAndLotIdAndStatusIn(String itemId, String lotId, List<QCStatus> statuses);

    @Query("SELECT qc FROM QualityControl qc WHERE qc.approvedBy IS NOT NULL AND qc.approvedAt BETWEEN :startDate AND :endDate")
    List<QualityControl> findApprovedInspections(@Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    boolean existsByRelatedMovementIdAndItemId(String relatedMovementId, String itemId);

    List<QualityControl> findTop5ByItemIdOrderByCreatedAtDesc(String itemId);
}