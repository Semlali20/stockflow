package com.stock.qualityservice.repository;

import com.stock.qualityservice.entity.QualityAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QualityAttachmentRepository extends JpaRepository<QualityAttachment, String> {

    List<QualityAttachment> findByQualityControlId(String qualityControlId);

    List<QualityAttachment> findByQuarantineId(String quarantineId);

    List<QualityAttachment> findByAttachmentType(String attachmentType);

    List<QualityAttachment> findByUploadedBy(String uploadedBy);

    @Query("SELECT qa FROM QualityAttachment qa WHERE qa.qualityControlId = :qualityControlId AND qa.attachmentType = :type")
    List<QualityAttachment> findByQualityControlIdAndType(@Param("qualityControlId") String qualityControlId,
                                                          @Param("type") String type);

    @Query("SELECT qa FROM QualityAttachment qa WHERE qa.quarantineId = :quarantineId AND qa.attachmentType = :type")
    List<QualityAttachment> findByQuarantineIdAndType(@Param("quarantineId") String quarantineId,
                                                      @Param("type") String type);

    @Query("SELECT qa FROM QualityAttachment qa WHERE qa.uploadedAt BETWEEN :startDate AND :endDate")
    List<QualityAttachment> findByUploadedAtBetween(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(qa) FROM QualityAttachment qa WHERE qa.qualityControlId = :qualityControlId")
    Long countByQualityControlId(@Param("qualityControlId") String qualityControlId);

    @Query("SELECT COUNT(qa) FROM QualityAttachment qa WHERE qa.quarantineId = :quarantineId")
    Long countByQuarantineId(@Param("quarantineId") String quarantineId);

    @Query("SELECT SUM(qa.fileSize) FROM QualityAttachment qa WHERE qa.qualityControlId = :qualityControlId")
    Long getTotalFileSizeByQualityControl(@Param("qualityControlId") String qualityControlId);

    void deleteByQualityControlId(String qualityControlId);

    void deleteByQuarantineId(String quarantineId);
}