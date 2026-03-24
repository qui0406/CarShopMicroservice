package com.tlaq.cms_service.service;

import com.tlaq.cms_service.dto.PageResponse;
import com.tlaq.cms_service.dto.request.NewsRequest;
import com.tlaq.cms_service.dto.response.NewsResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface NewsService {
    PageResponse<NewsResponse> getNews(String showroomId, int page, int size);
    NewsResponse createNews(NewsRequest newsRequest, String showroomId, List<MultipartFile> images);
    NewsResponse updateNews(NewsRequest newsRequest, Long newsId, List<MultipartFile> images);
    void deleteNews(Long newsId);

}
