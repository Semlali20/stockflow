package com.stock.purchaseservice.repository;

import com.stock.purchaseservice.entity.PurchaseOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseOrderLineRepository extends JpaRepository<PurchaseOrderLine, UUID> {

    /**
     * Find all lines for a purchase order
     */
    List<PurchaseOrderLine> findByPurchaseOrderId(UUID purchaseOrderId);

    /**
     * Find lines by item ID across all orders
     */
    List<PurchaseOrderLine> findByItemId(String itemId);

    /**
     * Delete all lines for a purchase order
     */
    void deleteByPurchaseOrderId(UUID purchaseOrderId);
}
