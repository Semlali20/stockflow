package com.stock.movementservice.repository;

import com.stock.movementservice.entity.MovementLine;
import com.stock.movementservice.entity.enums.LineStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MovementLineRepository extends JpaRepository<MovementLine, UUID> {

    // ===== Basic Queries =====

    /**
     * Find all lines for a movement
     */
    List<MovementLine> findByMovement_Id(UUID movementId);

    /**
     * Find lines by movement with pagination
     */
    Page<MovementLine> findByMovement_Id(UUID movementId, Pageable pageable);

    /**
     * Find line by movement and line number
     */
    Optional<MovementLine> findByMovement_IdAndLineNumber(UUID movementId, Integer lineNumber);

    // ===== Item-based Queries =====

    /**
     * Find all lines for a specific item
     */
    List<MovementLine> findByItemId(UUID itemId);

    /**
     * Find lines by item and status
     */
    List<MovementLine> findByItemIdAndStatus(UUID itemId, LineStatus status);

    /**
     * Find lines by movement and item
     */
    List<MovementLine> findByMovement_IdAndItemId(UUID movementId, UUID itemId);

    // ===== Status-based Queries =====

    /**
     * Find lines by status
     */
    List<MovementLine> findByStatus(LineStatus status);

    /**
     * Find lines by movement and status
     */
    List<MovementLine> findByMovement_IdAndStatus(UUID movementId, LineStatus status);

    /**
     * Find lines by multiple statuses
     */
    List<MovementLine> findByStatusIn(List<LineStatus> statuses);

    // ===== Lot/Serial-based Queries =====

    /**
     * Find lines by lot ID
     */
    List<MovementLine> findByLotId(UUID lotId);

    /**
     * Find lines by serial ID
     */
    List<MovementLine> findBySerialId(UUID serialId);

    /**
     * Find lines with lot tracking (lot ID is not null)
     */
    @Query("SELECT ml FROM MovementLine ml WHERE ml.lotId IS NOT NULL")
    List<MovementLine> findAllWithLotTracking();

    /**
     * Find lines with serial tracking (serial ID is not null)
     */
    @Query("SELECT ml FROM MovementLine ml WHERE ml.serialId IS NOT NULL")
    List<MovementLine> findAllWithSerialTracking();

    // ===== Location-based Queries =====

    /**
     * Find lines by from location
     */
    List<MovementLine> findByFromLocationId(UUID fromLocationId);

    /**
     * Find lines by to location
     */
    List<MovementLine> findByToLocationId(UUID toLocationId);

    /**
     * Find lines moving between specific locations
     */
    @Query("SELECT ml FROM MovementLine ml WHERE ml.fromLocationId = :fromId AND ml.toLocationId = :toId")
    List<MovementLine> findByFromAndToLocation(
            @Param("fromId") UUID fromLocationId,
            @Param("toId") UUID toLocationId
    );

    // ===== Quantity-based Queries =====

    /**
     * Find lines with variance (actual quantity different from requested)
     */
    @Query("SELECT ml FROM MovementLine ml WHERE ml.actualQuantity IS NOT NULL " +
            "AND ml.actualQuantity <> ml.requestedQuantity")
    List<MovementLine> findLinesWithVariance();

    /**
     * Find lines with short pick (actual < requested)
     */
    @Query("SELECT ml FROM MovementLine ml WHERE ml.actualQuantity IS NOT NULL " +
            "AND ml.actualQuantity < ml.requestedQuantity")
    List<MovementLine> findShortPickedLines();

    /**
     * Find lines by movement with variance
     */
    @Query("SELECT ml FROM MovementLine ml WHERE ml.movement.id = :movementId " +
            "AND ml.actualQuantity IS NOT NULL AND ml.actualQuantity <> ml.requestedQuantity")
    List<MovementLine> findVarianceLinesByMovement(@Param("movementId") UUID movementId);

    // ===== Statistics and Aggregation =====

    /**
     * Count lines by movement
     */
    long countByMovement_Id(UUID movementId);

    /**
     * Count lines by movement and status
     */
    long countByMovement_IdAndStatus(UUID movementId, LineStatus status);

    /**
     * Count completed lines for a movement
     */
    @Query("SELECT COUNT(ml) FROM MovementLine ml WHERE ml.movement.id = :movementId " +
            "AND ml.status = com.stock.movementservice.entity.enums.LineStatus.COMPLETED")
    long countCompletedLinesByMovement(@Param("movementId") UUID movementId);

    /**
     * Get total requested quantity by item
     */
    @Query("SELECT SUM(ml.requestedQuantity) FROM MovementLine ml WHERE ml.itemId = :itemId " +
            "AND ml.status IN (com.stock.movementservice.entity.enums.LineStatus.PENDING, " +
            "com.stock.movementservice.entity.enums.LineStatus.ALLOCATED, " +
            "com.stock.movementservice.entity.enums.LineStatus.IN_TRANSIT)")
    Double getTotalRequestedQuantityByItem(@Param("itemId") UUID itemId);

    /**
     * Get line statistics by movement
     */
    @Query("SELECT ml.status, COUNT(ml) FROM MovementLine ml WHERE ml.movement.id = :movementId GROUP BY ml.status")
    List<Object[]> getLineStatisticsByMovement(@Param("movementId") UUID movementId);

    // ===== Complex Queries =====

    /**
     * Find lines with movement details
     */
    @Query("SELECT ml FROM MovementLine ml JOIN FETCH ml.movement WHERE ml.id = :id")
    Optional<MovementLine> findByIdWithMovement(@Param("id") UUID id);

    /**
     * Find pending lines for a warehouse (through movement)
     */
    @Query("SELECT ml FROM MovementLine ml JOIN ml.movement m WHERE m.warehouseId = :warehouseId " +
            "AND ml.status IN (com.stock.movementservice.entity.enums.LineStatus.PENDING, " +
            "com.stock.movementservice.entity.enums.LineStatus.ALLOCATED)")
    List<MovementLine> findPendingLinesByWarehouse(@Param("warehouseId") UUID warehouseId);

    /**
     * Find lines for item in specific warehouse
     */
    @Query("SELECT ml FROM MovementLine ml JOIN ml.movement m WHERE ml.itemId = :itemId " +
            "AND m.warehouseId = :warehouseId")
    List<MovementLine> findByItemAndWarehouse(
            @Param("itemId") UUID itemId,
            @Param("warehouseId") UUID warehouseId
    );

    // ===== Deletion Queries =====

    /**
     * Delete all lines for a movement
     */
    void deleteByMovement_Id(UUID movementId);

    /**
     * Delete lines by status
     */
    void deleteByStatus(LineStatus status);
}
