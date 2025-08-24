package com.tlaq.main_service.services.impl;

import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.ratingRequest.RatingRequest;
import com.tlaq.main_service.dto.requests.ratingRequest.UpdateRatingRequest;
import com.tlaq.main_service.dto.responses.ratingResponse.RatingResponse;
import com.tlaq.main_service.entity.Rating;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.RatingMapper;
import com.tlaq.main_service.repositories.ProfileRepository;
import com.tlaq.main_service.repositories.RatingRepository;
import com.tlaq.main_service.services.RatingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
public class RatingServiceImpl implements RatingService {
    RatingRepository ratingRepository;
    ProfileRepository profileRepository;
    RatingMapper ratingMapper;

    @Override
    public RatingResponse createRating(RatingRequest request, String carId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeycloakId = authentication.getName();

        request.setCarId(carId);
        String profileId = profileRepository.findByUserKeyCloakId(userKeycloakId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED)).getId();
        request.setProfileId(profileId);

        Rating rating = ratingMapper.toRating(request);
        ratingRepository.save(rating);
        return ratingMapper.toRatingResponse(rating);
    }

    @Override
    public RatingResponse updateRating(UpdateRatingRequest request, Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeycloakId = authentication.getName();

        String profileId = profileRepository.findByUserKeyCloakId(userKeycloakId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED)).getId();

        Rating rating = ratingRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.RATING_NOT_EXIST));

        if(!rating.getProfile().getId().equals(profileId)){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        rating.setRating(request.getRating());
        rating.setContent(request.getContent());
        ratingRepository.save(rating);
        return ratingMapper.toRatingResponse(rating);
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
                .data(pageData.getContent().stream().map(ratingMapper::toRatingResponse).toList())
            .build();
    }

    @Override
    public void deleteRating(Long id) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.RATING_NOT_EXIST));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userKeycloakId = authentication.getName();
        String profileId = profileRepository.findByUserKeyCloakId(userKeycloakId)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED)).getId();
        if(!rating.getProfile().getId().equals(profileId)){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        this.ratingRepository.delete(rating);
    }
}
