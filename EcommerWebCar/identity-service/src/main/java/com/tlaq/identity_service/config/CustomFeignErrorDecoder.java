package com.tlaq.identity_service.config;

import com.tlaq.identity_service.exception.AppException;
import com.tlaq.identity_service.exception.ErrorCode;
import feign.Response;
import feign.codec.ErrorDecoder;

public class CustomFeignErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String s, Response response) {
        if (response.status() == 401) {
            return new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return new Default().decode("", response);
    }
}
