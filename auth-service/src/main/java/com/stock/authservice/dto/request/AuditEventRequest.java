package com.stock.authservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEventRequest {
    private String userId;
    private String username;
    /** CREATE | UPDATE | DELETE | STATUS_CHANGE | IMPORT | EXPORT */
    private String action;
    /** PRODUCT | CATEGORY | QUOTE | CUSTOMER | DELIVERY_NOTE | INVENTORY |
     *  LOT | SERIAL | MOVEMENT | PURCHASE_ORDER | SUPPLIER | LOCATION |
     *  SITE | WAREHOUSE | VARIANT */
    private String resourceType;
    private String resourceId;
    /** Human-readable description of the action */
    private String description;
    private String ipAddress;
    private String userAgent;
    /** SUCCESS or FAILURE */
    private String status;
    private String errorMessage;
}
