package com.stock.qualityservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityAttachmentResponse {

    private String id;
    private String qualityControlId;
    private String quarantineId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String fileUrl;
    private String filePath;
    private String description;
    private String attachmentType;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}