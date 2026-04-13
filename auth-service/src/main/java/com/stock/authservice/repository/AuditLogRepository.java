package com.stock.authservice.repository;

import com.stock.authservice.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

  List<AuditLog> findByUserId(String userId);

  List<AuditLog> findByAction(String action);

  List<AuditLog> findByUserIdAndAction(String userId, String action);

  List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

  List<AuditLog> findByUserIdAndTimestampBetween(String userId, LocalDateTime start, LocalDateTime end);
}
