package com.tlaq.catalog_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarBatchItemRequest;
import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.response.CarBatchResponse;
import com.tlaq.catalog_service.dto.response.CarResponse;
import com.tlaq.catalog_service.dto.response.CarSummaryResponse;
import com.tlaq.catalog_service.dto.response.Model3DResponse;
import com.tlaq.catalog_service.entity.*;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.CarMapper;
import com.tlaq.catalog_service.repo.CarModelRepository;
import com.tlaq.catalog_service.repo.CarRepository;
import com.tlaq.catalog_service.repo.InventoryRepository;
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
import java.util.Arrays;
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
    InventoryRepository inventoryRepository;

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
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));
        car.setDeleted(true);
        carRepository.save(car);
    }

    @Override
    public PageResponse<CarResponse> filterCar(Map<String, String> filter) {
        Specification<Car> spec = Specification.where((Specification<Car>) null);

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

    @Override
    @Transactional
    public Model3DResponse upload3DModel(String carId, MultipartFile file) throws IOException {
        // 1. Kiểm tra file rỗng
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_IS_EMPTY); // Quí tự thêm ErrorCode tương ứng nhé
        }

        // 2. Kiểm tra kích thước file (Ví dụ: Giới hạn tối đa 50MB cho mô hình 3D)
        long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }

        // 3. Kiểm tra định dạng file (Chỉ cho phép các file 3D thông dụng)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new AppException(ErrorCode.INVALID_FILE_FORMAT);
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        List<String> allowedExtensions = Arrays.asList("glb", "gltf", "obj", "fbx"); // Thêm bớt đuôi file tùy nhu cầu

        if (!allowedExtensions.contains(extension)) {
            throw new AppException(ErrorCode.INVALID_FILE_FORMAT);
        }

        // 4. Lấy thông tin xe TRƯỚC KHI upload. (Tránh upload rác lên Cloudinary nếu carId sai)
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // 5. Tiến hành upload lên Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "raw",
                "public_id", "car_models/" + System.currentTimeMillis() + "_" + originalFilename, // Thêm timestamp để tránh trùng tên file
                "folder", "ecommerce_cars"
        ));

        String url = uploadResult.get("secure_url").toString();

        // 6. Cập nhật vào Database
        car.setModel3dUrl(url);
        carRepository.save(car);

        return Model3DResponse.builder()
                .model3dUrl(url)
                .carId(car.getId())
                .build();
    }

    @Override
    public List<CarBatchResponse> validateBatch(List<CarBatchItemRequest> items) {
        if (items == null || items.isEmpty()) return new ArrayList<>();

        List<String> carIds = items.stream().map(CarBatchItemRequest::getCarId).toList();

        Map<String, Car> carMap = carRepository.findAllById(carIds).stream()
                .collect(java.util.stream.Collectors.toMap(Car::getId, c -> c));

        return items.stream().map(item -> {
            Car car = carMap.get(item.getCarId());
            if (car == null) throw new AppException(ErrorCode.CAR_NOT_FOUND);

            boolean inStock = inventoryRepository.findInventoryByCarId(item.getCarId())
                    .map(inv -> inv.getQuantity() >= item.getQuantity())
                    .orElse(false);

            return CarBatchResponse.builder()
                    .carDetail(carMapper.toCarResponse(car))
                    .inStock(inStock)
                    .build();
        }).toList();
    }
}
