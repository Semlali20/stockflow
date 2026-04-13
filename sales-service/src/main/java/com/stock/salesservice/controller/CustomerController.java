package com.stock.salesservice.controller;

import com.stock.salesservice.dto.request.CustomerRequest;
import com.stock.salesservice.dto.response.CustomerResponse;
import com.stock.salesservice.enums.CustomerStatus;
import com.stock.salesservice.service.CustomerService;
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
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Customer Management", description = "APIs for managing customers")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @Operation(summary = "Create a new customer", description = "Creates a new customer in the system")
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        log.info("REST request to create customer: {}", request.getName());
        CustomerResponse response = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all customers", description = "Retrieves all customers with optional search and pagination")
    public ResponseEntity<Page<CustomerResponse>> getAllCustomers(
            @Parameter(description = "Search by name") @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get all customers, search: {}", search);
        Page<CustomerResponse> response = customerService.getAllCustomers(search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID", description = "Retrieves a customer by their ID")
    public ResponseEntity<CustomerResponse> getCustomerById(
            @Parameter(description = "Customer ID") @PathVariable UUID id) {
        log.info("REST request to get customer: {}", id);
        CustomerResponse response = customerService.getCustomerById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer", description = "Updates an existing customer")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @Parameter(description = "Customer ID") @PathVariable UUID id,
            @Valid @RequestBody CustomerRequest request) {
        log.info("REST request to update customer: {}", id);
        CustomerResponse response = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer", description = "Deletes a customer by their ID")
    public ResponseEntity<Void> deleteCustomer(
            @Parameter(description = "Customer ID") @PathVariable UUID id) {
        log.info("REST request to delete customer: {}", id);
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    @Operation(summary = "Get active customers", description = "Retrieves all active customers")
    public ResponseEntity<List<CustomerResponse>> getActiveCustomers() {
        log.info("REST request to get active customers");
        List<CustomerResponse> response = customerService.getActiveCustomers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get customers by status", description = "Retrieves customers filtered by status")
    public ResponseEntity<Page<CustomerResponse>> getCustomersByStatus(
            @Parameter(description = "Customer status") @PathVariable CustomerStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get customers with status: {}", status);
        Page<CustomerResponse> response = customerService.getCustomersByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }
}
