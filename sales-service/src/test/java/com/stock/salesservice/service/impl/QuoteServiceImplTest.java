package com.stock.salesservice.service.impl;

import com.stock.salesservice.dto.request.ConvertToDeliveryRequest;
import com.stock.salesservice.dto.request.QuoteLineRequest;
import com.stock.salesservice.dto.request.QuoteRequest;
import com.stock.salesservice.dto.response.DeliveryNoteResponse;
import com.stock.salesservice.dto.response.QuoteResponse;
import com.stock.salesservice.entity.DeliveryNote;
import com.stock.salesservice.entity.Quote;
import com.stock.salesservice.entity.QuoteLine;
import com.stock.salesservice.enums.QuoteStatus;
import com.stock.salesservice.exception.BusinessException;
import com.stock.salesservice.exception.ResourceNotFoundException;
import com.stock.salesservice.repository.DeliveryNoteRepository;
import com.stock.salesservice.repository.QuoteRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class QuoteServiceImplTest {

    @Mock
    private QuoteRepository quoteRepository;

    @Mock
    private DeliveryNoteRepository deliveryNoteRepository;

    @InjectMocks
    private QuoteServiceImpl quoteService;

    private static final UUID QUOTE_ID = UUID.randomUUID();

    private Quote buildQuote(QuoteStatus status) {
        return Quote.builder()
                .id(QUOTE_ID)
                .reference("QT-2026-0001")
                .customerId("CUST-01")
                .customerName("Globex Corp")
                .status(status)
                .discountPercent(BigDecimal.ZERO)
                .subtotal(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .createdBy("user1")
                .lines(new ArrayList<>())
                .build();
    }

    private QuoteLine buildLine(int qty, String unitPrice, String discount) {
        BigDecimal total = new BigDecimal(unitPrice)
                .multiply(BigDecimal.valueOf(qty))
                .multiply(BigDecimal.ONE.subtract(new BigDecimal(discount).divide(BigDecimal.valueOf(100))));
        return QuoteLine.builder()
                .itemId("ITEM-01")
                .itemName("Widget")
                .itemSku("WGT-001")
                .quantity(qty)
                .unitPrice(new BigDecimal(unitPrice))
                .discountPercent(new BigDecimal(discount))
                .totalPrice(total)
                .build();
    }

    // ── createQuote ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createQuote: lines with discount → calculates totals correctly")
    void createQuote_withDiscountedLines_calculatesCorrectTotals() {
        QuoteLineRequest lineReq = QuoteLineRequest.builder()
                .itemId("ITEM-01").itemName("Widget").itemSku("WGT-001")
                .quantity(10).unitPrice(new BigDecimal("100.00"))
                .discountPercent(new BigDecimal("10"))
                .build();

        QuoteRequest request = QuoteRequest.builder()
                .customerId("CUST-01").customerName("Globex")
                .discountPercent(BigDecimal.ZERO)
                .lines(List.of(lineReq))
                .build();

        given(quoteRepository.countByYear(any(Integer.class))).willReturn(0L);
        given(quoteRepository.save(any(Quote.class))).willAnswer(inv -> {
            Quote q = inv.getArgument(0);
            // line total: 10 * 100 * (1 - 10/100) = 900.00
            assertThat(q.getSubtotal()).isEqualByComparingTo("900.00");
            assertThat(q.getTotalAmount()).isEqualByComparingTo("900.00");
            assertThat(q.getStatus()).isEqualTo(QuoteStatus.DRAFT);
            return q;
        });

        QuoteResponse response = quoteService.createQuote(request, "user1");

        assertThat(response).isNotNull();
        then(quoteRepository).should().save(any(Quote.class));
    }

    @Test
    @DisplayName("createQuote: quote-level discount applied on top of line totals")
    void createQuote_withQuoteLevelDiscount_appliesDiscountOnSubtotal() {
        QuoteLineRequest lineReq = QuoteLineRequest.builder()
                .itemId("ITEM-01").itemName("Widget").quantity(4)
                .unitPrice(new BigDecimal("250.00"))
                .discountPercent(BigDecimal.ZERO)
                .build();

        QuoteRequest request = QuoteRequest.builder()
                .customerId("C1").discountPercent(new BigDecimal("20"))
                .lines(List.of(lineReq))
                .build();

        given(quoteRepository.countByYear(any(Integer.class))).willReturn(0L);
        given(quoteRepository.save(any(Quote.class))).willAnswer(inv -> {
            Quote q = inv.getArgument(0);
            // subtotal: 4 * 250 = 1000; quote discount 20% → total = 800
            assertThat(q.getSubtotal()).isEqualByComparingTo("1000.00");
            assertThat(q.getTotalAmount()).isEqualByComparingTo("800.00");
            return q;
        });

        quoteService.createQuote(request, "user1");
    }

    // ── updateQuote ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateQuote: SENT status → throws BusinessException")
    void updateQuote_whenNotDraft_throwsBusinessException() {
        given(quoteRepository.findByIdWithLines(QUOTE_ID))
                .willReturn(Optional.of(buildQuote(QuoteStatus.SENT)));

        assertThatThrownBy(() -> quoteService.updateQuote(QUOTE_ID, new QuoteRequest()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("DRAFT");
    }

    @Test
    @DisplayName("updateQuote: missing quote → throws ResourceNotFoundException")
    void updateQuote_whenNotFound_throws() {
        given(quoteRepository.findByIdWithLines(QUOTE_ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> quoteService.updateQuote(QUOTE_ID, new QuoteRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── deleteQuote ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteQuote: DRAFT status → deletes successfully")
    void deleteQuote_whenDraft_succeeds() {
        Quote quote = buildQuote(QuoteStatus.DRAFT);
        given(quoteRepository.findById(QUOTE_ID)).willReturn(Optional.of(quote));

        quoteService.deleteQuote(QUOTE_ID);

        then(quoteRepository).should().delete(quote);
    }

    @Test
    @DisplayName("deleteQuote: REJECTED status → deletes successfully")
    void deleteQuote_whenRejected_succeeds() {
        Quote quote = buildQuote(QuoteStatus.REJECTED);
        given(quoteRepository.findById(QUOTE_ID)).willReturn(Optional.of(quote));

        quoteService.deleteQuote(QUOTE_ID);

        then(quoteRepository).should().delete(quote);
    }

    @Test
    @DisplayName("deleteQuote: SENT status → throws BusinessException")
    void deleteQuote_whenSent_throwsBusinessException() {
        given(quoteRepository.findById(QUOTE_ID))
                .willReturn(Optional.of(buildQuote(QuoteStatus.SENT)));

        assertThatThrownBy(() -> quoteService.deleteQuote(QUOTE_ID))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("DRAFT or REJECTED");
    }

    @Test
    @DisplayName("deleteQuote: ACCEPTED status → throws BusinessException")
    void deleteQuote_whenAccepted_throwsBusinessException() {
        given(quoteRepository.findById(QUOTE_ID))
                .willReturn(Optional.of(buildQuote(QuoteStatus.ACCEPTED)));

        assertThatThrownBy(() -> quoteService.deleteQuote(QUOTE_ID))
                .isInstanceOf(BusinessException.class);
    }

    // ── sendQuote ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("sendQuote: DRAFT → transitions to SENT")
    void sendQuote_whenDraft_transitionsToSent() {
        Quote quote = buildQuote(QuoteStatus.DRAFT);
        given(quoteRepository.findByIdWithLines(QUOTE_ID)).willReturn(Optional.of(quote));
        given(quoteRepository.save(quote)).willAnswer(inv -> inv.getArgument(0));

        QuoteResponse response = quoteService.sendQuote(QUOTE_ID);

        assertThat(response.getStatus()).isEqualTo(QuoteStatus.SENT);
    }

    @Test
    @DisplayName("sendQuote: ACCEPTED status → throws BusinessException")
    void sendQuote_whenNotDraft_throwsBusinessException() {
        given(quoteRepository.findByIdWithLines(QUOTE_ID))
                .willReturn(Optional.of(buildQuote(QuoteStatus.ACCEPTED)));

        assertThatThrownBy(() -> quoteService.sendQuote(QUOTE_ID))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("DRAFT");
    }

    // ── acceptQuote ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("acceptQuote: SENT → transitions to ACCEPTED")
    void acceptQuote_whenSent_transitionsToAccepted() {
        Quote quote = buildQuote(QuoteStatus.SENT);
        given(quoteRepository.findByIdWithLines(QUOTE_ID)).willReturn(Optional.of(quote));
        given(quoteRepository.save(quote)).willAnswer(inv -> inv.getArgument(0));

        QuoteResponse response = quoteService.acceptQuote(QUOTE_ID);

        assertThat(response.getStatus()).isEqualTo(QuoteStatus.ACCEPTED);
    }

    @Test
    @DisplayName("acceptQuote: DRAFT status → throws BusinessException")
    void acceptQuote_whenNotSent_throwsBusinessException() {
        given(quoteRepository.findByIdWithLines(QUOTE_ID))
                .willReturn(Optional.of(buildQuote(QuoteStatus.DRAFT)));

        assertThatThrownBy(() -> quoteService.acceptQuote(QUOTE_ID))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("SENT");
    }

    // ── rejectQuote ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("rejectQuote: SENT → transitions to REJECTED")
    void rejectQuote_whenSent_transitionsToRejected() {
        Quote quote = buildQuote(QuoteStatus.SENT);
        given(quoteRepository.findByIdWithLines(QUOTE_ID)).willReturn(Optional.of(quote));
        given(quoteRepository.save(quote)).willAnswer(inv -> inv.getArgument(0));

        QuoteResponse response = quoteService.rejectQuote(QUOTE_ID);

        assertThat(response.getStatus()).isEqualTo(QuoteStatus.REJECTED);
    }

    @Test
    @DisplayName("rejectQuote: DRAFT status → throws BusinessException")
    void rejectQuote_whenNotSent_throwsBusinessException() {
        given(quoteRepository.findByIdWithLines(QUOTE_ID))
                .willReturn(Optional.of(buildQuote(QuoteStatus.DRAFT)));

        assertThatThrownBy(() -> quoteService.rejectQuote(QUOTE_ID))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("SENT");
    }

    // ── expireQuote ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("expireQuote: DRAFT → transitions to EXPIRED")
    void expireQuote_whenDraft_transitionsToExpired() {
        Quote quote = buildQuote(QuoteStatus.DRAFT);
        given(quoteRepository.findByIdWithLines(QUOTE_ID)).willReturn(Optional.of(quote));
        given(quoteRepository.save(quote)).willAnswer(inv -> inv.getArgument(0));

        QuoteResponse response = quoteService.expireQuote(QUOTE_ID);

        assertThat(response.getStatus()).isEqualTo(QuoteStatus.EXPIRED);
    }

    @Test
    @DisplayName("expireQuote: SENT → transitions to EXPIRED")
    void expireQuote_whenSent_transitionsToExpired() {
        Quote quote = buildQuote(QuoteStatus.SENT);
        given(quoteRepository.findByIdWithLines(QUOTE_ID)).willReturn(Optional.of(quote));
        given(quoteRepository.save(quote)).willAnswer(inv -> inv.getArgument(0));

        QuoteResponse response = quoteService.expireQuote(QUOTE_ID);

        assertThat(response.getStatus()).isEqualTo(QuoteStatus.EXPIRED);
    }

    @Test
    @DisplayName("expireQuote: ACCEPTED status → throws BusinessException")
    void expireQuote_whenAccepted_throwsBusinessException() {
        given(quoteRepository.findByIdWithLines(QUOTE_ID))
                .willReturn(Optional.of(buildQuote(QuoteStatus.ACCEPTED)));

        assertThatThrownBy(() -> quoteService.expireQuote(QUOTE_ID))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("DRAFT or SENT");
    }

    @Test
    @DisplayName("expireQuote: CONVERTED status → throws BusinessException")
    void expireQuote_whenConverted_throwsBusinessException() {
        given(quoteRepository.findByIdWithLines(QUOTE_ID))
                .willReturn(Optional.of(buildQuote(QuoteStatus.CONVERTED)));

        assertThatThrownBy(() -> quoteService.expireQuote(QUOTE_ID))
                .isInstanceOf(BusinessException.class);
    }

    // ── convertToDelivery ────────────────────────────────────────────────────────

    @Test
    @DisplayName("convertToDelivery: ACCEPTED → creates DeliveryNote, marks quote CONVERTED")
    void convertToDelivery_whenAccepted_createsDeliveryNoteAndConvertsQuote() {
        Quote quote = buildQuote(QuoteStatus.ACCEPTED);
        QuoteLine line = buildLine(2, "50.00", "0");
        quote.getLines().add(line);
        quote.setTotalAmount(new BigDecimal("100.00"));

        ConvertToDeliveryRequest req = ConvertToDeliveryRequest.builder()
                .deliveryAddress("456 Delivery Ave")
                .build();

        given(quoteRepository.findByIdWithLines(QUOTE_ID)).willReturn(Optional.of(quote));
        given(deliveryNoteRepository.countByYear(any(Integer.class))).willReturn(0L);
        given(deliveryNoteRepository.save(any(DeliveryNote.class))).willAnswer(inv -> {
            DeliveryNote dn = inv.getArgument(0);
            assertThat(dn.getCustomerId()).isEqualTo("CUST-01");
            assertThat(dn.getLines()).hasSize(1);
            assertThat(dn.getTotalAmount()).isEqualByComparingTo("100.00");
            return dn;
        });
        given(quoteRepository.save(quote)).willReturn(quote);

        DeliveryNoteResponse response = quoteService.convertToDelivery(QUOTE_ID, req, "user1");

        assertThat(response).isNotNull();
        assertThat(quote.getStatus()).isEqualTo(QuoteStatus.CONVERTED);
    }

    @Test
    @DisplayName("convertToDelivery: DRAFT status → throws BusinessException")
    void convertToDelivery_whenNotAccepted_throwsBusinessException() {
        given(quoteRepository.findByIdWithLines(QUOTE_ID))
                .willReturn(Optional.of(buildQuote(QuoteStatus.DRAFT)));

        assertThatThrownBy(() -> quoteService.convertToDelivery(
                QUOTE_ID, new ConvertToDeliveryRequest(), "user1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ACCEPTED");
    }

    @Test
    @DisplayName("convertToDelivery: missing quote → throws ResourceNotFoundException")
    void convertToDelivery_whenNotFound_throwsResourceNotFound() {
        given(quoteRepository.findByIdWithLines(QUOTE_ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> quoteService.convertToDelivery(
                QUOTE_ID, new ConvertToDeliveryRequest(), "user1"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
