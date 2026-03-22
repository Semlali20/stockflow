package com.stock.purchaseservice.controller;

import com.stock.purchaseservice.dto.request.SupplierRequest;
import com.stock.purchaseservice.dto.response.PageResponse;
import com.stock.purchaseservice.dto.response.SupplierResponse;
import com.stock.purchaseservice.service.SupplierService;
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
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Supplier Management", description = "APIs for managing suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    /**
     * Create a new supplier
     */
    @PostMapping
    @Operation(summary = "Create a new supplier", description = "Creates a new supplier record")
    public ResponseEntity<SupplierResponse> createSupplier(
            @Valid @RequestBody SupplierRequest request) {

        log.info("REST request to create supplier: {}", request.getName());

        SupplierResponse response = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all suppliers with pagination and optional search
     */
    @GetMapping
    @Operation(summary = "Get all suppliers", description = "Retrieves all suppliers with pagination; optionally filter by name")
    public ResponseEntity<PageResponse<SupplierResponse>> getAllSuppliers(
            @Parameter(description = "Search term for supplier name") @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {

        log.info("REST request to get all suppliers - search: {}", search);

        Page<SupplierResponse> page;
        if (search != null && !search.isBlank()) {
            page = supplierService.searchSuppliers(search, pageable);
        } else {
            page = supplierService.getAllSuppliers(pageable);
        }

        return ResponseEntity.ok(PageResponse.from(page));
    }

    /**
     * Get supplier by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID", description = "Retrieves a supplier by their unique ID")
    public ResponseEntity<SupplierResponse> getSupplierById(
            @Parameter(description = "Supplier UUID") @PathVariable UUID id) {

        log.info("REST request to get supplier: {}", id);

        SupplierResponse response = supplierService.getSupplierById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Update a supplier
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update supplier", description = "Updates an existing supplier")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @Parameter(description = "Supplier UUID") @PathVariable UUID id,
            @Valid @RequestBody SupplierRequest request) {

        log.info("REST request to update supplier: {}", id);

        SupplierResponse response = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a supplier
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete supplier", description = "Deletes a supplier")
    public ResponseEntity<Void> deleteSupplier(
            @Parameter(description = "Supplier UUID") @PathVariable UUID id) {

        log.info("REST request to delete supplier: {}", id);

        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all active suppliers
     */
    @GetMapping("/active")
    @Operation(summary = "Get active suppliers", description = "Retrieves all suppliers with ACTIVE status")
    public ResponseEntity<List<SupplierResponse>> getActiveSuppliers() {

        log.info("REST request to get active suppliers");

        List<SupplierResponse> response = supplierService.getActiveSuppliers();
        return ResponseEntity.ok(response);
    }
}
