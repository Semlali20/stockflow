package com.stock.salesservice.repository;

import com.stock.salesservice.entity.QuoteLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuoteLineRepository extends JpaRepository<QuoteLine, UUID> {

    List<QuoteLine> findByQuoteId(UUID quoteId);

    void deleteByQuoteId(UUID quoteId);
}
