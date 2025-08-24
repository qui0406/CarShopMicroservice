package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.ratingRequest.RatingRequest;
import com.tlaq.main_service.dto.requests.ratingRequest.UpdateRatingRequest;
import com.tlaq.main_service.dto.responses.ratingResponse.RatingResponse;
import com.tlaq.main_service.entity.Rating;

public interface RatingService {
    RatingResponse createRating(RatingRequest request, String carId);
    RatingResponse updateRating(UpdateRatingRequest request, Long id);
    PageResponse<RatingResponse> getRatings(int page, int size, String carId);
    void deleteRating(Long id);
}
