package com.stock.purchaseservice.service.impl;

import com.stock.purchaseservice.dto.request.PurchaseOrderLineRequest;
import com.stock.purchaseservice.dto.request.PurchaseOrderRequest;
import com.stock.purchaseservice.dto.request.ReceiveOrderRequest;
import com.stock.purchaseservice.dto.response.PurchaseOrderLineResponse;
import com.stock.purchaseservice.dto.response.PurchaseOrderResponse;
import com.stock.purchaseservice.entity.PurchaseOrder;
import com.stock.purchaseservice.entity.PurchaseOrderLine;
import com.stock.purchaseservice.enums.PurchaseOrderStatus;
import com.stock.purchaseservice.exception.ResourceNotFoundException;
import com.stock.purchaseservice.repository.PurchaseOrderLineRepository;
import com.stock.purchaseservice.repository.PurchaseOrderRepository;
import com.stock.purchaseservice.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderLineRepository purchaseOrderLineRepository;

    @Override
    public PurchaseOrderResponse createOrder(PurchaseOrderRequest request, String userId) {
        log.info("Creating new purchase order for supplier: {} by user: {}", request.getSupplierId(), userId);

        String reference = generateReference();

        PurchaseOrder order = PurchaseOrder.builder()
                .reference(reference)
                .supplierId(request.getSupplierId())
                .supplierName(request.getSupplierName())
                .inventoryId(request.getInventoryId())
                .status(PurchaseOrderStatus.DRAFT)
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .notes(request.getNotes())
                .createdBy(userId)
                .totalAmount(BigDecimal.ZERO)
                .build();

        // Build and attach lines
        if (request.getLines() != null) {
            for (PurchaseOrderLineRequest lineRequest : request.getLines()) {
                PurchaseOrderLine line = buildLine(lineRequest);
                order.addLine(line);
            }
        }

        // Compute total amount
        updateTotalAmount(order);

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);
        log.info("Purchase order created successfully with reference: {}", savedOrder.getReference());

        return mapToResponse(savedOrder);
    }

    @Override
    public PurchaseOrderResponse updateOrder(UUID id, PurchaseOrderRequest request) {
        log.info("Updating purchase order: {}", id);

        PurchaseOrder order = purchaseOrderRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new IllegalStateException(
                    "Cannot update purchase order in status: " + order.getStatus() +
                    ". Only DRAFT orders can be updated.");
        }

        order.setSupplierId(request.getSupplierId());
        order.setSupplierName(request.getSupplierName());
        order.setInventoryId(request.getInventoryId());
        order.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        order.setNotes(request.getNotes());

        // Replace all lines
        order.getLines().clear();
        if (request.getLines() != null) {
            for (PurchaseOrderLineRequest lineRequest : request.getLines()) {
                PurchaseOrderLine line = buildLine(lineRequest);
                order.addLine(line);
            }
        }

        updateTotalAmount(order);

        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        log.info("Purchase order updated successfully: {}", id);

        return mapToResponse(updatedOrder);
    }

    @Override
    public void deleteOrder(UUID id) {
        log.info("Deleting purchase order: {}", id);

        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT &&
                order.getStatus() != PurchaseOrderStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Cannot delete purchase order in status: " + order.getStatus() +
                    ". Only DRAFT or CANCELLED orders can be deleted.");
        }

        purchaseOrderRepository.delete(order);
        log.info("Purchase order deleted successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getOrderById(UUID id) {
        log.info("Fetching purchase order: {}", id);

        PurchaseOrder order = purchaseOrderRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> getAllOrders(PurchaseOrderStatus status, String supplierId, Pageable pageable) {
        log.info("Fetching all purchase orders - status: {}, supplierId: {}", status, supplierId);

        if (status != null && supplierId != null) {
            return purchaseOrderRepository.findByStatusAndSupplierId(status, supplierId, pageable)
                    .map(this::mapToResponse);
        } else if (status != null) {
            return purchaseOrderRepository.findByStatus(status, pageable)
                    .map(this::mapToResponse);
        } else if (supplierId != null) {
            return purchaseOrderRepository.findBySupplierId(supplierId, pageable)
                    .map(this::mapToResponse);
        }

        return purchaseOrderRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getOrdersBySupplier(String supplierId) {
        log.info("Fetching purchase orders for supplier: {}", supplierId);

        return purchaseOrderRepository.findBySupplierId(supplierId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PurchaseOrderResponse confirmOrder(UUID id) {
        log.info("Confirming purchase order: {}", id);

        PurchaseOrder order = purchaseOrderRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT) {
            throw new IllegalStateException(
                    "Cannot confirm purchase order in status: " + order.getStatus() +
                    ". Only DRAFT orders can be confirmed.");
        }

        if (order.getLines().isEmpty()) {
            throw new IllegalStateException("Cannot confirm a purchase order with no lines.");
        }

        order.setStatus(PurchaseOrderStatus.CONFIRMED);
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        log.info("Purchase order confirmed: {}", id);

        return mapToResponse(updatedOrder);
    }

    @Override
    public PurchaseOrderResponse sendOrder(UUID id) {
        log.info("Sending purchase order: {}", id);

        PurchaseOrder order = purchaseOrderRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));

        if (order.getStatus() != PurchaseOrderStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Cannot send purchase order in status: " + order.getStatus() +
                    ". Only CONFIRMED orders can be sent.");
        }

        order.setStatus(PurchaseOrderStatus.SENT);
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        log.info("Purchase order sent to supplier: {}", id);

        return mapToResponse(updatedOrder);
    }

    @Override
    public PurchaseOrderResponse receiveOrder(UUID id, ReceiveOrderRequest request) {
        log.info("Receiving goods for purchase order: {}", id);

        PurchaseOrder order = purchaseOrderRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));

        if (order.getStatus() != PurchaseOrderStatus.SENT &&
                order.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new IllegalStateException(
                    "Cannot receive goods for purchase order in status: " + order.getStatus() +
                    ". Only SENT or PARTIALLY_RECEIVED orders can receive goods.");
        }

        // Build a lookup map from line ID to line entity
        Map<UUID, PurchaseOrderLine> lineMap = order.getLines().stream()
                .collect(Collectors.toMap(PurchaseOrderLine::getId, Function.identity()));

        // Apply received quantities
        for (ReceiveOrderRequest.ReceivedLineRequest receivedLine : request.getLines()) {
            PurchaseOrderLine line = lineMap.get(receivedLine.getLineId());
            if (line == null) {
                throw new ResourceNotFoundException("PurchaseOrderLine", "id", receivedLine.getLineId());
            }

            int newReceivedQty = line.getReceivedQuantity() + receivedLine.getReceivedQuantity();
            if (newReceivedQty > line.getOrderedQuantity()) {
                throw new IllegalArgumentException(
                        "Received quantity for line " + receivedLine.getLineId() +
                        " (" + newReceivedQty + ") exceeds ordered quantity (" + line.getOrderedQuantity() + ").");
            }

            line.setReceivedQuantity(newReceivedQty);
        }

        // Determine new status: RECEIVED if all lines fully received, else PARTIALLY_RECEIVED
        boolean allReceived = order.getLines().stream()
                .allMatch(line -> line.getReceivedQuantity() >= line.getOrderedQuantity());

        order.setStatus(allReceived ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIALLY_RECEIVED);

        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        log.info("Purchase order {} updated to status: {}", id, updatedOrder.getStatus());

        return mapToResponse(updatedOrder);
    }

    @Override
    public PurchaseOrderResponse cancelOrder(UUID id) {
        log.info("Cancelling purchase order: {}", id);

        PurchaseOrder order = purchaseOrderRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));

        if (order.getStatus() != PurchaseOrderStatus.DRAFT &&
                order.getStatus() != PurchaseOrderStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Cannot cancel purchase order in status: " + order.getStatus() +
                    ". Only DRAFT or CONFIRMED orders can be cancelled.");
        }

        order.setStatus(PurchaseOrderStatus.CANCELLED);
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        log.info("Purchase order cancelled: {}", id);

        return mapToResponse(updatedOrder);
    }

    // ===== Private Helper Methods =====

    /**
     * Generate a unique purchase order reference in the format PO-{YEAR}-{SEQ}
     */
    private String generateReference() {
        int year = LocalDate.now().getYear();
        String prefix = "PO-" + year + "-";

        List<String> existingRefs = purchaseOrderRepository.findReferencesByPrefix(prefix);

        int nextSeq = 1;
        if (!existingRefs.isEmpty()) {
            // Parse the highest existing sequence number
            String lastRef = existingRefs.get(0);
            try {
                String seqPart = lastRef.substring(prefix.length());
                nextSeq = Integer.parseInt(seqPart) + 1;
            } catch (NumberFormatException | IndexOutOfBoundsException e) {
                log.warn("Could not parse sequence from reference: {}", lastRef);
            }
        }

        String reference = prefix + String.format("%04d", nextSeq);

        // Ensure uniqueness (in case of race conditions)
        while (purchaseOrderRepository.existsByReference(reference)) {
            nextSeq++;
            reference = prefix + String.format("%04d", nextSeq);
        }

        return reference;
    }

    /**
     * Build a PurchaseOrderLine entity from a request DTO
     */
    private PurchaseOrderLine buildLine(PurchaseOrderLineRequest lineRequest) {
        BigDecimal totalPrice = lineRequest.getUnitPrice() != null && lineRequest.getOrderedQuantity() != null
                ? lineRequest.getUnitPrice().multiply(BigDecimal.valueOf(lineRequest.getOrderedQuantity()))
                : BigDecimal.ZERO;

        return PurchaseOrderLine.builder()
                .itemId(lineRequest.getItemId())
                .itemName(lineRequest.getItemName())
                .itemSku(lineRequest.getItemSku())
                .orderedQuantity(lineRequest.getOrderedQuantity())
                .receivedQuantity(0)
                .unitPrice(lineRequest.getUnitPrice())
                .totalPrice(totalPrice)
                .notes(lineRequest.getNotes())
                .build();
    }

    /**
     * Recalculate and set the total amount on the order from all its lines
     */
    private void updateTotalAmount(PurchaseOrder order) {
        BigDecimal total = order.getLines().stream()
                .map(line -> {
                    if (line.getUnitPrice() != null && line.getOrderedQuantity() != null) {
                        return line.getUnitPrice().multiply(BigDecimal.valueOf(line.getOrderedQuantity()));
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total);
    }

    /**
     * Map a PurchaseOrderLine entity to its response DTO
     */
    private PurchaseOrderLineResponse mapLineToResponse(PurchaseOrderLine line) {
        int remaining = line.getOrderedQuantity() - line.getReceivedQuantity();
        boolean fullyReceived = line.getReceivedQuantity() >= line.getOrderedQuantity();

        return PurchaseOrderLineResponse.builder()
                .id(line.getId())
                .itemId(line.getItemId())
                .itemName(line.getItemName())
                .itemSku(line.getItemSku())
                .orderedQuantity(line.getOrderedQuantity())
                .receivedQuantity(line.getReceivedQuantity())
                .unitPrice(line.getUnitPrice())
                .totalPrice(line.getTotalPrice())
                .notes(line.getNotes())
                .remainingQuantity(remaining)
                .fullyReceived(fullyReceived)
                .build();
    }

    /**
     * Map a PurchaseOrder entity to its response DTO
     */
    private PurchaseOrderResponse mapToResponse(PurchaseOrder order) {
        List<PurchaseOrderLineResponse> lineResponses = order.getLines().stream()
                .map(this::mapLineToResponse)
                .collect(Collectors.toList());

        long fullyReceivedLines = order.getLines().stream()
                .filter(l -> l.getReceivedQuantity() >= l.getOrderedQuantity())
                .count();

        long partiallyReceivedLines = order.getLines().stream()
                .filter(l -> l.getReceivedQuantity() > 0 && l.getReceivedQuantity() < l.getOrderedQuantity())
                .count();

        return PurchaseOrderResponse.builder()
                .id(order.getId())
                .reference(order.getReference())
                .supplierId(order.getSupplierId())
                .supplierName(order.getSupplierName())
                .inventoryId(order.getInventoryId())
                .status(order.getStatus())
                .expectedDeliveryDate(order.getExpectedDeliveryDate())
                .notes(order.getNotes())
                .totalAmount(order.getTotalAmount())
                .createdBy(order.getCreatedBy())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .lines(lineResponses)
                .totalLines(order.getLines().size())
                .fullyReceivedLines((int) fullyReceivedLines)
                .partiallyReceivedLines((int) partiallyReceivedLines)
                .build();
    }
}
