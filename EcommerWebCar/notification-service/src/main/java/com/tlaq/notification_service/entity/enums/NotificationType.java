package com.tlaq.notification_service.entity.enums;

public enum NotificationType {
    ORDER_SUCCESS,   // Đặt hàng thành công
    DEPOSIT_SUCCESS, // Đặt cọc thành công
    NEW_MESSAGE,     // Có tin nhắn chat mới
    PROMOTION,       // Khuyến mãi
    SYSTEM,          // Thông báo từ hệ thống
    USER_REGISTERED  // Đăng ký tài khoản mới thành công
}