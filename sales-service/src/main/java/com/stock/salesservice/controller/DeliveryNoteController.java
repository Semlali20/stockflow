package com.stock.salesservice.controller;

import com.stock.salesservice.dto.request.DeliveryNoteRequest;
import com.stock.salesservice.dto.response.DeliveryNoteResponse;
import com.stock.salesservice.enums.DeliveryNoteStatus;
import com.stock.salesservice.service.DeliveryNoteService;
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
@RequestMapping("/api/delivery-notes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Delivery Note Management", description = "APIs for managing delivery notes")
public class DeliveryNoteController {

    private final DeliveryNoteService deliveryNoteService;

    @PostMapping
    @Operation(summary = "Create a new delivery note")
    public ResponseEntity<DeliveryNoteResponse> createDeliveryNote(
            @Valid @RequestBody DeliveryNoteRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("REST request to create delivery note by user: {}", userId);
        String createdBy = userId != null ? userId : "anonymous";
        DeliveryNoteResponse response = deliveryNoteService.createDeliveryNote(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all delivery notes with optional filters and pagination")
    public ResponseEntity<Page<DeliveryNoteResponse>> getAllDeliveryNotes(
            @Parameter(description = "Filter by status") @RequestParam(required = false) DeliveryNoteStatus status,
            @Parameter(description = "Filter by customer ID") @RequestParam(required = false) String customerId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get all delivery notes - status: {}, customerId: {}", status, customerId);
        Page<DeliveryNoteResponse> response = deliveryNoteService.getAllDeliveryNotes(status, customerId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get delivery note by ID with all lines")
    public ResponseEntity<DeliveryNoteResponse> getDeliveryNoteById(
            @Parameter(description = "Delivery note ID") @PathVariable UUID id) {
        log.info("REST request to get delivery note: {}", id);
        DeliveryNoteResponse response = deliveryNoteService.getDeliveryNoteById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update delivery note (DRAFT only)")
    public ResponseEntity<DeliveryNoteResponse> updateDeliveryNote(
            @Parameter(description = "Delivery note ID") @PathVariable UUID id,
            @Valid @RequestBody DeliveryNoteRequest request) {
        log.info("REST request to update delivery note: {}", id);
        DeliveryNoteResponse response = deliveryNoteService.updateDeliveryNote(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete delivery note (DRAFT only)")
    public ResponseEntity<Void> deleteDeliveryNote(
            @Parameter(description = "Delivery note ID") @PathVariable UUID id) {
        log.info("REST request to delete delivery note: {}", id);
        deliveryNoteService.deleteDeliveryNote(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/validate")
    @Operation(summary = "Validate delivery note — changes status to VALIDATED and decreases inventory")
    public ResponseEntity<DeliveryNoteResponse> validateDeliveryNote(
            @Parameter(description = "Delivery note ID") @PathVariable UUID id,
            @RequestHeader(value = "Authorization", required = false) String authToken) {
        log.info("REST request to validate delivery note: {}", id);
        DeliveryNoteResponse response = deliveryNoteService.validateDeliveryNote(id, authToken);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get delivery notes by customer")
    public ResponseEntity<List<DeliveryNoteResponse>> getDeliveryNotesByCustomer(
            @Parameter(description = "Customer ID") @PathVariable String customerId) {
        log.info("REST request to get delivery notes for customer: {}", customerId);
        List<DeliveryNoteResponse> response = deliveryNoteService.getDeliveryNotesByCustomer(customerId);
        return ResponseEntity.ok(response);
    }
}
