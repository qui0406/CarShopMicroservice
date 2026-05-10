package com.tlaq.ordering_service.dto.message;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Message gửi đến catalog-service để trừ hoặc hoàn kho.
 *
 * <p>{@code rollback = false} → trừ kho khi tạo đơn.
 * <p>{@code rollback = true}  → hoàn kho khi hủy/timeout đơn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderInventoryMessage {

    String orderId;

    /** true = hoàn kho, false = trừ kho */
    boolean rollback;

    List<InventoryUpdateMessage> items;
}
