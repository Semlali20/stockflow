package com.stock.qualityservice.repository;

import com.stock.qualityservice.entity.Quarantine;
import com.stock.qualityservice.entity.QuarantineStatus;
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
public interface QuarantineRepository extends JpaRepository<Quarantine, String> {

    List<Quarantine> findByItemId(String itemId);

    List<Quarantine> findByLotId(String lotId);

    Optional<Quarantine> findBySerialNumber(String serialNumber);

    List<Quarantine> findByStatus(QuarantineStatus status);

    Page<Quarantine> findByStatus(QuarantineStatus status, Pageable pageable);

    List<Quarantine> findByDisposition(Disposition disposition);

    List<Quarantine> findByInspectorId(String inspectorId);

    List<Quarantine> findByLocationId(String locationId);

    List<Quarantine> findByStatusIn(List<QuarantineStatus> statuses);

    List<Quarantine> findByExpectedReleaseDateBeforeAndStatus(LocalDateTime endDate, QuarantineStatus status);

    @Query("SELECT q FROM Quarantine q WHERE q.itemId = :itemId AND q.status = :status")
    List<Quarantine> findByItemIdAndStatus(@Param("itemId") String itemId, @Param("status") QuarantineStatus status);

    @Query("SELECT q FROM Quarantine q WHERE q.lotId = :lotId AND q.status IN :statuses")
    List<Quarantine> findByLotIdAndStatusIn(@Param("lotId") String lotId, @Param("statuses") List<QuarantineStatus> statuses);

    @Query("SELECT q FROM Quarantine q WHERE q.status = 'IN_PROCESS'")
    List<Quarantine> findAllInProcess();

    @Query("SELECT q FROM Quarantine q WHERE q.status = 'QUARANTINED'")
    List<Quarantine> findAllQuarantined();

    @Query("SELECT q FROM Quarantine q WHERE q.status = 'IN_PROCESS' AND q.expectedReleaseDate < :currentDate")
    List<Quarantine> findOverdueQuarantines(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT q FROM Quarantine q WHERE q.entryDate BETWEEN :startDate AND :endDate")
    List<Quarantine> findByEntryDateBetween(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT q FROM Quarantine q WHERE q.severity = :severity AND q.status = 'IN_PROCESS'")
    List<Quarantine> findBySeverityAndInProcess(@Param("severity") String severity);

    @Query("SELECT COUNT(q) FROM Quarantine q WHERE q.status = :status")
    Long countByStatus(@Param("status") QuarantineStatus status);

    @Query("SELECT SUM(q.quantity) FROM Quarantine q WHERE q.status = 'QUARANTINED'")
    Double getTotalQuarantinedQuantity();

    @Query("SELECT q FROM Quarantine q WHERE q.itemId = :itemId AND q.lotId = :lotId AND q.status IN ('IN_PROCESS', 'QUARANTINED')")
    Optional<Quarantine> findActiveQuarantineByItemAndLot(@Param("itemId") String itemId, @Param("lotId") String lotId);

    boolean existsByItemIdAndLotIdAndStatusIn(String itemId, String lotId, List<QuarantineStatus> statuses);
}