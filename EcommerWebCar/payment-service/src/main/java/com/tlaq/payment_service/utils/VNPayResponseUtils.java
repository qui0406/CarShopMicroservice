package com.tlaq.payment_service.utils;

import com.tlaq.payment_service.dto.response.StatusCodeVNPayResponse;

public class VNPayResponseUtils {
    public static final StatusCodeVNPayResponse SUCCESS = new StatusCodeVNPayResponse("00", "Successful");
    public static final StatusCodeVNPayResponse SIGNATURE_FAILED = new StatusCodeVNPayResponse("97", "Signature failed");
    public static final StatusCodeVNPayResponse ORDER_NOT_FOUND = new StatusCodeVNPayResponse("01", "Order not found");
    public static final StatusCodeVNPayResponse UNKNOWN_ERROR = new StatusCodeVNPayResponse("99", "Unknown error");
}
