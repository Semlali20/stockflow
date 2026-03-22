package com.stock.salesservice.repository;

import com.stock.salesservice.entity.Customer;
import com.stock.salesservice.enums.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID>,
        JpaSpecificationExecutor<Customer> {

    List<Customer> findByStatus(CustomerStatus status);

    Page<Customer> findByStatus(CustomerStatus status, Pageable pageable);

    List<Customer> findByNameContainingIgnoreCase(String name);

    Page<Customer> findByNameContainingIgnoreCase(String name, Pageable pageable);

    boolean existsByEmail(String email);

    Page<Customer> findByStatusAndNameContainingIgnoreCase(CustomerStatus status, String name, Pageable pageable);
}
