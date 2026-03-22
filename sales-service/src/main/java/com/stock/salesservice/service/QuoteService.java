package com.stock.salesservice.service;

import com.stock.salesservice.dto.request.ConvertToDeliveryRequest;
import com.stock.salesservice.dto.request.QuoteRequest;
import com.stock.salesservice.dto.response.DeliveryNoteResponse;
import com.stock.salesservice.dto.response.QuoteResponse;
import com.stock.salesservice.enums.QuoteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface QuoteService {

    QuoteResponse createQuote(QuoteRequest request, String createdBy);

    QuoteResponse getQuoteById(UUID id);

    Page<QuoteResponse> getAllQuotes(QuoteStatus status, String customerId, Pageable pageable);

    QuoteResponse updateQuote(UUID id, QuoteRequest request);

    void deleteQuote(UUID id);

    QuoteResponse sendQuote(UUID id);

    QuoteResponse acceptQuote(UUID id);

    QuoteResponse rejectQuote(UUID id);

    QuoteResponse expireQuote(UUID id);

    DeliveryNoteResponse convertToDelivery(UUID id, ConvertToDeliveryRequest request, String createdBy);

    List<QuoteResponse> getQuotesByCustomer(String customerId);
}
