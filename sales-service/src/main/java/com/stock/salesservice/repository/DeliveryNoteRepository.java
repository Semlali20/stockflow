package com.stock.salesservice.repository;

import com.stock.salesservice.entity.DeliveryNote;
import com.stock.salesservice.enums.DeliveryNoteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryNoteRepository extends JpaRepository<DeliveryNote, UUID>,
        JpaSpecificationExecutor<DeliveryNote> {

    List<DeliveryNote> findByCustomerId(String customerId);

    Page<DeliveryNote> findByCustomerId(String customerId, Pageable pageable);

    List<DeliveryNote> findByStatus(DeliveryNoteStatus status);

    Page<DeliveryNote> findByStatus(DeliveryNoteStatus status, Pageable pageable);

    List<DeliveryNote> findByQuoteId(String quoteId);

    Optional<DeliveryNote> findByReference(String reference);

    boolean existsByReference(String reference);

    Page<DeliveryNote> findByStatusAndCustomerId(DeliveryNoteStatus status, String customerId, Pageable pageable);

    @Query("SELECT COUNT(d) FROM DeliveryNote d WHERE YEAR(d.createdAt) = :year")
    long countByYear(@Param("year") int year);

    @Query("SELECT d FROM DeliveryNote d LEFT JOIN FETCH d.lines WHERE d.id = :id")
    Optional<DeliveryNote> findByIdWithLines(@Param("id") UUID id);
}
