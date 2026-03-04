package com.tlaq.catalog_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.entity.Car;
import com.tlaq.catalog_service.entity.CarImage;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.CarMapper;
import com.tlaq.catalog_service.repo.CarRepository;
import com.tlaq.catalog_service.service.CarService;
import com.tlaq.catalog_service.specifications.CarSpecification;
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
    Cloudinary cloudinary;
    ObjectMapper objectMapper;

    @Override
    public PageResponse<CarResponse> getCar(int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = carRepository.findAll(pageable);
        return PageResponse.<CarResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(carMapper::toCarResponse).toList())
                .build();
    }

    @Override
    public CarResponse getCarDetails(String carId) {
        Car car = carRepository.findById(carId).orElseThrow(()-> new AppException(ErrorCode.CAR_NOT_FOUND));
        CarResponse carDetailsResponse= carMapper.toCarResponse(car);
        carDetailsResponse.setName(car.getCarModel().getCarBranch().getName() + " " +
                car.getCarModel().getCategory().getName()+ " " +
                car.getCarModel().getName() + " " + car.getYear().toString().split("-")[0]);
        return carDetailsResponse;
    }

    @Override
    public void createCarDetail(CarRequest request, List<MultipartFile> images) {
        Car car= carMapper.toCar(request);
        List<CarImage> carImageList = new ArrayList<>();

        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                try {
                    Map res = cloudinary.uploader().upload(img.getBytes(),
                            ObjectUtils.asMap("resource_type", "auto"));
                    String imageUrl = res.get("secure_url").toString();
                    CarImage carImage = CarImage.builder()
                            .image(imageUrl)
                            .build();
                    carImageList.add(carImage);
                } catch (IOException ex) {
                    throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
                }
            }
        }else{
            throw new AppException(ErrorCode.IMAGE_IS_EMPTY);
        }
        car.setCarImages(carImageList);
        carRepository.save(car);
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
