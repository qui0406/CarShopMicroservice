package com.tlaq.catalog_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.CarBatchItemRequest;
import com.tlaq.catalog_service.dto.request.CarRequest;
import com.tlaq.catalog_service.dto.response.*;
import com.tlaq.catalog_service.entity.*;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.CarMapper;
import com.tlaq.catalog_service.mapper.TechSpecMapper;
import com.tlaq.catalog_service.mapper.EquipmentMapper;
import com.tlaq.catalog_service.repo.CarModelRepository;
import com.tlaq.catalog_service.repo.CarRepository;
import com.tlaq.catalog_service.repo.ShowRoomRepository;
import com.tlaq.catalog_service.service.CarService;
import com.tlaq.catalog_service.repo.CarSpecification;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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
    ShowRoomRepository showRoomRepository;
    TechSpecMapper techSpecMapper;
    EquipmentMapper equipmentMapper;

    @Override
    public PageResponse<CarSummaryResponse> getCars(boolean isReady, boolean isUsed, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = carRepository.findByIsReadyAndIsUsed(isReady, isUsed, pageable);
        return PageResponse.<CarSummaryResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(carMapper.toListCarSummaryResponses(pageData.getContent()))
                .build();
    }

    @Override
    public PageResponse<CarSummaryResponse> getStaffCars(int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Page<Car> pageData = carRepository.findAll(pageable);

        List<CarSummaryResponse> responses = pageData.getContent().stream().map(car -> {
            CarSummaryResponse res = carMapper.toCarSummaryResponse(car);
            res.setQuantity(car.isReady() ? 1 : 0);
            return res;
        }).toList();

        return PageResponse.<CarSummaryResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(responses)
                .build();
    }

    @Override
    public PageResponse<ListCarStaffResponse> getStaffManagementCars(int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Page<Car> pageData = carRepository.findAll(pageable);

        List<ListCarStaffResponse> responses = pageData.getContent().stream().map(car -> {
            ListCarStaffResponse res = carMapper.toListCarStaffResponse(car);
            return res;
        }).toList();

        return PageResponse.<com.tlaq.catalog_service.dto.response.ListCarStaffResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(responses)
                .build();
    }

    @Override
    public CarResponse getCarDetails(String carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        return carMapper.toCarResponse(car);
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
        CarModel model = carModelRepository.findById(request.getCarModelId())
                .orElseThrow(() -> new AppException(ErrorCode.MODEL_NOT_FOUND));

        Car car = carMapper.toCar(request);
        car.setCarModel(model);

        if (request.getShowRoomId() != null && !request.getShowRoomId().isEmpty()) {
            ShowRoom showRoom = showRoomRepository.findById(request.getShowRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));
            car.setShowRoom(showRoom);
        }

        if (request.getTechnicalSpec() != null) {
            car.setTechnicalSpec(techSpecMapper.toEntity(request.getTechnicalSpec()));
        }
        if (request.getEquipment() != null) {
            car.setEquipment(equipmentMapper.toEntity(request.getEquipment()));
        }

        if (images != null && !images.isEmpty()) {
            List<CarImage> carImages = new ArrayList<>();
            for (MultipartFile img : images) {
                try {
                    Map uploadResult = cloudinary.uploader().upload(img.getBytes(),
                            ObjectUtils.asMap("resource_type", "auto"));
                    String url = uploadResult.get("secure_url").toString();

                    carImages.add(CarImage.builder()
                            .image(url)
                            .car(car)
                            .build());
                } catch (IOException ex) {
                    throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
                }
            }
            car.setCarImages(carImages);
        }

        Car savedCar = carRepository.save(car);
        return carMapper.toCarResponse(savedCar);
    }

    @Override
    @Transactional
    public CarResponse updateCarDetail(String carId, CarRequest request, List<MultipartFile> images) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        carMapper.updateCar(car, request);

        if (request.getCarModelId() != null) {
            CarModel model = carModelRepository.findById(request.getCarModelId())
                    .orElseThrow(() -> new AppException(ErrorCode.MODEL_NOT_FOUND));
            car.setCarModel(model);
        }

        if (request.getShowRoomId() != null) {
            if (request.getShowRoomId().isEmpty()) {
                car.setShowRoom(null);
            } else {
                ShowRoom showRoom = showRoomRepository.findById(request.getShowRoomId())
                        .orElseThrow(() -> new AppException(ErrorCode.SHOWROOM_NOT_FOUND));
                car.setShowRoom(showRoom);
            }
        }

        if (request.getTechnicalSpec() != null) {
            if (car.getTechnicalSpec() == null) {
                car.setTechnicalSpec(techSpecMapper.toEntity(request.getTechnicalSpec()));
            } else {
                techSpecMapper.updateEntity(car.getTechnicalSpec(), request.getTechnicalSpec());
            }
        }

        if (request.getEquipment() != null) {
            if (car.getEquipment() == null) {
                car.setEquipment(equipmentMapper.toEntity(request.getEquipment()));
            } else {
                equipmentMapper.updateEntity(car.getEquipment(), request.getEquipment());
            }
        }

        if (images != null && !images.isEmpty()) {
            car.getCarImages().clear();
            
            for (MultipartFile img : images) {
                try {
                    Map uploadResult = cloudinary.uploader().upload(img.getBytes(),
                            ObjectUtils.asMap("resource_type", "auto"));
                    String url = uploadResult.get("secure_url").toString();

                    car.getCarImages().add(CarImage.builder()
                            .image(url)
                            .car(car)
                            .build());
                } catch (IOException ex) {
                    throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
                }
            }
        }

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
        Specification<Car> spec = Specification.where(CarSpecification.isReady());

        if (filter.get("carBranch") != null)
            spec = spec.and(CarSpecification.hasBranch(filter.get("carBranch")));

        if (filter.get("carCategory") != null)
            spec = spec.and(CarSpecification.hasCategory(filter.get("carCategory")));

        if (filter.get("carName") != null)
            spec = spec.and(CarSpecification.hasNameLike(filter.get("carName")));

        if (filter.get("price") != null) {
            BigDecimal maxPrice = new BigDecimal(filter.get("price"));
            spec = spec.and(CarSpecification.priceBetween(BigDecimal.ZERO, maxPrice));
        }

        if (filter.get("isUsed") != null)
            spec = spec.and(CarSpecification.hasCondition(Boolean.valueOf(filter.get("isUsed"))));

        int page = Integer.parseInt(filter.getOrDefault("page", "1"));
        int size = Integer.parseInt(filter.getOrDefault("size", "10"));
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);

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
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_IS_EMPTY);
        }

        long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new AppException(ErrorCode.INVALID_FILE_FORMAT);
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        List<String> allowedExtensions = Arrays.asList("glb", "gltf", "obj", "fbx");
        if (!allowedExtensions.contains(extension)) {
            throw new AppException(ErrorCode.INVALID_FILE_FORMAT);
        }

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "raw",
                "public_id", "car_models/" + System.currentTimeMillis() + "_" + originalFilename, // Thêm timestamp để tránh trùng tên file
                "folder", "ecommerce_cars"
        ));

        String url = uploadResult.get("secure_url").toString();

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

            boolean inStock = car.isReady() && !car.isDeleted() && !car.isDeposited() && !car.isSold() && item.getQuantity() == 1;

            return CarBatchResponse.builder()
                    .carDetail(carMapper.toCarResponse(car))
                    .inStock(inStock)
                    .build();
        }).toList();
    }

    @Override
    @Transactional
    public void markCarDeposited(String carId) {
        int rowsUpdated = carRepository.markAsDeposited(carId);
        if (rowsUpdated > 0) {
            log.info("Đã đánh dấu xe {} đang đặt cọc (isDeposited = true)", carId);
        } else {
            log.warn("Không thể đánh dấu đặt cọc cho xe {}", carId);
            throw new AppException(ErrorCode.QUANTITY_NOT_ENOUGH);
        }
    }

    @Override
    @Transactional
    public void unmarkCarDeposited(String carId) {
        int rowsUpdated = carRepository.unmarkDeposited(carId);
        if (rowsUpdated > 0) {
            log.info("Đã hủy đánh dấu đặt cọc cho xe {} (isDeposited = false)", carId);
        } else {
            log.warn("Không thể hủy đánh dấu đặt cọc cho xe {}", carId);
        }
    }
}
