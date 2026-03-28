package com.stock.salesservice.service.impl;

import com.stock.salesservice.dto.request.ConvertToDeliveryRequest;
import com.stock.salesservice.dto.request.QuoteRequest;
import com.stock.salesservice.dto.response.DeliveryNoteLineResponse;
import com.stock.salesservice.dto.response.DeliveryNoteResponse;
import com.stock.salesservice.dto.response.QuoteLineResponse;
import com.stock.salesservice.dto.response.QuoteResponse;
import com.stock.salesservice.entity.DeliveryNote;
import com.stock.salesservice.entity.DeliveryNoteLine;
import com.stock.salesservice.entity.Quote;
import com.stock.salesservice.entity.QuoteLine;
import com.stock.salesservice.enums.DeliveryNoteStatus;
import com.stock.salesservice.enums.QuoteStatus;
import com.stock.salesservice.exception.BusinessException;
import com.stock.salesservice.exception.ResourceNotFoundException;
import com.stock.salesservice.repository.DeliveryNoteRepository;
import com.stock.salesservice.repository.QuoteRepository;
import com.stock.salesservice.service.QuoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuoteServiceImpl implements QuoteService {

    private final QuoteRepository quoteRepository;
    private final DeliveryNoteRepository deliveryNoteRepository;

    @Override
    public QuoteResponse createQuote(QuoteRequest request, String createdBy) {
        log.info("Creating new quote for customer: {}", request.getCustomerId());

        String reference = generateQuoteReference();

        Quote quote = Quote.builder()
                .reference(reference)
                .customerId(request.getCustomerId())
                .customerName(request.getCustomerName())
                .status(QuoteStatus.DRAFT)
                .validUntil(request.getValidUntil())
                .notes(request.getNotes())
                .inventoryId(request.getInventoryId())
                .locationId(request.getLocationId())
                .discountPercent(request.getDiscountPercent() != null ? request.getDiscountPercent() : BigDecimal.ZERO)
                .createdBy(createdBy)
                .lines(new ArrayList<>())
                .build();

        // Add lines
        if (request.getLines() != null) {
            request.getLines().forEach(lineReq -> {
                BigDecimal lineDiscount = lineReq.getDiscountPercent() != null
                        ? lineReq.getDiscountPercent() : BigDecimal.ZERO;
                BigDecimal lineTotal = calculateLineTotal(
                        lineReq.getQuantity(), lineReq.getUnitPrice(), lineDiscount);

                QuoteLine line = QuoteLine.builder()
                        .itemId(lineReq.getItemId())
                        .itemName(lineReq.getItemName())
                        .itemSku(lineReq.getItemSku())
                        .quantity(lineReq.getQuantity())
                        .unitPrice(lineReq.getUnitPrice())
                        .discountPercent(lineDiscount)
                        .totalPrice(lineTotal)
                        .notes(lineReq.getNotes())
                        .build();
                quote.addLine(line);
            });
        }

        calculateTotals(quote);

        Quote saved = quoteRepository.save(quote);
        log.info("Quote created with reference: {}", saved.getReference());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public QuoteResponse getQuoteById(UUID id) {
        log.info("Fetching quote with ID: {}", id);
        Quote quote = quoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", id));
        return toResponse(quote);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<QuoteResponse> getAllQuotes(QuoteStatus status, String customerId, Pageable pageable) {
        log.info("Fetching quotes - status: {}, customerId: {}", status, customerId);
        if (status != null && customerId != null) {
            return quoteRepository.findByStatusAndCustomerId(status, customerId, pageable).map(this::toResponse);
        } else if (status != null) {
            return quoteRepository.findByStatus(status, pageable).map(this::toResponse);
        } else if (customerId != null) {
            return quoteRepository.findByCustomerId(customerId, pageable).map(this::toResponse);
        }
        return quoteRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public QuoteResponse updateQuote(UUID id, QuoteRequest request) {
        log.info("Updating quote: {}", id);

        Quote quote = quoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", id));

        if (quote.getStatus() != QuoteStatus.DRAFT) {
            throw new BusinessException("Quote can only be updated when in DRAFT status. Current status: " + quote.getStatus());
        }

        quote.setCustomerId(request.getCustomerId());
        if (request.getCustomerName() != null) {
            quote.setCustomerName(request.getCustomerName());
        }
        if (request.getValidUntil() != null) {
            quote.setValidUntil(request.getValidUntil());
        }
        if (request.getNotes() != null) {
            quote.setNotes(request.getNotes());
        }
        if (request.getDiscountPercent() != null) {
            quote.setDiscountPercent(request.getDiscountPercent());
        }
        if (request.getInventoryId() != null) {
            quote.setInventoryId(request.getInventoryId());
        }
        if (request.getLocationId() != null) {
            quote.setLocationId(request.getLocationId());
        }

        // Replace lines
        quote.getLines().clear();
        if (request.getLines() != null) {
            request.getLines().forEach(lineReq -> {
                BigDecimal lineDiscount = lineReq.getDiscountPercent() != null
                        ? lineReq.getDiscountPercent() : BigDecimal.ZERO;
                BigDecimal lineTotal = calculateLineTotal(
                        lineReq.getQuantity(), lineReq.getUnitPrice(), lineDiscount);

                QuoteLine line = QuoteLine.builder()
                        .itemId(lineReq.getItemId())
                        .itemName(lineReq.getItemName())
                        .itemSku(lineReq.getItemSku())
                        .quantity(lineReq.getQuantity())
                        .unitPrice(lineReq.getUnitPrice())
                        .discountPercent(lineDiscount)
                        .totalPrice(lineTotal)
                        .notes(lineReq.getNotes())
                        .build();
                quote.addLine(line);
            });
        }

        calculateTotals(quote);

        Quote updated = quoteRepository.save(quote);
        log.info("Quote updated successfully: {}", id);
        return toResponse(updated);
    }

    @Override
    public void deleteQuote(UUID id) {
        log.info("Deleting quote: {}", id);
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", id));

        if (quote.getStatus() != QuoteStatus.DRAFT && quote.getStatus() != QuoteStatus.REJECTED) {
            throw new BusinessException("Quote can only be deleted when in DRAFT or REJECTED status. Current status: " + quote.getStatus());
        }

        quoteRepository.delete(quote);
        log.info("Quote deleted successfully: {}", id);
    }

    @Override
    public QuoteResponse sendQuote(UUID id) {
        log.info("Sending quote: {}", id);
        Quote quote = quoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", id));

        if (quote.getStatus() != QuoteStatus.DRAFT) {
            throw new BusinessException("Only DRAFT quotes can be sent. Current status: " + quote.getStatus());
        }

        quote.setStatus(QuoteStatus.SENT);
        Quote updated = quoteRepository.save(quote);
        log.info("Quote sent: {}", id);
        return toResponse(updated);
    }

    @Override
    public QuoteResponse acceptQuote(UUID id) {
        log.info("Accepting quote: {}", id);
        Quote quote = quoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", id));

        if (quote.getStatus() != QuoteStatus.SENT) {
            throw new BusinessException("Only SENT quotes can be accepted. Current status: " + quote.getStatus());
        }

        quote.setStatus(QuoteStatus.ACCEPTED);
        Quote updated = quoteRepository.save(quote);
        log.info("Quote accepted: {}", id);
        return toResponse(updated);
    }

    @Override
    public QuoteResponse rejectQuote(UUID id) {
        log.info("Rejecting quote: {}", id);
        Quote quote = quoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", id));

        if (quote.getStatus() != QuoteStatus.SENT) {
            throw new BusinessException("Only SENT quotes can be rejected. Current status: " + quote.getStatus());
        }

        quote.setStatus(QuoteStatus.REJECTED);
        Quote updated = quoteRepository.save(quote);
        log.info("Quote rejected: {}", id);
        return toResponse(updated);
    }

    @Override
    public QuoteResponse expireQuote(UUID id) {
        log.info("Expiring quote: {}", id);
        Quote quote = quoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", id));

        if (quote.getStatus() != QuoteStatus.DRAFT && quote.getStatus() != QuoteStatus.SENT) {
            throw new BusinessException("Only DRAFT or SENT quotes can be expired. Current status: " + quote.getStatus());
        }

        quote.setStatus(QuoteStatus.EXPIRED);
        Quote updated = quoteRepository.save(quote);
        log.info("Quote expired: {}", id);
        return toResponse(updated);
    }

    @Override
    public DeliveryNoteResponse convertToDelivery(UUID id, ConvertToDeliveryRequest request, String createdBy) {
        log.info("Converting quote {} to delivery note", id);

        Quote quote = quoteRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", id));

        if (quote.getStatus() != QuoteStatus.ACCEPTED) {
            throw new BusinessException("Only ACCEPTED quotes can be converted to delivery notes. Current status: " + quote.getStatus());
        }

        // Generate delivery note reference
        String deliveryReference = generateDeliveryNoteReference();

        DeliveryNote deliveryNote = DeliveryNote.builder()
                .reference(deliveryReference)
                .quoteId(quote.getId().toString())
                .customerId(quote.getCustomerId())
                .customerName(quote.getCustomerName())
                .inventoryId(quote.getInventoryId())
                .status(DeliveryNoteStatus.DRAFT)
                .deliveryDate(request.getDeliveryDate())
                .deliveryAddress(request.getDeliveryAddress())
                .notes(request.getNotes())
                .createdBy(createdBy)
                .lines(new ArrayList<>())
                .build();

        // Convert quote lines to delivery note lines
        quote.getLines().forEach(quoteLine -> {
            DeliveryNoteLine deliveryLine = DeliveryNoteLine.builder()
                    .itemId(quoteLine.getItemId())
                    .itemName(quoteLine.getItemName())
                    .itemSku(quoteLine.getItemSku())
                    .orderedQuantity(quoteLine.getQuantity())
                    .deliveredQuantity(0)
                    .build();
            deliveryNote.addLine(deliveryLine);
        });

        DeliveryNote savedDelivery = deliveryNoteRepository.save(deliveryNote);

        // Mark quote as CONVERTED
        quote.setStatus(QuoteStatus.CONVERTED);
        quoteRepository.save(quote);

        log.info("Quote {} converted to delivery note {}", id, savedDelivery.getReference());
        return toDeliveryResponse(savedDelivery);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> getQuotesByCustomer(String customerId) {
        log.info("Fetching quotes for customer: {}", customerId);
        return quoteRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== Helper methods =====

    private String generateQuoteReference() {
        int year = LocalDateTime.now().getYear();
        long count = quoteRepository.countByYear(year) + 1;
        return String.format("QT-%d-%04d", year, count);
    }

    private String generateDeliveryNoteReference() {
        int year = LocalDateTime.now().getYear();
        long count = deliveryNoteRepository.countByYear(year) + 1;
        return String.format("BL-%d-%04d", year, count);
    }

    private BigDecimal calculateLineTotal(Integer quantity, BigDecimal unitPrice, BigDecimal discountPercent) {
        if (quantity == null || unitPrice == null) return BigDecimal.ZERO;
        BigDecimal gross = unitPrice.multiply(BigDecimal.valueOf(quantity));
        if (discountPercent != null && discountPercent.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discount = gross.multiply(discountPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return gross.subtract(discount);
        }
        return gross.setScale(2, RoundingMode.HALF_UP);
    }

    private void calculateTotals(Quote quote) {
        BigDecimal subtotal = quote.getLines().stream()
                .map(QuoteLine::getTotalPrice)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        quote.setSubtotal(subtotal);

        BigDecimal discountPercent = quote.getDiscountPercent() != null ? quote.getDiscountPercent() : BigDecimal.ZERO;
        if (discountPercent.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discount = subtotal.multiply(discountPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            quote.setTotalAmount(subtotal.subtract(discount));
        } else {
            quote.setTotalAmount(subtotal);
        }
    }

    private QuoteResponse toResponse(Quote quote) {
        List<QuoteLineResponse> lineResponses = quote.getLines() != null
                ? quote.getLines().stream().map(this::toLineResponse).collect(Collectors.toList())
                : new ArrayList<>();

        return QuoteResponse.builder()
                .id(quote.getId())
                .reference(quote.getReference())
                .customerId(quote.getCustomerId())
                .customerName(quote.getCustomerName())
                .status(quote.getStatus())
                .validUntil(quote.getValidUntil())
                .notes(quote.getNotes())
                .inventoryId(quote.getInventoryId())
                .locationId(quote.getLocationId())
                .discountPercent(quote.getDiscountPercent())
                .subtotal(quote.getSubtotal())
                .totalAmount(quote.getTotalAmount())
                .createdBy(quote.getCreatedBy())
                .createdAt(quote.getCreatedAt())
                .updatedAt(quote.getUpdatedAt())
                .lines(lineResponses)
                .build();
    }

    private QuoteLineResponse toLineResponse(QuoteLine line) {
        return QuoteLineResponse.builder()
                .id(line.getId())
                .itemId(line.getItemId())
                .itemName(line.getItemName())
                .itemSku(line.getItemSku())
                .quantity(line.getQuantity())
                .unitPrice(line.getUnitPrice())
                .discountPercent(line.getDiscountPercent())
                .totalPrice(line.getTotalPrice())
                .notes(line.getNotes())
                .build();
    }

    private DeliveryNoteResponse toDeliveryResponse(DeliveryNote deliveryNote) {
        List<DeliveryNoteLineResponse> lineResponses = deliveryNote.getLines() != null
                ? deliveryNote.getLines().stream().map(line -> DeliveryNoteLineResponse.builder()
                        .id(line.getId())
                        .itemId(line.getItemId())
                        .itemName(line.getItemName())
                        .itemSku(line.getItemSku())
                        .orderedQuantity(line.getOrderedQuantity())
                        .deliveredQuantity(line.getDeliveredQuantity())
                        .lotId(line.getLotId())
                        .serialId(line.getSerialId())
                        .notes(line.getNotes())
                        .build()).collect(Collectors.toList())
                : new ArrayList<>();

        return DeliveryNoteResponse.builder()
                .id(deliveryNote.getId())
                .reference(deliveryNote.getReference())
                .quoteId(deliveryNote.getQuoteId())
                .customerId(deliveryNote.getCustomerId())
                .customerName(deliveryNote.getCustomerName())
                .inventoryId(deliveryNote.getInventoryId())
                .status(deliveryNote.getStatus())
                .deliveryDate(deliveryNote.getDeliveryDate())
                .deliveryAddress(deliveryNote.getDeliveryAddress())
                .notes(deliveryNote.getNotes())
                .createdBy(deliveryNote.getCreatedBy())
                .createdAt(deliveryNote.getCreatedAt())
                .updatedAt(deliveryNote.getUpdatedAt())
                .lines(lineResponses)
                .build();
    }
}
