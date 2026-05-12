package com.tlaq.cms_service.service.impl;

import com.tlaq.cms_service.dto.PageResponse;
import com.tlaq.cms_service.dto.request.RatingRequest;
import com.tlaq.cms_service.dto.request.UpdateRatingRequest;
import com.tlaq.cms_service.dto.response.RatingResponse;
import com.tlaq.cms_service.entity.Rating;
import com.tlaq.cms_service.exceptions.AppException;
import com.tlaq.cms_service.exceptions.ErrorCode;
import com.tlaq.cms_service.mapper.RatingMapper;
import com.tlaq.cms_service.repo.RatingRepository;
import com.tlaq.cms_service.repo.httpClient.IdentityClient;
import com.tlaq.cms_service.service.RatingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RatingServiceImpl implements RatingService {
    RatingRepository ratingRepository;
    IdentityClient identityClient;
    RatingMapper ratingMapper;

    @Override
    public RatingResponse createRating(RatingRequest request, String carId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeycloakId = authentication.getName();

        request.setCarId(carId);
        String profileId = identityClient.getProfile(userKeycloakId).getResult().getId();
        request.setProfileId(profileId);

//        Rating rating = ratingMapper.toRating(request);
//        ratingRepository.save(rating);
//        return ratingMapper.toRatingResponse(rating);
        return null;
    }

    @Override
    public RatingResponse updateRating(UpdateRatingRequest request, Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeycloakId = authentication.getName();

        String profileId = identityClient.getProfile(userKeycloakId).getResult().getId();

        Rating rating = ratingRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.RATING_NOT_EXIST));

        if(!rating.getProfile().getId().equals(profileId)){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        rating.setRating(request.getRating());
        rating.setContent(request.getContent());
        ratingRepository.save(rating);
//        return ratingMapper.toRatingResponse(rating);
        return null;
    }

    @Override
    public PageResponse<RatingResponse> getRatings(int page, int size, String carId) {
        Sort sort= Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable= PageRequest.of(page- 1, size, sort);

        Page<Rating> pageData = ratingRepository.findByCarId(carId, pageable);

        return PageResponse.<RatingResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
//                .data(pageData.getContent().stream().map(ratingMapper::toRatingResponse).toList())
            .build();
    }

    @Override
    public void deleteRating(Long id) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.RATING_NOT_EXIST));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeycloakId = authentication.getName();
        String profileId = identityClient.getProfile(userKeycloakId).getResult().getId();
        if(!rating.getProfile().getId().equals(profileId)){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        this.ratingRepository.delete(rating);
    }
}
