package com.stock.salesservice.service;

import com.stock.salesservice.dto.request.DeliveryNoteRequest;
import com.stock.salesservice.dto.response.DeliveryNoteResponse;
import com.stock.salesservice.enums.DeliveryNoteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface DeliveryNoteService {

    DeliveryNoteResponse createDeliveryNote(DeliveryNoteRequest request, String createdBy);

    DeliveryNoteResponse getDeliveryNoteById(UUID id);

    Page<DeliveryNoteResponse> getAllDeliveryNotes(DeliveryNoteStatus status, String customerId, Pageable pageable);

    DeliveryNoteResponse updateDeliveryNote(UUID id, DeliveryNoteRequest request);

    void deleteDeliveryNote(UUID id);

    DeliveryNoteResponse validateDeliveryNote(UUID id, String authToken);

    List<DeliveryNoteResponse> getDeliveryNotesByCustomer(String customerId);
}
