package com.tlaq.main_service.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.carRequest.CarBranchRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarBranchResponse;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.entity.CarBranch;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.CarBranchMapper;
import com.tlaq.main_service.repositories.CarBranchRepository;
import com.tlaq.main_service.services.CarBranchService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class CarBranchServiceImpl implements CarBranchService {
    CarBranchRepository carBranchRepository;
    CarBranchMapper carBranchMapper;
    Cloudinary cloudinary;

    @Override
    public PageResponse<CarBranchResponse> getAll(int page, int size) {
        Pageable pageable= PageRequest.of(page- 1, size);
        var pageData = carBranchRepository.findAll(pageable);

        return PageResponse.<CarBranchResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(carBranchMapper::toDto).toList())
                .build();
    }

    @Override
    public CarBranchResponse getById(Long id) {
        return carBranchMapper.toDto(carBranchRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.BRANCH_IS_EMPTY)));
    }

    @Override
    public CarBranchResponse create(CarBranchRequest request, MultipartFile imageBranch) {
        CarBranch carBranch = carBranchMapper.toEntity(request);

        if (!imageBranch.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(imageBranch.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                carBranch.setImageBranch(res.get("secure_url").toString());
            } catch (IOException ex) {
                throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
            }
        }
        carBranchRepository.save(carBranch);
        return carBranchMapper.toDto(carBranch);
    }


    @Override
    public void deleteById(Long id) {
        carBranchRepository.deleteById(id);
    }
}
