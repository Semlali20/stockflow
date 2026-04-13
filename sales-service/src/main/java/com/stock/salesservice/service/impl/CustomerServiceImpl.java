package com.stock.salesservice.service.impl;

import com.stock.salesservice.dto.request.CustomerRequest;
import com.stock.salesservice.dto.response.CustomerResponse;
import com.stock.salesservice.entity.Customer;
import com.stock.salesservice.enums.CustomerStatus;
import com.stock.salesservice.exception.BusinessException;
import com.stock.salesservice.exception.ResourceNotFoundException;
import com.stock.salesservice.repository.CustomerRepository;
import com.stock.salesservice.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public CustomerResponse createCustomer(CustomerRequest request) {
        log.info("Creating new customer: {}", request.getName());

        if (StringUtils.hasText(request.getEmail()) && customerRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("A customer with email '" + request.getEmail() + "' already exists");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .contactPerson(request.getContactPerson())
                .paymentTermsDays(request.getPaymentTermsDays() != null ? request.getPaymentTermsDays() : 30)
                .status(request.getStatus() != null ? request.getStatus() : CustomerStatus.ACTIVE)
                .notes(request.getNotes())
                .build();

        Customer saved = customerRepository.save(customer);
        log.info("Customer created successfully with ID: {}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(UUID id) {
        log.info("Fetching customer with ID: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        return toResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(String search, Pageable pageable) {
        log.info("Fetching customers with search: {}", search);
        if (StringUtils.hasText(search)) {
            return customerRepository.findByNameContainingIgnoreCase(search, pageable)
                    .map(this::toResponse);
        }
        return customerRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public CustomerResponse updateCustomer(UUID id, CustomerRequest request) {
        log.info("Updating customer: {}", id);

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));

        if (StringUtils.hasText(request.getEmail())
                && !request.getEmail().equals(customer.getEmail())
                && customerRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("A customer with email '" + request.getEmail() + "' already exists");
        }

        if (StringUtils.hasText(request.getName())) {
            customer.setName(request.getName());
        }
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress());
        }
        if (request.getContactPerson() != null) {
            customer.setContactPerson(request.getContactPerson());
        }
        if (request.getPaymentTermsDays() != null) {
            customer.setPaymentTermsDays(request.getPaymentTermsDays());
        }
        if (request.getStatus() != null) {
            customer.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            customer.setNotes(request.getNotes());
        }

        Customer updated = customerRepository.save(customer);
        log.info("Customer updated successfully: {}", id);
        return toResponse(updated);
    }

    @Override
    public void deleteCustomer(UUID id) {
        log.info("Deleting customer: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        customerRepository.delete(customer);
        log.info("Customer deleted successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponse> getActiveCustomers() {
        log.info("Fetching active customers");
        return customerRepository.findByStatus(CustomerStatus.ACTIVE).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getCustomersByStatus(CustomerStatus status, Pageable pageable) {
        log.info("Fetching customers with status: {}", status);
        return customerRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    private CustomerResponse toResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .contactPerson(customer.getContactPerson())
                .paymentTermsDays(customer.getPaymentTermsDays())
                .status(customer.getStatus())
                .notes(customer.getNotes())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
