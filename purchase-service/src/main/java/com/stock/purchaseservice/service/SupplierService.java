package com.stock.purchaseservice.service;

import com.stock.purchaseservice.dto.request.SupplierRequest;
import com.stock.purchaseservice.dto.response.SupplierResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SupplierService {

    /**
     * Create a new supplier
     */
    SupplierResponse createSupplier(SupplierRequest request);

    /**
     * Update an existing supplier
     */
    SupplierResponse updateSupplier(UUID id, SupplierRequest request);

    /**
     * Delete a supplier
     */
    void deleteSupplier(UUID id);

    /**
     * Get supplier by ID
     */
    SupplierResponse getSupplierById(UUID id);

    /**
     * Get all suppliers with pagination
     */
    Page<SupplierResponse> getAllSuppliers(Pageable pageable);

    /**
     * Get all active suppliers
     */
    List<SupplierResponse> getActiveSuppliers();

    /**
     * Search suppliers by name (with optional status filter)
     */
    Page<SupplierResponse> searchSuppliers(String name, Pageable pageable);
}
