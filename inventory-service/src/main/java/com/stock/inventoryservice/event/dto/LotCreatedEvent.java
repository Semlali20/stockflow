// inventory-service/src/main/java/com/stock/inventoryservice/event/dto/LotCreatedEvent.java
package com.stock.inventoryservice.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LotCreatedEvent implements Serializable {

    private String lotId;
    private String itemId;
    private String lotNumber;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    private String status;
    private LocalDateTime timestamp;
}
