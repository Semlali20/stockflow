package com.stock.purchaseservice.service;

import com.stock.purchaseservice.dto.request.PurchaseOrderRequest;
import com.stock.purchaseservice.dto.request.ReceiveOrderRequest;
import com.stock.purchaseservice.dto.response.PurchaseOrderResponse;
import com.stock.purchaseservice.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PurchaseOrderService {

    /**
     * Create a new purchase order (starts as DRAFT)
     */
    PurchaseOrderResponse createOrder(PurchaseOrderRequest request, String userId);

    /**
     * Update an existing purchase order (only in DRAFT status)
     */
    PurchaseOrderResponse updateOrder(UUID id, PurchaseOrderRequest request);

    /**
     * Delete a purchase order (only DRAFT or CANCELLED)
     */
    void deleteOrder(UUID id);

    /**
     * Get purchase order by ID
     */
    PurchaseOrderResponse getOrderById(UUID id);

    /**
     * Get all purchase orders with pagination, optionally filtered by status and/or supplierId
     */
    Page<PurchaseOrderResponse> getAllOrders(PurchaseOrderStatus status, String supplierId, Pageable pageable);

    /**
     * Get all orders for a specific supplier
     */
    List<PurchaseOrderResponse> getOrdersBySupplier(String supplierId);

    /**
     * Confirm a purchase order: DRAFT -> CONFIRMED
     */
    PurchaseOrderResponse confirmOrder(UUID id);

    /**
     * Send a purchase order to supplier: CONFIRMED -> SENT
     */
    PurchaseOrderResponse sendOrder(UUID id);

    /**
     * Receive goods against a purchase order (partial or full)
     * SENT or PARTIALLY_RECEIVED -> PARTIALLY_RECEIVED or RECEIVED
     */
    PurchaseOrderResponse receiveOrder(UUID id, ReceiveOrderRequest request);

    /**
     * Cancel a purchase order: DRAFT or CONFIRMED -> CANCELLED
     */
    PurchaseOrderResponse cancelOrder(UUID id);
}
