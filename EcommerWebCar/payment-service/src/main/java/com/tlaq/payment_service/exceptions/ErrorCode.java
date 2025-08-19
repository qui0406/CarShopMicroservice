package com.tlaq.payment_service.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1009, "Invalid email address", HttpStatus.BAD_REQUEST),
    EMAIL_IS_REQUIRED(1009, "Email is required", HttpStatus.BAD_REQUEST),
    UPLOAD_AVATAR_ERROR(1010, "Error upload avatar", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1011, "Email existed", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1012, "Role not found", HttpStatus.NOT_FOUND),
    PERMISSION_NOT_FOUND(1013, "Permission not found", HttpStatus.NOT_FOUND),
    USERNAME_IS_MISSING(1014, "Enter username", HttpStatus.BAD_REQUEST),
    REQUEST_CAR_IS_EMPTY(1015, "Car is empty", HttpStatus.BAD_REQUEST),
    CAR_TYPE_NOT_EXISTED(1016, "Car type not existed", HttpStatus.BAD_REQUEST),
    IMAGE_IS_EMPTY(1017, "Image is empty", HttpStatus.BAD_REQUEST),
    UPLOAD_IMAGE_ERROR(1018, "Error upload image", HttpStatus.BAD_REQUEST),
    INVALID_PARAMETER(1019, "Invalid parameter", HttpStatus.BAD_REQUEST),
    CAR_NOT_FOUND(1020, "Car not found", HttpStatus.NOT_FOUND),
    SHOW_ROOM_IS_EMPTY(1021, "Show room is empty", HttpStatus.BAD_REQUEST),
    USER_HAS_SHOW_ROOM(1022, "User has show room", HttpStatus.BAD_REQUEST),
    SHOW_ROOM_NOT_FOUND(1023, "Show room not found", HttpStatus.NOT_FOUND),
    VOUCHER_IS_EMPTY(1024, "Voucher is empty", HttpStatus.BAD_REQUEST),
    NEWS_IS_EMPTY(1025, "News is empty", HttpStatus.BAD_REQUEST),
    ORDER_WAS_PAYMENT(1026, "Order was payment", HttpStatus.BAD_REQUEST),
    BILL_NOT_FOUND(1027, "Bill not found", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND(1028, "Order not found", HttpStatus.NOT_FOUND),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
