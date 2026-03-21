package com.stock.inventoryservice.repository;

import com.stock.inventoryservice.entity.Lot;
import com.stock.inventoryservice.entity.LotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LotRepository extends JpaRepository<Lot, String> {

    // ===== BASIC LOOKUPS =====

    /**
     * Find lot by unique business code
     */
    Optional<Lot> findByCode(String code);

    /**
     * Find lot by lot number
     */
    Optional<Lot> findByLotNumber(String lotNumber);

    /**
     * Find all lots for a specific item
     */
    List<Lot> findByItemId(String itemId);

    /**
     * Find lots by supplier
     */
    List<Lot> findBySupplierId(String supplierId);

    /**
     * Find lots by status
     */
    List<Lot> findByStatus(LotStatus status);

    // ===== EXPIRY QUERIES =====

    /**
     * Find lots expiring before a specific date
     */
    @Query("SELECT l FROM Lot l WHERE l.expiryDate <= :date AND l.expiryDate IS NOT NULL")
    List<Lot> findExpiringBefore(@Param("date") LocalDate date);

    /**
     * Find lots expiring between two dates
     */
    @Query("SELECT l FROM Lot l WHERE l.expiryDate BETWEEN :startDate AND :endDate")
    List<Lot> findExpiringBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find expired lots
     */
    @Query("SELECT l FROM Lot l WHERE l.expiryDate < CURRENT_DATE AND l.expiryDate IS NOT NULL")
    List<Lot> findExpiredLots();

    /**
     * Find lots expiring within N days
     */
    @Query("SELECT l FROM Lot l WHERE l.expiryDate <= :date " +
            "AND l.expiryDate > CURRENT_DATE " +
            "AND l.status = 'ACTIVE'")
    List<Lot> findLotsExpiringWithinDays(@Param("date") LocalDate date);

    // ===== ACTIVE LOTS QUERIES =====

    /**
     * Find active lots for an item (not expired, status ACTIVE)
     */
    @Query("SELECT l FROM Lot l WHERE l.itemId = :itemId " +
            "AND l.status = 'ACTIVE' " +
            "AND (l.expiryDate IS NULL OR l.expiryDate > CURRENT_DATE)")
    List<Lot> findActiveLotsForItem(@Param("itemId") String itemId);

    /**
     * Find active lots for an item ordered by expiry date (FEFO - First Expired First Out)
     */
    @Query("SELECT l FROM Lot l WHERE l.itemId = :itemId " +
            "AND l.status = 'ACTIVE' " +
            "AND (l.expiryDate IS NULL OR l.expiryDate > CURRENT_DATE) " +
            "ORDER BY l.expiryDate ASC NULLS LAST")
    List<Lot> findActiveLotsForItemOrderedByExpiry(@Param("itemId") String itemId);

    // ===== MULTI-CRITERIA QUERIES =====

    /**
     * Find lots by item and status
     */
    List<Lot> findByItemIdAndStatus(String itemId, LotStatus status);

    /**
     * Find lots manufactured between dates
     */
    @Query("SELECT l FROM Lot l WHERE l.manufactureDate BETWEEN :startDate AND :endDate")
    List<Lot> findByManufactureDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // ===== EXISTENCE CHECKS =====

    /**
     * Check if lot code exists
     */
    boolean existsByCode(String code);

    /**
     * Check if lot number exists
     */
    boolean existsByLotNumber(String lotNumber);

    /**
     * Check if any lots exist for an item
     */
    boolean existsByItemId(String itemId);

    // ===== UTILITY QUERIES =====

    /**
     * Count lots by status
     */
    Long countByStatus(LotStatus status);

    /**
     * Count lots for an item
     */
    Long countByItemId(String itemId);

    /**
     * Get all distinct item IDs that have lots
     */
    @Query("SELECT DISTINCT l.itemId FROM Lot l")
    List<String> findAllDistinctItemIds();

    // ===== ADDITIONAL QUERIES FOR SERVICE LAYER (ADDED IN STEP 5) =====

    /**
     * Find lots expiring before a specific date (simple query method)
     */
    List<Lot> findByExpiryDateBefore(LocalDate date);

    /**
     * Find lots expiring between two dates (simple query method)
     */
    List<Lot> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate);
}
