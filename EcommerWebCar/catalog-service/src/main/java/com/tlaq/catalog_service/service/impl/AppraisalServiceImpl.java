package com.tlaq.catalog_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.catalog_service.dto.ApiResponse;
import com.tlaq.catalog_service.dto.PageResponse;
import com.tlaq.catalog_service.dto.request.AppraisalRequestDto;
import com.tlaq.catalog_service.dto.response.AppraisalResponse;
import com.tlaq.catalog_service.dto.response.UserProfileResponse;
import com.tlaq.catalog_service.entity.AppraisalImage;
import com.tlaq.catalog_service.entity.AppraisalRequest;
import com.tlaq.catalog_service.entity.Car;
import com.tlaq.catalog_service.entity.enums.AppraisalStatus;
import com.tlaq.catalog_service.exceptions.AppException;
import com.tlaq.catalog_service.exceptions.ErrorCode;
import com.tlaq.catalog_service.mapper.AppraisalMapper;
import com.tlaq.catalog_service.repo.AppraisalImageRepository;
import com.tlaq.catalog_service.repo.AppraisalRequestRepository;
import com.tlaq.catalog_service.repo.CarRepository;
import com.tlaq.catalog_service.repo.httpClient.IdentityClient;
import com.tlaq.catalog_service.service.AppraisalService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppraisalServiceImpl implements AppraisalService {
    AppraisalRequestRepository appraisalRepository;
    AppraisalImageRepository imageRepository;
    CarRepository carRepository;
    AppraisalMapper appraisalMapper;
    Cloudinary cloudinary;
    IdentityClient identityClient;

    @Override
    public List<AppraisalResponse> getMyAppraisals() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId= authentication.getName();
        ApiResponse<UserProfileResponse> profileRes = identityClient.getProfileByUserKeycloakId(userKeyCloakId);

        if (profileRes.getResult() == null) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        String profileId = profileRes.getResult().getId();

        // 2. Tìm tất cả yêu cầu định giá của User này, sắp xếp mới nhất lên đầu
        List<AppraisalRequest> requests = appraisalRepository.findByUserIdOrderByCreatedAtDesc(profileId);

        // 3. Map sang DTO Response để trả về Frontend
        return requests.stream()
                .map(appraisalMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AppraisalResponse updateStatus(String id, AppraisalStatus status) {
        AppraisalRequest request = appraisalRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPRAISAL_NOT_FOUND));

        request.setStatus(status);

        if (status == AppraisalStatus.BOUGHT) {
            request.setConditionNote(request.getConditionNote() + "\n[Hệ thống]: Showroom đã hoàn tất thu mua chiếc xe này.");
        }

        AppraisalRequest updatedRequest = appraisalRepository.save(request);
        return appraisalMapper.toResponse(updatedRequest);
    }

    @Override
    public AppraisalResponse createAppraisal(AppraisalRequestDto dto, List<MultipartFile> images) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeyCloakId= authentication.getName();

        var profileRes = identityClient.getProfileByUserKeycloakId(userKeyCloakId);
        if (profileRes.getResult() == null) throw new AppException(ErrorCode.USER_NOT_EXISTED);
        String profileId = profileRes.getResult().getId();

        AppraisalRequest request = appraisalMapper.toEntity(dto);
        request.setUserId(profileId);
        request.setStatus(AppraisalStatus.PENDING);

        uploadAppraisalImages(images, request);

        AppraisalRequest savedRequest = appraisalRepository.save(request);
        return appraisalMapper.toResponse(savedRequest);
    }

    @Override
    public AppraisalResponse updateOfferedPrice(String id, BigDecimal price, String note) {
        AppraisalRequest request = appraisalRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPRAISAL_NOT_FOUND));

        request.setOfferedPrice(price);
        request.setConditionNote(request.getConditionNote() + "\n[Phản hồi Showroom]: " + note);
        request.setStatus(AppraisalStatus.INSPECTING);

        return appraisalMapper.toResponse(appraisalRepository.save(request));
    }

    @Override
    public PageResponse<AppraisalResponse> getAllAppraisals(int page, int size, String status) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        var pageData = (status != null)
                ? appraisalRepository.findByStatus(AppraisalStatus.valueOf(status), pageable)
                : appraisalRepository.findAll(pageable);

        return PageResponse.<AppraisalResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(appraisalMapper::toResponse).toList())
                .build();
    }

    @Override
    @Transactional
    public Boolean convertToInventory(String appraisalId) {
        AppraisalRequest request = appraisalRepository.findById(appraisalId)
                .orElseThrow(() -> new AppException(ErrorCode.APPRAISAL_NOT_FOUND));

        if (request.getStatus() != AppraisalStatus.BOUGHT) {
            throw new AppException(ErrorCode.INVALID_STATUS_FOR_INVENTORY);
        }

        Car car = Car.builder()
                .carModel(request.getModel())
                .isUsed(true)
                .isReady(false)
                .manufacturingYear(request.getManufacturingYear())
                .build();

        carRepository.save(car);

        request.setStatus(AppraisalStatus.INVENTORIED);
        appraisalRepository.save(request);
        return true;
    }

    private void uploadAppraisalImages(List<MultipartFile> images, AppraisalRequest appraisalRequest) {
        if (images == null || images.isEmpty()) return;

        List<AppraisalImage> appraisalImages = new ArrayList<>();
        for (MultipartFile img : images) {
            try {
                Map res = cloudinary.uploader().upload(img.getBytes(),
                        ObjectUtils.asMap(
                                "resource_type", "auto",
                                "folder", "appraisals"
                        ));

                String imageUrl = res.get("secure_url").toString();

                appraisalImages.add(AppraisalImage.builder()
                        .imageUrl(imageUrl)
                        .imageType("EXTERIOR")
                        .appraisalRequest(appraisalRequest)
                        .build());

            } catch (IOException ex) {
                log.error("Lỗi upload ảnh xe cũ: {}", ex.getMessage());
                throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
            }
        }

        appraisalRequest.setImages(appraisalImages);
    }
}