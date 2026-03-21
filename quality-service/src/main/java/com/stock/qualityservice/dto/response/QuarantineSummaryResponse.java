package com.stock.qualityservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuarantineSummaryResponse {

    private Long totalQuarantined;
    private Long inProcess;
    private Long released;
    private Long rejected;
    private Double totalQuantityQuarantined;
    private Long overdueQuarantines;
}