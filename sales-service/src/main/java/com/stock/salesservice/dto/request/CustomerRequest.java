package com.stock.salesservice.dto.request;

import com.stock.salesservice.enums.CustomerStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerRequest {

    @NotBlank(message = "Customer name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    private String phone;

    private String address;

    @Size(max = 255, message = "Contact person must not exceed 255 characters")
    private String contactPerson;

    private Integer paymentTermsDays;

    private CustomerStatus status;

    private String notes;
}
