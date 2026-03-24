package com.tlaq.cms_service.service;

import com.tlaq.cms_service.dto.PageResponse;
import com.tlaq.cms_service.dto.request.RatingRequest;
import com.tlaq.cms_service.dto.request.UpdateRatingRequest;
import com.tlaq.cms_service.dto.response.RatingResponse;

public interface RatingService {
    RatingResponse createRating(RatingRequest request, String carId);
    RatingResponse updateRating(UpdateRatingRequest request, Long id);
    PageResponse<RatingResponse> getRatings(int page, int size, String carId);
    void deleteRating(Long id);
}
