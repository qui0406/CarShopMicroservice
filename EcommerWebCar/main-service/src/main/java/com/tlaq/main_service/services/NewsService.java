package com.tlaq.main_service.services;

import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.newsRequest.NewsRequest;
import com.tlaq.main_service.dto.responses.newsResponse.NewsResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface NewsService {
    PageResponse<NewsResponse> getNews(String showroomId, int page, int size);
    NewsResponse createNews(NewsRequest newsRequest, String showroomId, List<MultipartFile> images);
    NewsResponse updateNews(NewsRequest newsRequest, Long newsId, List<MultipartFile> images);
    void deleteNews(Long newsId);

}
