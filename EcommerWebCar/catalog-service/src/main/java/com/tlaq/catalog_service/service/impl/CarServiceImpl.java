package com.tlaq.catalog_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.dto.response.CarSummaryResponse;
import com.tlaq.catalog_service.entity.*;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.CarMapper;
import com.tlaq.catalog_service.repo.CarModelRepository;
import com.tlaq.catalog_service.repo.CarRepository;
import com.tlaq.catalog_service.service.CarService;
import com.tlaq.catalog_service.specifications.CarSpecification;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class CarServiceImpl implements CarService {
    CarMapper carMapper;
    CarRepository carRepository;
    CarModelRepository carModelRepository;
    Cloudinary cloudinary;
    ObjectMapper objectMapper;

    @Override
    public PageResponse<CarSummaryResponse> getCar(int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = carRepository.findAll(pageable);
        return PageResponse.<CarSummaryResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(carMapper.toListCarSummaryResponses(pageData.getContent()))
                .build();
    }

    @Override
    public CarResponse getCarDetails(String carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        CarResponse response = carMapper.toCarResponse(car);

        // Tạo tên hiển thị: Brand + Model Name + Trim (Vd: Hyundai Santa Fe Luxury)
        String fullName = String.format("%s %s %s",
                car.getCarModel().getCarBranch().getName(),
                car.getCarModel().getName(),
                car.getCarModel().getTechnicalSpec().getTrimLevel());

        response.setName(fullName);
        return response;
    }

    @Override
    public BigDecimal getPrice(String carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));
        return car.getPrice();
    }

    @Override
    @Transactional
    public CarResponse createCarDetail(CarRequest request, List<MultipartFile> images) {
        // 1. Tìm CarModel đã tồn tại trong hệ thống (Model này đã có sẵn Spec và Equipment)
        CarModel model = carModelRepository.findById(request.getCarModelId())
                .orElseThrow(() -> new AppException(ErrorCode.MODEL_NOT_FOUND));

        // 2. Map thông tin cơ bản của chiếc xe (Màu sắc, số VIN, giá, odo...)
        Car car = carMapper.toCar(request);
        car.setCarModel(model); // Gán "bố" cho chiếc xe

        // 3. Xử lý ảnh thực tế cho chiếc xe
        if (images != null && !images.isEmpty()) {
            List<CarImage> carImages = new ArrayList<>();
            for (MultipartFile img : images) {
                try {
                    Map uploadResult = cloudinary.uploader().upload(img.getBytes(),
                            ObjectUtils.asMap("resource_type", "auto"));
                    String url = uploadResult.get("secure_url").toString();

                    // Lưu ý: Trường trong Entity của Quí là 'image'
                    carImages.add(CarImage.builder()
                            .image(url)
                            .car(car)
                            .build());
                } catch (IOException ex) {
                    log.error("Cloudinary upload failed: {}", ex.getMessage());
                    throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
                }
            }
            car.setCarImages(carImages);
        }

        // 4. Lưu vào DB và trả về Response
        Car savedCar = carRepository.save(car);
        return carMapper.toCarResponse(savedCar);
    }

    @Override
    public void delete(String carId) {
        Car car=  carRepository.findById(carId).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));
        carRepository.delete(car);
    }

    @Override
    public PageResponse<CarResponse> filterCar(Map<String, String> filter) {
        // Ép kiểu rõ ràng để tránh lỗi Ambiguous [cite: 2026-02-25]
        Specification<Car> spec = Specification.where((Specification<Car>) null);

        // Thêm các điều kiện lọc [cite: 2026-02-25]
        if (filter.get("branch") != null)
            spec = spec.and(CarSpecification.hasBranch(filter.get("branch")));

        if (filter.get("isUsed") != null)
            spec = spec.and(CarSpecification.hasCondition(Boolean.valueOf(filter.get("isUsed"))));

        // Xử lý Phân trang và Sắp xếp [cite: 2026-02-25]
        int page = Integer.parseInt(filter.getOrDefault("page", "1"));
        int size = Integer.parseInt(filter.getOrDefault("size", "10"));
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        // Sau khi thêm JpaSpecificationExecutor, dòng này sẽ hết lỗi [cite: 2026-02-25]
        var pageData = carRepository.findAll(spec, pageable);

        return PageResponse.<CarResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(carMapper::toCarResponse).toList())
                .build();
    }
}
