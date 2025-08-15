package com.tlaq.utils;

import com.tlaq.dto.response.ResponseCodeVNPay;

public class VNPayResponseUtils {
    public static final ResponseCodeVNPay SUCCESS = new ResponseCodeVNPay("00", "Successful");
    public static final ResponseCodeVNPay SIGNATURE_FAILED = new ResponseCodeVNPay("97", "Signature failed");
    public static final ResponseCodeVNPay ORDER_NOT_FOUND = new ResponseCodeVNPay("01", "Order not found");
    public static final ResponseCodeVNPay UNKNOWN_ERROR = new ResponseCodeVNPay("99", "Unknown error");
}
