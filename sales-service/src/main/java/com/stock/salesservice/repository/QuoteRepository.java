package com.stock.salesservice.repository;

import com.stock.salesservice.entity.Quote;
import com.stock.salesservice.enums.QuoteStatus;
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
public interface QuoteRepository extends JpaRepository<Quote, UUID>,
        JpaSpecificationExecutor<Quote> {

    List<Quote> findByCustomerId(String customerId);

    Page<Quote> findByCustomerId(String customerId, Pageable pageable);

    List<Quote> findByStatus(QuoteStatus status);

    Page<Quote> findByStatus(QuoteStatus status, Pageable pageable);

    Optional<Quote> findByReference(String reference);

    boolean existsByReference(String reference);

    Page<Quote> findByStatusAndCustomerId(QuoteStatus status, String customerId, Pageable pageable);

    @Query("SELECT COUNT(q) FROM Quote q WHERE YEAR(q.createdAt) = :year")
    long countByYear(@Param("year") int year);

    @Query("SELECT q FROM Quote q LEFT JOIN FETCH q.lines WHERE q.id = :id")
    Optional<Quote> findByIdWithLines(@Param("id") UUID id);
}
