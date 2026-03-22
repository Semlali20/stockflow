package com.stock.purchaseservice.dto.request;

import com.stock.purchaseservice.enums.SupplierStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    @Size(max = 255, message = "Supplier name must not exceed 255 characters")
    private String name;

    @Email(message = "Email must be a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    private String phone;

    private String address;

    @Size(max = 255, message = "Contact person name must not exceed 255 characters")
    private String contactPerson;

    @Min(value = 0, message = "Payment terms days must be non-negative")
    @Max(value = 365, message = "Payment terms days must not exceed 365")
    private Integer paymentTermsDays;

    @Min(value = 0, message = "Lead time days must be non-negative")
    @Max(value = 365, message = "Lead time days must not exceed 365")
    private Integer leadTimeDays;

    private SupplierStatus status;

    private String notes;
}
