package com.stock.purchaseservice.repository;

import com.stock.purchaseservice.entity.PurchaseOrder;
import com.stock.purchaseservice.enums.PurchaseOrderStatus;
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
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    /**
     * Find order by reference number
     */
    Optional<PurchaseOrder> findByReference(String reference);

    /**
     * Check if reference number exists
     */
    boolean existsByReference(String reference);

    /**
     * Find orders by supplier ID
     */
    List<PurchaseOrder> findBySupplierId(String supplierId);

    /**
     * Find orders by supplier ID with pagination
     */
    Page<PurchaseOrder> findBySupplierId(String supplierId, Pageable pageable);

    /**
     * Find orders by status
     */
    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);

    /**
     * Find orders by status with pagination
     */
    Page<PurchaseOrder> findByStatus(PurchaseOrderStatus status, Pageable pageable);

    /**
     * Find orders by status and supplier
     */
    Page<PurchaseOrder> findByStatusAndSupplierId(PurchaseOrderStatus status, String supplierId, Pageable pageable);

    /**
     * Find all orders with pagination
     */
    Page<PurchaseOrder> findAll(Pageable pageable);

    /**
     * Find order by ID with lines eagerly loaded
     */
    @Query("SELECT po FROM PurchaseOrder po LEFT JOIN FETCH po.lines WHERE po.id = :id")
    Optional<PurchaseOrder> findByIdWithLines(@Param("id") UUID id);

    /**
     * Count orders by status
     */
    long countByStatus(PurchaseOrderStatus status);

    /**
     * Count orders by supplier
     */
    long countBySupplierId(String supplierId);

    /**
     * Find the maximum reference sequence for a given year prefix
     */
    @Query("SELECT po.reference FROM PurchaseOrder po WHERE po.reference LIKE :prefix% ORDER BY po.reference DESC")
    List<String> findReferencesByPrefix(@Param("prefix") String prefix);
}
