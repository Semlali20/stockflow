package com.stock.purchaseservice.controller;

import com.stock.purchaseservice.dto.request.PurchaseOrderRequest;
import com.stock.purchaseservice.dto.request.ReceiveOrderRequest;
import com.stock.purchaseservice.dto.response.PageResponse;
import com.stock.purchaseservice.dto.response.PurchaseOrderResponse;
import com.stock.purchaseservice.enums.PurchaseOrderStatus;
import com.stock.purchaseservice.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Purchase Order Management", description = "APIs for managing purchase orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    /**
     * Create a new purchase order
     */
    @PostMapping
    @Operation(summary = "Create a new purchase order", description = "Creates a new purchase order in DRAFT status")
    public ResponseEntity<PurchaseOrderResponse> createOrder(
            @Valid @RequestBody PurchaseOrderRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        log.info("REST request to create purchase order for supplier: {} by user: {}",
                request.getSupplierId(), userId);

        if (userId == null) {
            userId = "anonymous";
        }

        PurchaseOrderResponse response = purchaseOrderService.createOrder(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all purchase orders with pagination and optional filters
     */
    @GetMapping
    @Operation(summary = "Get all purchase orders",
            description = "Retrieves all purchase orders with pagination; optionally filter by status and/or supplierId")
    public ResponseEntity<PageResponse<PurchaseOrderResponse>> getAllOrders(
            @Parameter(description = "Filter by status") @RequestParam(required = false) PurchaseOrderStatus status,
            @Parameter(description = "Filter by supplier ID") @RequestParam(required = false) String supplierId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("REST request to get all purchase orders - status: {}, supplierId: {}", status, supplierId);

        Page<PurchaseOrderResponse> page = purchaseOrderService.getAllOrders(status, supplierId, pageable);
        return ResponseEntity.ok(PageResponse.from(page));
    }

    /**
     * Get purchase order by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID", description = "Retrieves a purchase order with all its lines")
    public ResponseEntity<PurchaseOrderResponse> getOrderById(
            @Parameter(description = "Purchase Order UUID") @PathVariable UUID id) {

        log.info("REST request to get purchase order: {}", id);

        PurchaseOrderResponse response = purchaseOrderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Update a purchase order (DRAFT only)
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update purchase order",
            description = "Updates an existing purchase order. Only DRAFT orders can be updated.")
    public ResponseEntity<PurchaseOrderResponse> updateOrder(
            @Parameter(description = "Purchase Order UUID") @PathVariable UUID id,
            @Valid @RequestBody PurchaseOrderRequest request) {

        log.info("REST request to update purchase order: {}", id);

        PurchaseOrderResponse response = purchaseOrderService.updateOrder(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a purchase order (DRAFT or CANCELLED only)
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete purchase order",
            description = "Deletes a purchase order. Only DRAFT or CANCELLED orders can be deleted.")
    public ResponseEntity<Void> deleteOrder(
            @Parameter(description = "Purchase Order UUID") @PathVariable UUID id) {

        log.info("REST request to delete purchase order: {}", id);

        purchaseOrderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Confirm a purchase order (DRAFT -> CONFIRMED)
     */
    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm purchase order",
            description = "Confirms a purchase order, transitioning it from DRAFT to CONFIRMED")
    public ResponseEntity<PurchaseOrderResponse> confirmOrder(
            @Parameter(description = "Purchase Order UUID") @PathVariable UUID id) {

        log.info("REST request to confirm purchase order: {}", id);

        PurchaseOrderResponse response = purchaseOrderService.confirmOrder(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Send a purchase order to supplier (CONFIRMED -> SENT)
     */
    @PostMapping("/{id}/send")
    @Operation(summary = "Send purchase order to supplier",
            description = "Sends a confirmed purchase order to the supplier, transitioning it to SENT")
    public ResponseEntity<PurchaseOrderResponse> sendOrder(
            @Parameter(description = "Purchase Order UUID") @PathVariable UUID id) {

        log.info("REST request to send purchase order: {}", id);

        PurchaseOrderResponse response = purchaseOrderService.sendOrder(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Receive goods against a purchase order (partial or full)
     */
    @PostMapping("/{id}/receive")
    @Operation(summary = "Receive goods",
            description = "Records receipt of goods against a purchase order. " +
                    "Updates the order status to PARTIALLY_RECEIVED or RECEIVED.")
    public ResponseEntity<PurchaseOrderResponse> receiveOrder(
            @Parameter(description = "Purchase Order UUID") @PathVariable UUID id,
            @Valid @RequestBody ReceiveOrderRequest request) {

        log.info("REST request to receive goods for purchase order: {}", id);

        PurchaseOrderResponse response = purchaseOrderService.receiveOrder(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel a purchase order (DRAFT or CONFIRMED only)
     */
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel purchase order",
            description = "Cancels a purchase order. Only DRAFT or CONFIRMED orders can be cancelled.")
    public ResponseEntity<PurchaseOrderResponse> cancelOrder(
            @Parameter(description = "Purchase Order UUID") @PathVariable UUID id) {

        log.info("REST request to cancel purchase order: {}", id);

        PurchaseOrderResponse response = purchaseOrderService.cancelOrder(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all purchase orders for a specific supplier
     */
    @GetMapping("/supplier/{supplierId}")
    @Operation(summary = "Get orders by supplier",
            description = "Retrieves all purchase orders for a specific supplier")
    public ResponseEntity<List<PurchaseOrderResponse>> getOrdersBySupplier(
            @Parameter(description = "Supplier ID") @PathVariable String supplierId) {

        log.info("REST request to get purchase orders for supplier: {}", supplierId);

        List<PurchaseOrderResponse> response = purchaseOrderService.getOrdersBySupplier(supplierId);
        return ResponseEntity.ok(response);
    }
}
