package com.stock.salesservice.dto.response;

import com.stock.salesservice.enums.CustomerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String contactPerson;
    private Integer paymentTermsDays;
    private CustomerStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
