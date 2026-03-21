package com.stock.alertservice.dto.response;

import com.stock.alertservice.enums.RuleSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleSummaryDTO {
    private String id;
    private String name;
    private RuleSeverity severity;
    private Boolean isActive;
}
