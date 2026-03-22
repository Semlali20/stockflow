package com.stock.salesservice.service;

import com.stock.salesservice.dto.request.CustomerRequest;
import com.stock.salesservice.dto.response.CustomerResponse;
import com.stock.salesservice.enums.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CustomerService {

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse getCustomerById(UUID id);

    Page<CustomerResponse> getAllCustomers(String search, Pageable pageable);

    CustomerResponse updateCustomer(UUID id, CustomerRequest request);

    void deleteCustomer(UUID id);

    List<CustomerResponse> getActiveCustomers();

    Page<CustomerResponse> getCustomersByStatus(CustomerStatus status, Pageable pageable);
}
