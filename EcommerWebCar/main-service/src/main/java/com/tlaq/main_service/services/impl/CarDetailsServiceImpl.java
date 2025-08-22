package com.tlaq.main_service.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarDetailsResponse;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.entity.Car;
import com.tlaq.main_service.entity.CarImage;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.CarMapper;
import com.tlaq.main_service.repositories.CarRepository;
import com.tlaq.main_service.services.CarDetailsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class CarDetailsServiceImpl implements CarDetailsService {
    CarMapper carMapper;
    CarRepository carRepository;
    Cloudinary cloudinary;

    @Override
    public PageResponse<CarResponse> getCar(int page, int size) {
        Sort sort= Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable= PageRequest.of(page- 1, size, sort);
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
    public CarDetailsResponse getCarDetails(String carId) {
        Car car = carRepository.findById(carId).orElseThrow(()-> new AppException(ErrorCode.CAR_NOT_FOUND));
        return carMapper.toCarDetailsResponse(car);
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
    public void deleteCarDetail(String carId) {
        Car car=  carRepository.findById(carId).orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));
        carRepository.delete(car);
    }

    private String uploadImage(MultipartFile img) {
        try {
            Map res = cloudinary.uploader().upload(
                    img.getBytes(),
                    ObjectUtils.asMap("resource_type", "auto")
            );
            return res.get("secure_url").toString();
        } catch (IOException ex) {
            throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
        }
    }
}
