package com.stock.salesservice.service.impl;

import com.stock.salesservice.dto.request.DeliveryNoteRequest;
import com.stock.salesservice.dto.response.DeliveryNoteLineResponse;
import com.stock.salesservice.dto.response.DeliveryNoteResponse;
import com.stock.salesservice.entity.DeliveryNote;
import com.stock.salesservice.entity.DeliveryNoteLine;
import com.stock.salesservice.enums.DeliveryNoteStatus;
import com.stock.salesservice.exception.BusinessException;
import com.stock.salesservice.exception.ResourceNotFoundException;
import com.stock.salesservice.repository.DeliveryNoteRepository;
import com.stock.salesservice.service.DeliveryNoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DeliveryNoteServiceImpl implements DeliveryNoteService {

    private final DeliveryNoteRepository deliveryNoteRepository;
    private final RestTemplate restTemplate;

    @Value("${services.inventory-service.url:http://localhost:8086}")
    private String inventoryServiceUrl;

    @Override
    public DeliveryNoteResponse createDeliveryNote(DeliveryNoteRequest request, String createdBy) {
        log.info("Creating delivery note for customer: {}", request.getCustomerId());

        String reference = generateDeliveryNoteReference();

        DeliveryNote deliveryNote = DeliveryNote.builder()
                .reference(reference)
                .quoteId(request.getQuoteId())
                .customerId(request.getCustomerId())
                .customerName(request.getCustomerName())
                .inventoryId(request.getInventoryId())
                .locationId(request.getLocationId())
                .status(DeliveryNoteStatus.DRAFT)
                .deliveryDate(request.getDeliveryDate())
                .deliveryAddress(request.getDeliveryAddress())
                .notes(request.getNotes())
                .createdBy(createdBy)
                .lines(new ArrayList<>())
                .build();

        if (request.getLines() != null) {
            request.getLines().forEach(lineReq -> {
                DeliveryNoteLine line = DeliveryNoteLine.builder()
                        .itemId(lineReq.getItemId())
                        .itemName(lineReq.getItemName())
                        .itemSku(lineReq.getItemSku())
                        .orderedQuantity(lineReq.getOrderedQuantity())
                        .deliveredQuantity(lineReq.getDeliveredQuantity() != null ? lineReq.getDeliveredQuantity() : 0)
                        .lotId(lineReq.getLotId())
                        .serialId(lineReq.getSerialId())
                        .unitPrice(lineReq.getUnitPrice())
                        .discountPercent(lineReq.getDiscountPercent())
                        .totalPrice(lineReq.getTotalPrice())
                        .notes(lineReq.getNotes())
                        .build();
                deliveryNote.addLine(line);
            });
        }

        DeliveryNote saved = deliveryNoteRepository.save(deliveryNote);
        log.info("Delivery note created with reference: {}", saved.getReference());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryNoteResponse getDeliveryNoteById(UUID id) {
        log.info("Fetching delivery note with ID: {}", id);
        DeliveryNote deliveryNote = deliveryNoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryNote", id));
        return toResponse(deliveryNote);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DeliveryNoteResponse> getAllDeliveryNotes(DeliveryNoteStatus status, String customerId, Pageable pageable) {
        log.info("Fetching delivery notes - status: {}, customerId: {}", status, customerId);
        if (status != null && customerId != null) {
            return deliveryNoteRepository.findByStatusAndCustomerId(status, customerId, pageable).map(this::toResponse);
        } else if (status != null) {
            return deliveryNoteRepository.findByStatus(status, pageable).map(this::toResponse);
        } else if (customerId != null) {
            return deliveryNoteRepository.findByCustomerId(customerId, pageable).map(this::toResponse);
        }
        return deliveryNoteRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public DeliveryNoteResponse updateDeliveryNote(UUID id, DeliveryNoteRequest request) {
        log.info("Updating delivery note: {}", id);

        DeliveryNote deliveryNote = deliveryNoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryNote", id));

        if (deliveryNote.getStatus() != DeliveryNoteStatus.DRAFT) {
            throw new BusinessException("Delivery note can only be updated when in DRAFT status. Current status: " + deliveryNote.getStatus());
        }

        if (request.getCustomerId() != null) deliveryNote.setCustomerId(request.getCustomerId());
        if (request.getCustomerName() != null) deliveryNote.setCustomerName(request.getCustomerName());
        if (request.getDeliveryDate() != null) deliveryNote.setDeliveryDate(request.getDeliveryDate());
        if (request.getDeliveryAddress() != null) deliveryNote.setDeliveryAddress(request.getDeliveryAddress());
        if (request.getNotes() != null) deliveryNote.setNotes(request.getNotes());
        if (request.getInventoryId() != null) deliveryNote.setInventoryId(request.getInventoryId());
        if (request.getLocationId() != null) deliveryNote.setLocationId(request.getLocationId());

        // Replace lines
        deliveryNote.getLines().clear();
        if (request.getLines() != null) {
            request.getLines().forEach(lineReq -> {
                DeliveryNoteLine line = DeliveryNoteLine.builder()
                        .itemId(lineReq.getItemId())
                        .itemName(lineReq.getItemName())
                        .itemSku(lineReq.getItemSku())
                        .orderedQuantity(lineReq.getOrderedQuantity())
                        .deliveredQuantity(lineReq.getDeliveredQuantity() != null ? lineReq.getDeliveredQuantity() : 0)
                        .lotId(lineReq.getLotId())
                        .serialId(lineReq.getSerialId())
                        .unitPrice(lineReq.getUnitPrice())
                        .discountPercent(lineReq.getDiscountPercent())
                        .totalPrice(lineReq.getTotalPrice())
                        .notes(lineReq.getNotes())
                        .build();
                deliveryNote.addLine(line);
            });
        }

        DeliveryNote updated = deliveryNoteRepository.save(deliveryNote);
        log.info("Delivery note updated successfully: {}", id);
        return toResponse(updated);
    }

    @Override
    public void deleteDeliveryNote(UUID id) {
        log.info("Deleting delivery note: {}", id);
        DeliveryNote deliveryNote = deliveryNoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryNote", id));

        if (deliveryNote.getStatus() != DeliveryNoteStatus.DRAFT) {
            throw new BusinessException("Delivery note can only be deleted when in DRAFT status. Current status: " + deliveryNote.getStatus());
        }

        deliveryNoteRepository.delete(deliveryNote);
        log.info("Delivery note deleted successfully: {}", id);
    }

    @Override
    public DeliveryNoteResponse validateDeliveryNote(UUID id, String authToken) {
        log.info("Validating delivery note: {}", id);
        DeliveryNote deliveryNote = deliveryNoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeliveryNote", id));

        if (deliveryNote.getStatus() != DeliveryNoteStatus.DRAFT) {
            throw new BusinessException("Only DRAFT delivery notes can be validated. Current status: " + deliveryNote.getStatus());
        }

        deliveryNote.setStatus(DeliveryNoteStatus.VALIDATED);
        DeliveryNote updated = deliveryNoteRepository.save(deliveryNote);
        log.info("Delivery note validated: {}", id);

        // Decrease inventory for each line
        if (updated.getLines() != null) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (authToken != null && !authToken.isBlank()) {
                headers.set("Authorization", authToken);
            }

            List<String> failures = new ArrayList<>();

            for (DeliveryNoteLine line : updated.getLines()) {
                if (line.getItemId() == null) {
                    log.warn("Skipping line with null itemId in delivery note {}", updated.getReference());
                    continue;
                }
                int qty = (line.getDeliveredQuantity() != null && line.getDeliveredQuantity() > 0)
                        ? line.getDeliveredQuantity()
                        : line.getOrderedQuantity();
                if (qty <= 0) continue;

                try {
                    Map<String, Object> body = new HashMap<>();
                    body.put("itemId", line.getItemId());
                    body.put("locationId", updated.getLocationId());
                    body.put("warehouseId", updated.getInventoryId());
                    body.put("quantityChange", -(double) qty);
                    body.put("reason", "Delivery note " + updated.getReference() + " validated — " + line.getItemName());

                    HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
                    restTemplate.postForObject(
                            inventoryServiceUrl + "/api/inventory/adjust",
                            requestEntity,
                            Object.class
                    );
                    log.info("Inventory decreased for item {} ({}) by {}", line.getItemName(), line.getItemId(), qty);
                } catch (Exception e) {
                    log.error("Failed to adjust inventory for item {} ({}): {}", line.getItemName(), line.getItemId(), e.getMessage());
                    failures.add(line.getItemName() != null ? line.getItemName() : line.getItemId());
                }
            }

            // If any inventory adjustment failed, revert the delivery note back to DRAFT
            if (!failures.isEmpty()) {
                deliveryNote.setStatus(DeliveryNoteStatus.DRAFT);
                deliveryNoteRepository.save(deliveryNote);
                throw new BusinessException(
                    "Validation failed: inventory could not be adjusted for the following items: "
                    + String.join(", ", failures)
                    + ". Delivery note reverted to DRAFT."
                );
            }
        }

        return toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryNoteResponse> getDeliveryNotesByCustomer(String customerId) {
        log.info("Fetching delivery notes for customer: {}", customerId);
        return deliveryNoteRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== Helper methods =====

    private String generateDeliveryNoteReference() {
        int year = LocalDateTime.now().getYear();
        long count = deliveryNoteRepository.countByYear(year) + 1;
        return String.format("BL-%d-%04d", year, count);
    }

    private DeliveryNoteResponse toResponse(DeliveryNote deliveryNote) {
        List<DeliveryNoteLineResponse> lineResponses = deliveryNote.getLines() != null
                ? deliveryNote.getLines().stream().map(this::toLineResponse).collect(Collectors.toList())
                : new ArrayList<>();

        return DeliveryNoteResponse.builder()
                .id(deliveryNote.getId())
                .reference(deliveryNote.getReference())
                .quoteId(deliveryNote.getQuoteId())
                .customerId(deliveryNote.getCustomerId())
                .customerName(deliveryNote.getCustomerName())
                .inventoryId(deliveryNote.getInventoryId())
                .locationId(deliveryNote.getLocationId())
                .totalAmount(deliveryNote.getTotalAmount())
                .status(deliveryNote.getStatus())
                .deliveryDate(deliveryNote.getDeliveryDate())
                .deliveryAddress(deliveryNote.getDeliveryAddress())
                .notes(deliveryNote.getNotes())
                .createdBy(deliveryNote.getCreatedBy())
                .createdAt(deliveryNote.getCreatedAt())
                .updatedAt(deliveryNote.getUpdatedAt())
                .lines(lineResponses)
                .build();
    }

    private DeliveryNoteLineResponse toLineResponse(DeliveryNoteLine line) {
        return DeliveryNoteLineResponse.builder()
                .id(line.getId())
                .itemId(line.getItemId())
                .itemName(line.getItemName())
                .itemSku(line.getItemSku())
                .orderedQuantity(line.getOrderedQuantity())
                .deliveredQuantity(line.getDeliveredQuantity())
                .lotId(line.getLotId())
                .serialId(line.getSerialId())
                .unitPrice(line.getUnitPrice())
                .discountPercent(line.getDiscountPercent())
                .totalPrice(line.getTotalPrice())
                .notes(line.getNotes())
                .build();
    }
}
