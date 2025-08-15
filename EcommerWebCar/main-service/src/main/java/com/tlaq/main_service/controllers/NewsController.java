package com.tlaq.main_service.controllers;

import com.tlaq.main_service.dto.ApiResponse;
import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.newsRequest.NewsRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.dto.responses.newsResponse.NewsResponse;
import com.tlaq.main_service.dto.responses.voucherResponse.VoucherResponse;
import com.tlaq.main_service.entity.News;
import com.tlaq.main_service.services.NewsService;
import com.tlaq.main_service.validators.ImageConstraint;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/news")
public class NewsController {
    NewsService newsService;

    @GetMapping(value = "/get-news/{showroomId}")
    public ApiResponse<PageResponse<NewsResponse>> getNews(
                                @PathVariable(value = "showroomId") String showroomId,
                                @RequestParam(value ="page", required = false, defaultValue = "1") int page,
                                @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ){
        return ApiResponse.<PageResponse<NewsResponse>>builder()
                .result(newsService.getNews(showroomId, page, size))
                .build();
    }

    @PostMapping(value = "/create/{showroomId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<NewsResponse> createNews(@ModelAttribute NewsRequest request,
                                                @PathVariable(value = "showroomId")  String showroomId,
                                                @RequestParam("images") @Valid
                                                @ImageConstraint(min = 1, max = 5, message = "Chọn từ 1 tới 5 ảnh")
                                                List<MultipartFile> images) {
        return ApiResponse.<NewsResponse>builder()
                .result(newsService.createNews(request, showroomId, images))
                .build();
    }

    @PutMapping(value ="/update-news/{newsId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<NewsResponse> updateNews(@ModelAttribute NewsRequest request,
                                                @PathVariable(value = "newsId")  Long newsId,
                                                @RequestParam(value= "images", required = false)
                                                List<MultipartFile> images){
        return ApiResponse.<NewsResponse>builder()
                .result(newsService.updateNews(request, newsId, images))
                .build();
    }

    @DeleteMapping("/delete-news/{newsId}")
    public ApiResponse<Void> deleteNews(@PathVariable(value = "newsId")  Long newsId){
        newsService.deleteNews(newsId);
        return ApiResponse.<Void>builder()
                .message("Deleted successfully!")
                .build();
    }

}
