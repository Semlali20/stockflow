package com.stock.qualityservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "quality_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QualityAttachment {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "quality_control_id")
    private String qualityControlId;

    @Column(name = "quarantine_id")
    private String quarantineId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "description")
    private String description;

    @Column(name = "attachment_type")
    private String attachmentType; // IMAGE, VIDEO, DOCUMENT, CERTIFICATE

    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}