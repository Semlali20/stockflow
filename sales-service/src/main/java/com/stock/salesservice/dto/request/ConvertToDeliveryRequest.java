package com.stock.salesservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConvertToDeliveryRequest {

    private LocalDate deliveryDate;

    private String deliveryAddress;

    private String notes;
}
