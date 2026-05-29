package com.tlaq.ordering_service.service.impl;

import com.tlaq.ordering_service.entity.Orders;
import com.tlaq.ordering_service.exceptions.AppException;
import com.tlaq.ordering_service.exceptions.ErrorCode;
import com.tlaq.ordering_service.repo.OrdersRepository;
import com.tlaq.ordering_service.service.OrderExportService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderExportServiceImpl implements OrderExportService {
    OrdersRepository ordersRepository;

    @Override
    public byte[] exportOrderPdf(String orderId) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        try (java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();

            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 18, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font headerFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font normalFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12, com.lowagie.text.Font.NORMAL);

            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("HOA DON MUA XE (CAR INVOICE)", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(20f);
            document.add(title);

            document.add(new com.lowagie.text.Paragraph("Ma don hang (Order ID): " + order.getId(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Ngay tao (Date): " + order.getCreatedAt(), normalFont));
            document.add(new com.lowagie.text.Paragraph("Trang thai (Status): " + order.getStatus().name(), normalFont));
            document.add(new com.lowagie.text.Paragraph(" "));

            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            addCell(table, "Ma xe (Car ID)", headerFont);
            addCell(table, "Ten nguoi nhan", headerFont);
            addCell(table, "So luong", headerFont);
            addCell(table, "Don gia (VND)", headerFont);

            java.text.NumberFormat currencyFormat = java.text.NumberFormat.getCurrencyInstance(new java.util.Locale("vi", "VN"));

            if (order.getOrderItem() != null) {
                com.tlaq.ordering_service.entity.OrdersDetails detail = order.getOrderItem();
                addCell(table, detail.getCarId(), normalFont);
                String fullName = detail.getFullName() != null ? detail.getFullName() : "N/A";
                // Chuyển tiếng Việt có dấu thành không dấu để iText render font Helvetica không bị lỗi
                addCell(table, java.text.Normalizer.normalize(fullName, java.text.Normalizer.Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+", ""), normalFont);
                addCell(table, "1", normalFont); // quantity is 1
                addCell(table, currencyFormat.format(detail.getUnitPrice()), normalFont);
            }
            document.add(table);

            java.math.BigDecimal baseAmt = order.getBaseAmount();
            if (baseAmt == null && order.getOrderItem() != null) {
                baseAmt = order.getOrderItem().getUnitPrice();
            }
            if (baseAmt == null) baseAmt = java.math.BigDecimal.ZERO;

            java.math.BigDecimal taxAmt = order.getTaxAmount();
            if (taxAmt == null || taxAmt.compareTo(java.math.BigDecimal.ZERO) == 0) {
                String address = "";
                if (order.getOrderItem() != null && order.getOrderItem().getAddress() != null) {
                    address = order.getOrderItem().getAddress().toLowerCase();
                }
                boolean isHanoi = address.contains("ha noi") || address.contains("hà nội");
                java.math.BigDecimal taxRate = java.math.BigDecimal.valueOf(isHanoi ? 0.12 : 0.10);
                taxAmt = baseAmt.multiply(taxRate);
            }

            java.math.BigDecimal plateFee = order.getPlateFeeAmount() != null ? order.getPlateFeeAmount() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal insurance = order.getInsuranceAmount() != null ? order.getInsuranceAmount() : java.math.BigDecimal.ZERO;

            java.math.BigDecimal calcTotal = baseAmt.add(taxAmt).add(plateFee).add(insurance);
            java.math.BigDecimal totalAmt = order.getTotalAmount();
            if (totalAmt == null || totalAmt.compareTo(baseAmt) <= 0) {
                totalAmt = calcTotal;
            }

            document.add(new com.lowagie.text.Paragraph("Gia xe co ban: " + currencyFormat.format(baseAmt), normalFont));
            document.add(new com.lowagie.text.Paragraph("Thue truoc ba: " + currencyFormat.format(taxAmt), normalFont));
            document.add(new com.lowagie.text.Paragraph("Phi bien so: " + currencyFormat.format(plateFee), normalFont));
            document.add(new com.lowagie.text.Paragraph("Phi dang kiem: " + currencyFormat.format(insurance), normalFont));
            
            com.lowagie.text.Paragraph total = new com.lowagie.text.Paragraph("TONG CONG (TOTAL): " + currencyFormat.format(totalAmt), titleFont);
            total.setSpacingBefore(10f);
            document.add(total);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating invoice PDF", e);
        }
    }

    private void addCell(com.lowagie.text.pdf.PdfPTable table, String text, com.lowagie.text.Font font) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(text, font));
        cell.setPadding(5f);
        table.addCell(cell);
    }

    @Override
    public void sendOrderEmail(String orderId, String customerEmail) {
        // Tích hợp gửi email đính kèm PDF qua RabbitMQ nếu cần
    }
}