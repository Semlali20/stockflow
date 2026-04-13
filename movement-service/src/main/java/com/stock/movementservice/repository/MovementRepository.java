package com.stock.movementservice.repository;

import com.stock.movementservice.entity.Movement;
import com.stock.movementservice.entity.enums.MovementStatus;
import com.stock.movementservice.entity.enums.MovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MovementRepository extends JpaRepository<Movement, UUID>,
        JpaSpecificationExecutor<Movement> {

    // ===== Basic Queries =====

    /**
     * Find movement by reference number
     */
    Optional<Movement> findByReferenceNumber(String referenceNumber);

    /**
     * Check if reference number exists
     */
    boolean existsByReferenceNumber(String referenceNumber);

    // ===== Status-based Queries =====

    /**
     * Find all movements by status
     */
    List<Movement> findByStatus(MovementStatus status);

    /**
     * Find movements by status with pagination
     */
    Page<Movement> findByStatus(MovementStatus status, Pageable pageable);

    /**
     * Find movements by multiple statuses
     */
    List<Movement> findByStatusIn(List<MovementStatus> statuses);

    /**
     * Find movements by status and type
     */
    Page<Movement> findByStatusAndType(MovementStatus status, MovementType type, Pageable pageable);

    // ===== Type-based Queries =====

    /**
     * Find movements by type
     */
    Page<Movement> findByType(MovementType type, Pageable pageable);

    /**
     * Find movements by type and warehouse
     */
    List<Movement> findByTypeAndWarehouseId(MovementType type, UUID warehouseId);

    // ===== Warehouse-based Queries =====

    /**
     * Find all movements for a warehouse
     */
    Page<Movement> findByWarehouseId(UUID warehouseId, Pageable pageable);

    /**
     * Find movements by warehouse and status
     */
    Page<Movement> findByWarehouseIdAndStatus(UUID warehouseId, MovementStatus status, Pageable pageable);

    /**
     * Find movements by warehouse and type
     */
    List<Movement> findByWarehouseIdAndType(UUID warehouseId, MovementType type);

    // ===== Location-based Queries =====

    /**
     * Find movements by source location
     */
    List<Movement> findBySourceLocationId(UUID sourceLocationId);

    /**
     * Find movements by destination location
     */
    List<Movement> findByDestinationLocationId(UUID destinationLocationId);

    /**
     * Find movements by source or destination location
     */
    @Query("SELECT m FROM Movement m WHERE m.sourceLocationId = :locationId OR m.destinationLocationId = :locationId")
    List<Movement> findBySourceOrDestinationLocation(@Param("locationId") UUID locationId);

    /**
     * Find movements between two locations
     */
    @Query("SELECT m FROM Movement m WHERE m.sourceLocationId = :sourceId AND m.destinationLocationId = :destId")
    List<Movement> findBySourceAndDestinationLocation(
            @Param("sourceId") UUID sourceLocationId,
            @Param("destId") UUID destinationLocationId
    );

    // ===== User-based Queries =====

    /**
     * Find movements created by user
     */
    Page<Movement> findByCreatedBy(UUID userId, Pageable pageable);

    /**
     * Find movements where user is source or destination
     */
    @Query("SELECT m FROM Movement m WHERE m.sourceUserId = :userId OR m.destinationUserId = :userId")
    List<Movement> findBySourceOrDestinationUser(@Param("userId") UUID userId);

    // ===== Date-based Queries =====

    /**
     * Find movements within date range
     */
    @Query("SELECT m FROM Movement m WHERE m.movementDate BETWEEN :startDate AND :endDate")
    List<Movement> findByMovementDateBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find movements by expected date range
     */
    List<Movement> findByExpectedDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find overdue movements (expected date passed but not completed)
     */
    @Query("SELECT m FROM Movement m WHERE m.expectedDate < :currentDate " +
            "AND m.status NOT IN (com.stock.movementservice.entity.enums.MovementStatus.COMPLETED, " +
            "com.stock.movementservice.entity.enums.MovementStatus.CANCELLED)")
    List<Movement> findOverdueMovements(@Param("currentDate") LocalDateTime currentDate);

    /**
     * Find movements created within date range
     */
    List<Movement> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // ===== Complex Queries with Fetch =====

    /**
     * Find movement by ID with lines
     */
    @Query("SELECT m FROM Movement m LEFT JOIN FETCH m.lines WHERE m.id = :id")
    Optional<Movement> findByIdWithLines(@Param("id") UUID id);

    /**
     * Find movement by ID with tasks
     */
    @Query("SELECT m FROM Movement m LEFT JOIN FETCH m.tasks WHERE m.id = :id")
    Optional<Movement> findByIdWithTasks(@Param("id") UUID id);

    /**
     * Find movement by ID with lines and tasks
     */
    @Query("SELECT DISTINCT m FROM Movement m " +
    "LEFT JOIN FETCH m.lines " +
    "LEFT JOIN FETCH m.tasks " +
    "WHERE m.id = :id")
Optional<Movement> findByIdWithLinesAndTasks(@Param("id") UUID id);

    // ===== Statistics and Aggregation Queries =====

    /**
     * Count movements by status
     */
    long countByStatus(MovementStatus status);

    /**
     * Count movements by type and warehouse
     */
    long countByTypeAndWarehouseId(MovementType type, UUID warehouseId);

    /**
     * Count movements by warehouse and status
     */
    long countByWarehouseIdAndStatus(UUID warehouseId, MovementStatus status);

    /**
     * Count pending movements for a warehouse
     */
    @Query("SELECT COUNT(m) FROM Movement m WHERE m.warehouseId = :warehouseId " +
            "AND m.status IN (com.stock.movementservice.entity.enums.MovementStatus.DRAFT, " +
            "com.stock.movementservice.entity.enums.MovementStatus.PENDING, " +
            "com.stock.movementservice.entity.enums.MovementStatus.IN_PROGRESS)")
    long countPendingMovementsByWarehouse(@Param("warehouseId") UUID warehouseId);

    /**
     * Get movement statistics by warehouse
     */
    @Query("SELECT m.status, COUNT(m) FROM Movement m WHERE m.warehouseId = :warehouseId GROUP BY m.status")
    List<Object[]> getMovementStatisticsByWarehouse(@Param("warehouseId") UUID warehouseId);

    /**
     * Get movement statistics by type
     */
    @Query("SELECT m.type, COUNT(m) FROM Movement m WHERE m.warehouseId = :warehouseId " +
            "AND m.movementDate BETWEEN :startDate AND :endDate GROUP BY m.type")
    List<Object[]> getMovementStatisticsByType(
            @Param("warehouseId") UUID warehouseId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // ===== Search Queries =====

    /**
     * Search movements by reference number or notes (partial match)
     */
    @Query("SELECT m FROM Movement m WHERE " +
            "LOWER(m.referenceNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(m.notes) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Movement> searchMovements(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Advanced search with multiple criteria
     */
    @Query("SELECT m FROM Movement m WHERE " +
            "(:warehouseId IS NULL OR m.warehouseId = :warehouseId) AND " +
            "(:type IS NULL OR m.type = :type) AND " +
            "(:status IS NULL OR m.status = :status) AND " +
            "(:startDate IS NULL OR m.movementDate >= :startDate) AND " +
            "(:endDate IS NULL OR m.movementDate <= :endDate)")
    Page<Movement> advancedSearch(
            @Param("warehouseId") UUID warehouseId,
            @Param("type") MovementType type,
            @Param("status") MovementStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    // ===== Deletion Queries =====

    /**
     * Delete movements by status (for cleanup)
     */
    void deleteByStatus(MovementStatus status);

    /**
     * Delete old draft movements
     */
    @Query("DELETE FROM Movement m WHERE m.status = com.stock.movementservice.entity.enums.MovementStatus.DRAFT " +
            "AND m.createdAt < :cutoffDate")
    void deleteOldDraftMovements(@Param("cutoffDate") LocalDateTime cutoffDate);
}
