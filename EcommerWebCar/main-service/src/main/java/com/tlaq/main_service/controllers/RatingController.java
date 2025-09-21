package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.ratingRequest.RatingRequest;
import com.tlaq.main_service.dto.requests.ratingRequest.UpdateRatingRequest;
import com.tlaq.main_service.dto.responses.ratingResponse.RatingResponse;
import com.tlaq.main_service.entity.Rating;
import com.tlaq.main_service.services.RatingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/rating")
public class RatingController {
    RatingService ratingService;

    @GetMapping("/get-ratings/{carId}")
    public ApiResponse<PageResponse<RatingResponse>> getRatings(@PathVariable("carId") String carId,
                        @RequestParam(value ="page", required = false, defaultValue = "1") int page,
                        @RequestParam(value = "size", required = false, defaultValue = "12") int size){
        return ApiResponse.<PageResponse<RatingResponse>>builder()
                .result(ratingService.getRatings(page, size, carId))
                .build();
    }

    @PostMapping("/create-rating/{carId}")
    public ApiResponse<RatingResponse> createRating(@PathVariable("carId") String carId,
                                                    @RequestBody RatingRequest request)
    {
        return ApiResponse.<RatingResponse>builder()
                .result(ratingService.createRating(request, carId))
                .build();
    }

    @PatchMapping("/update-rating/{ratingId}")
    public ApiResponse<RatingResponse> updateRating(@PathVariable Long ratingId,
                                                    @RequestBody UpdateRatingRequest request){
        return ApiResponse.<RatingResponse>builder()
                .result(ratingService.updateRating(request, ratingId))
                .build();
    }

    @DeleteMapping("/delete-rating/{ratingId}")
    public ApiResponse<RatingResponse> deleteRating(@PathVariable Long ratingId){
        ratingService.deleteRating(ratingId);
        return ApiResponse.<RatingResponse>builder()
                .message("Rating deleted successfully")
                .build();
    }
}
