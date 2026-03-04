package com.tlaq.payment_service.entity;

import com.tlaq.payment_service.entity.enums.PaymentMethod;
import com.tlaq.payment_service.entity.enums.TransactionStatus;
import com.tlaq.payment_service.entity.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    Payment payment;

    @Enumerated(EnumType.STRING)
    TransactionType type; // DEPOSIT (Cọc), BALANCE (Trả nốt), FULL_PAYMENT (Mua đứt)

    @Enumerated(EnumType.STRING)
    PaymentMethod method; // VNPAY, CASH (Tiền mặt), BANK_TRANSFER (Chuyển khoản showroom)

    @Column(precision = 19, scale = 2)
    BigDecimal amount; // Số tiền của riêng lần giao dịch này

    String txnRef; // Mã tham chiếu (Mã đơn hàng VNPAY hoặc mã số biên lai viết tay)

    @Column(name = "vnp_transaction_no")
    String vnpTransactionNo; // Mã giao dịch trả về từ hệ thống VNPAY

    @Enumerated(EnumType.STRING)
    TransactionStatus status; // SUCCESS, FAILED, PROCESSING

    String staffId; // ID nhân viên xác nhận (nếu thanh toán Offline tại showroom)

    String note; // Ghi chú (Vd: "Khách nộp tiền mặt tại showroom Quận 7")

    @CreationTimestamp
    LocalDateTime createdAt;
}