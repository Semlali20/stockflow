package com.stock.purchaseservice.repository;

import com.stock.purchaseservice.entity.Supplier;
import com.stock.purchaseservice.enums.SupplierStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    /**
     * Find suppliers by status
     */
    List<Supplier> findByStatus(SupplierStatus status);

    /**
     * Find suppliers by status with pagination
     */
    Page<Supplier> findByStatus(SupplierStatus status, Pageable pageable);

    /**
     * Find suppliers by name containing (case-insensitive)
     */
    Page<Supplier> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * Check if email is already registered
     */
    boolean existsByEmail(String email);

    /**
     * Check if email is used by another supplier (for updates)
     */
    boolean existsByEmailAndIdNot(String email, UUID id);

    /**
     * Find suppliers by name containing and status
     */
    Page<Supplier> findByNameContainingIgnoreCaseAndStatus(String name, SupplierStatus status, Pageable pageable);
}
