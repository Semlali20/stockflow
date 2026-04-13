package com.stock.purchaseservice.service.impl;

import com.stock.purchaseservice.dto.request.SupplierRequest;
import com.stock.purchaseservice.dto.response.SupplierResponse;
import com.stock.purchaseservice.entity.Supplier;
import com.stock.purchaseservice.enums.SupplierStatus;
import com.stock.purchaseservice.exception.ResourceNotFoundException;
import com.stock.purchaseservice.repository.SupplierRepository;
import com.stock.purchaseservice.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public SupplierResponse createSupplier(SupplierRequest request) {
        log.info("Creating new supplier: {}", request.getName());

        // Check for duplicate email
        if (request.getEmail() != null && supplierRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("A supplier with email '" + request.getEmail() + "' already exists");
        }

        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .contactPerson(request.getContactPerson())
                .paymentTermsDays(request.getPaymentTermsDays() != null ? request.getPaymentTermsDays() : 30)
                .leadTimeDays(request.getLeadTimeDays() != null ? request.getLeadTimeDays() : 7)
                .status(request.getStatus() != null ? request.getStatus() : SupplierStatus.ACTIVE)
                .notes(request.getNotes())
                .build();

        Supplier savedSupplier = supplierRepository.save(supplier);
        log.info("Supplier created successfully with ID: {}", savedSupplier.getId());

        return mapToResponse(savedSupplier);
    }

    @Override
    public SupplierResponse updateSupplier(UUID id, SupplierRequest request) {
        log.info("Updating supplier: {}", id);

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));

        // Check for duplicate email (exclude current supplier)
        if (request.getEmail() != null && supplierRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new IllegalArgumentException("A supplier with email '" + request.getEmail() + "' already exists");
        }

        supplier.setName(request.getName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setContactPerson(request.getContactPerson());
        if (request.getPaymentTermsDays() != null) {
            supplier.setPaymentTermsDays(request.getPaymentTermsDays());
        }
        if (request.getLeadTimeDays() != null) {
            supplier.setLeadTimeDays(request.getLeadTimeDays());
        }
        if (request.getStatus() != null) {
            supplier.setStatus(request.getStatus());
        }
        supplier.setNotes(request.getNotes());

        Supplier updatedSupplier = supplierRepository.save(supplier);
        log.info("Supplier updated successfully: {}", id);

        return mapToResponse(updatedSupplier);
    }

    @Override
    public void deleteSupplier(UUID id) {
        log.info("Deleting supplier: {}", id);

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));

        supplierRepository.delete(supplier);
        log.info("Supplier deleted successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(UUID id) {
        log.info("Fetching supplier: {}", id);

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));

        return mapToResponse(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponse> getAllSuppliers(Pageable pageable) {
        log.info("Fetching all suppliers with pagination");

        return supplierRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getActiveSuppliers() {
        log.info("Fetching all active suppliers");

        return supplierRepository.findByStatus(SupplierStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponse> searchSuppliers(String name, Pageable pageable) {
        log.info("Searching suppliers by name: {}", name);

        return supplierRepository.findByNameContainingIgnoreCase(name, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Map Supplier entity to SupplierResponse DTO
     */
    private SupplierResponse mapToResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .contactPerson(supplier.getContactPerson())
                .paymentTermsDays(supplier.getPaymentTermsDays())
                .leadTimeDays(supplier.getLeadTimeDays())
                .status(supplier.getStatus())
                .notes(supplier.getNotes())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
