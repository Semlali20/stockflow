package com.stock.qualityservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityAttachmentRequest {

    private String qualityControlId;

    private String quarantineId;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File type is required")
    private String fileType;

    private Long fileSize;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    private String filePath;

    private String description;

    private String attachmentType; // IMAGE, VIDEO, DOCUMENT, CERTIFICATE
}