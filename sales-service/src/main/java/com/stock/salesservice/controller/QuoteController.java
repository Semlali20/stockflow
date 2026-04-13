package com.stock.salesservice.controller;

import com.stock.salesservice.dto.request.ConvertToDeliveryRequest;
import com.stock.salesservice.dto.request.QuoteRequest;
import com.stock.salesservice.dto.response.DeliveryNoteResponse;
import com.stock.salesservice.dto.response.QuoteResponse;
import com.stock.salesservice.enums.QuoteStatus;
import com.stock.salesservice.service.QuoteService;
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
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Quote Management", description = "APIs for managing sales quotes")
public class QuoteController {

    private final QuoteService quoteService;

    @PostMapping
    @Operation(summary = "Create a new quote", description = "Creates a new sales quote with lines")
    public ResponseEntity<QuoteResponse> createQuote(
            @Valid @RequestBody QuoteRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("REST request to create quote by user: {}", userId);
        String createdBy = userId != null ? userId : "anonymous";
        QuoteResponse response = quoteService.createQuote(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all quotes", description = "Retrieves all quotes with optional filters and pagination")
    public ResponseEntity<Page<QuoteResponse>> getAllQuotes(
            @Parameter(description = "Filter by status") @RequestParam(required = false) QuoteStatus status,
            @Parameter(description = "Filter by customer ID") @RequestParam(required = false) String customerId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get all quotes - status: {}, customerId: {}", status, customerId);
        Page<QuoteResponse> response = quoteService.getAllQuotes(status, customerId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quote by ID", description = "Retrieves a quote by its ID with all lines")
    public ResponseEntity<QuoteResponse> getQuoteById(
            @Parameter(description = "Quote ID") @PathVariable UUID id) {
        log.info("REST request to get quote: {}", id);
        QuoteResponse response = quoteService.getQuoteById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update quote", description = "Updates an existing quote (only when in DRAFT status)")
    public ResponseEntity<QuoteResponse> updateQuote(
            @Parameter(description = "Quote ID") @PathVariable UUID id,
            @Valid @RequestBody QuoteRequest request) {
        log.info("REST request to update quote: {}", id);
        QuoteResponse response = quoteService.updateQuote(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete quote", description = "Deletes a quote (only DRAFT or REJECTED)")
    public ResponseEntity<Void> deleteQuote(
            @Parameter(description = "Quote ID") @PathVariable UUID id) {
        log.info("REST request to delete quote: {}", id);
        quoteService.deleteQuote(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/send")
    @Operation(summary = "Send quote", description = "Transitions quote from DRAFT to SENT status")
    public ResponseEntity<QuoteResponse> sendQuote(
            @Parameter(description = "Quote ID") @PathVariable UUID id) {
        log.info("REST request to send quote: {}", id);
        QuoteResponse response = quoteService.sendQuote(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept quote", description = "Transitions quote from SENT to ACCEPTED status")
    public ResponseEntity<QuoteResponse> acceptQuote(
            @Parameter(description = "Quote ID") @PathVariable UUID id) {
        log.info("REST request to accept quote: {}", id);
        QuoteResponse response = quoteService.acceptQuote(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject quote", description = "Transitions quote from SENT to REJECTED status")
    public ResponseEntity<QuoteResponse> rejectQuote(
            @Parameter(description = "Quote ID") @PathVariable UUID id) {
        log.info("REST request to reject quote: {}", id);
        QuoteResponse response = quoteService.rejectQuote(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/convert-to-delivery")
    @Operation(summary = "Convert quote to delivery note", description = "Converts an ACCEPTED quote to a delivery note")
    public ResponseEntity<DeliveryNoteResponse> convertToDelivery(
            @Parameter(description = "Quote ID") @PathVariable UUID id,
            @RequestBody(required = false) ConvertToDeliveryRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        log.info("REST request to convert quote {} to delivery note", id);
        if (request == null) {
            request = new ConvertToDeliveryRequest();
        }
        String createdBy = userId != null ? userId : "anonymous";
        DeliveryNoteResponse response = quoteService.convertToDelivery(id, request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get quotes by customer", description = "Retrieves all quotes for a specific customer")
    public ResponseEntity<List<QuoteResponse>> getQuotesByCustomer(
            @Parameter(description = "Customer ID") @PathVariable String customerId) {
        log.info("REST request to get quotes for customer: {}", customerId);
        List<QuoteResponse> response = quoteService.getQuotesByCustomer(customerId);
        return ResponseEntity.ok(response);
    }
}
