package com.stock.inventoryservice.repository;

import com.stock.inventoryservice.entity.Inventory;
import com.stock.inventoryservice.entity.InventoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {

    // ===== BASIC LOOKUPS =====

    /**
     * Find inventory by item and location
     */
    Optional<Inventory> findByItemIdAndLocationId(String itemId, String locationId);

    /**
     * Find all inventory records for a specific item
     */
    List<Inventory> findByItemId(String itemId);

    /**
     * Find all inventory records at a specific location
     */
    List<Inventory> findByLocationId(String locationId);

    /**
     * Find all inventory records in a specific warehouse
     */
    List<Inventory> findByWarehouseId(String warehouseId);

    /**
     * Find inventory by lot
     */
    List<Inventory> findByLotId(String lotId);

    /**
     * Find inventory by serial
     */
    Optional<Inventory> findBySerialId(String serialId);

    // ===== STATUS QUERIES =====

    /**
     * Find inventory by status
     */
    List<Inventory> findByStatus(InventoryStatus status);

    /**
     * Find inventory by item and status
     */
    List<Inventory> findByItemIdAndStatus(String itemId, InventoryStatus status);

    // ===== QUANTITY QUERIES =====

    /**
     * Find inventory records with available quantity greater than threshold
     */
    @Query("SELECT i FROM Inventory i WHERE (i.quantityOnHand - i.quantityReserved) > :threshold")
    List<Inventory> findWithAvailableQuantityGreaterThan(@Param("threshold") Double threshold);

    /**
     * Find inventory records with low stock (available < threshold)
     */
    @Query("SELECT i FROM Inventory i WHERE (i.quantityOnHand - i.quantityReserved) < :threshold " +
            "AND i.status = 'AVAILABLE'")
    List<Inventory> findLowStockItems(@Param("threshold") Double threshold);

    /**
     * Find inventory records with zero or negative available quantity
     */
    @Query("SELECT i FROM Inventory i WHERE (i.quantityOnHand - i.quantityReserved) <= 0")
    List<Inventory> findOutOfStockItems();

    // ===== AGGREGATE QUERIES =====

    /**
     * Get total quantity on hand for an item across all locations
     */
    @Query("SELECT SUM(i.quantityOnHand) FROM Inventory i WHERE i.itemId = :itemId")
    Double getTotalQuantityOnHandForItem(@Param("itemId") String itemId);

    /**
     * Get total available quantity for an item across all locations
     */
    @Query("SELECT SUM(i.quantityOnHand - i.quantityReserved) FROM Inventory i " +
            "WHERE i.itemId = :itemId AND i.status = 'AVAILABLE'")
    Double getTotalAvailableQuantityForItem(@Param("itemId") String itemId);

    /**
     * Get total quantity on hand for an item at a specific warehouse
     */
    @Query("SELECT SUM(i.quantityOnHand) FROM Inventory i " +
            "WHERE i.itemId = :itemId AND i.warehouseId = :warehouseId")
    Double getTotalQuantityOnHandForItemAtWarehouse(
            @Param("itemId") String itemId,
            @Param("warehouseId") String warehouseId);

    // ===== EXPIRY QUERIES =====

    /**
     * Find inventory records expiring before a specific date
     */
    @Query("SELECT i FROM Inventory i WHERE i.expiryDate <= :date AND i.expiryDate IS NOT NULL")
    List<Inventory> findExpiringBefore(@Param("date") LocalDate date);

    /**
     * Find inventory records expiring between two dates
     */
    @Query("SELECT i FROM Inventory i WHERE i.expiryDate BETWEEN :startDate AND :endDate")
    List<Inventory> findExpiringBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find expired inventory records
     */
    @Query("SELECT i FROM Inventory i WHERE i.expiryDate < CURRENT_DATE AND i.expiryDate IS NOT NULL")
    List<Inventory> findExpiredInventory();

    // ===== EXISTENCE CHECKS =====

    /**
     * Check if inventory exists for item at location
     */
    boolean existsByItemIdAndLocationId(String itemId, String locationId);

    /**
     * Check if any inventory exists for an item
     */
    boolean existsByItemId(String itemId);

    // ===== MULTI-CRITERIA QUERIES =====

    /**
     * Find inventory by item at a specific warehouse with available stock
     */
    @Query("SELECT i FROM Inventory i WHERE i.itemId = :itemId " +
            "AND i.warehouseId = :warehouseId " +
            "AND (i.quantityOnHand - i.quantityReserved) > 0 " +
            "AND i.status = 'AVAILABLE'")
    List<Inventory> findAvailableInventoryForItemAtWarehouse(
            @Param("itemId") String itemId,
            @Param("warehouseId") String warehouseId);

    /**
     * Find damaged inventory
     */
    @Query("SELECT i FROM Inventory i WHERE i.quantityDamaged > 0")
    List<Inventory> findInventoryWithDamage();

    // ===== UTILITY QUERIES =====

    /**
     * Get all distinct item IDs from inventory
     * Useful for cache warming
     */
    @Query("SELECT DISTINCT i.itemId FROM Inventory i")
    List<String> findAllDistinctItemIds();

    /**
     * Count inventory records by warehouse
     */
    Long countByWarehouseId(String warehouseId);

    /**
     * Count inventory records by location
     */
    Long countByLocationId(String locationId);

    /**
     * Find inventory records that need cycle count (not counted recently)
     */
    @Query("SELECT i FROM Inventory i WHERE i.lastCountDate < :date OR i.lastCountDate IS NULL")
    List<Inventory> findInventoryNeedingCycleCount(@Param("date") LocalDate date);

    // ===== ADDITIONAL QUERIES FOR SERVICE LAYER (ADDED IN STEP 5) =====

    /**
     * Find inventory records with quantity on hand less than threshold (for low stock alerts)
     */
    List<Inventory> findByQuantityOnHandLessThan(Double threshold);

    /**
     * Find inventory records expiring before a specific date (simple query method)
     */
    List<Inventory> findByExpiryDateBefore(LocalDate date);
}
