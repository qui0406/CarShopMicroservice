package com.tlaq.catalog_service.service;



import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarModelRequest;
import com.tlaq.catalog_service.dto.response.CarModelResponse;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CarModelService {
    PageResponse<CarModelResponse> getAll(int page, int size);
    CarModelResponse getById(Long id);
    CarModelResponse create(CarModelRequest request);
    void deleteById(Long id);
}
