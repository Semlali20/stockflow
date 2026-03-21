package com.stock.inventoryservice.repository;

import com.stock.inventoryservice.entity.Serial;
import com.stock.inventoryservice.entity.SerialStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SerialRepository extends JpaRepository<Serial, String> {

    // ===== BASIC LOOKUPS =====

    /**
     * Find serial by unique business code
     */
    Optional<Serial> findByCode(String code);

    /**
     * Find serial by serial number
     */
    Optional<Serial> findBySerialNumber(String serialNumber);

    /**
     * Find all serials for a specific item
     */
    List<Serial> findByItemId(String itemId);

    /**
     * Find serials by status
     */
    List<Serial> findByStatus(SerialStatus status);

    /**
     * Find serials at a specific location
     */
    List<Serial> findByLocationId(String locationId);

    // ===== LOT-RELATED QUERIES (ADDED FIX) =====

    /**
     * Find serials by lot ID
     */
    @Query("SELECT s FROM Serial s WHERE s.itemId IN (SELECT i.itemId FROM Inventory i WHERE i.lotId = :lotId)")
    List<Serial> findByLotId(@Param("lotId") String lotId);

    /**
     * Count serials by lot ID
     */
    @Query("SELECT COUNT(s) FROM Serial s WHERE s.itemId IN (SELECT i.itemId FROM Inventory i WHERE i.lotId = :lotId)")
    Long countByLotId(@Param("lotId") String lotId);

    // ===== MULTI-CRITERIA QUERIES =====

    /**
     * Find serials by item and status
     */
    List<Serial> findByItemIdAndStatus(String itemId, SerialStatus status);

    /**
     * Find serials by item at a specific location
     */
    List<Serial> findByItemIdAndLocationId(String itemId, String locationId);

    /**
     * Find available serials for an item
     */
    @Query("SELECT s FROM Serial s WHERE s.itemId = :itemId AND s.status = 'IN_STOCK'")
    List<Serial> findAvailableSerialsForItem(@Param("itemId") String itemId);

    /**
     * Find available serials for an item at a specific location
     */
    @Query("SELECT s FROM Serial s WHERE s.itemId = :itemId " +
            "AND s.locationId = :locationId " +
            "AND s.status = 'IN_STOCK'")
    List<Serial> findAvailableSerialsForItemAtLocation(
            @Param("itemId") String itemId,
            @Param("locationId") String locationId);

    // ===== STATUS QUERIES =====

    /**
     * Find all in-stock serials
     */
    List<Serial> findByStatusIn(List<SerialStatus> statuses);

    /**
     * Find serials that are quarantined
     */
    @Query("SELECT s FROM Serial s WHERE s.status = 'DEFECTIVE'")
    List<Serial> findQuarantinedSerials();

    /**
     * Find serials that are damaged
     */
    @Query("SELECT s FROM Serial s WHERE s.status = 'DEFECTIVE'")
    List<Serial> findDamagedSerials();

    /**
     * Find serials that are returned
     */
    @Query("SELECT s FROM Serial s WHERE s.status = 'RETURNING'")
    List<Serial> findReturnedSerials();

    // ===== EXISTENCE CHECKS =====

    /**
     * Check if serial code exists
     */
    boolean existsByCode(String code);

    /**
     * Check if serial number exists
     */
    boolean existsBySerialNumber(String serialNumber);

    /**
     * Check if any serials exist for an item
     */
    boolean existsByItemId(String itemId);

    // ===== UTILITY QUERIES =====

    /**
     * Count serials by status
     */
    Long countByStatus(SerialStatus status);

    /**
     * Count serials for an item
     */
    Long countByItemId(String itemId);

    /**
     * Count serials at a location
     */
    Long countByLocationId(String locationId);

    /**
     * Get all distinct item IDs that have serials
     */
    @Query("SELECT DISTINCT s.itemId FROM Serial s")
    List<String> findAllDistinctItemIds();

    /**
     * Find serials by partial serial number (for search)
     */
    @Query("SELECT s FROM Serial s WHERE LOWER(s.serialNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Serial> searchBySerialNumber(@Param("keyword") String keyword);
}
