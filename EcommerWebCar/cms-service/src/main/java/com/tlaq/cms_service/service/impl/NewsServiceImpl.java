package com.tlaq.cms_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.cms_service.dto.PageResponse;
import com.tlaq.cms_service.dto.request.NewsRequest;
import com.tlaq.cms_service.dto.response.NewsResponse;
import com.tlaq.cms_service.entity.News;
import com.tlaq.cms_service.entity.NewsImage;
import com.tlaq.cms_service.exceptions.AppException;
import com.tlaq.cms_service.exceptions.ErrorCode;
import com.tlaq.cms_service.mapper.NewsMapper;
import com.tlaq.cms_service.repo.NewsRepository;
import com.tlaq.cms_service.repo.httpClient.CatalogClient;
import com.tlaq.cms_service.service.NewsService;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
public class NewsServiceImpl implements NewsService {
    NewsRepository newsRepository;
    CatalogClient catalogClient;
    Cloudinary cloudinary;
    NewsMapper newsMapper;

    @Override
    public PageResponse<NewsResponse> getNews(String showroomId, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        // SỬA: Nên dùng findByShowroomId nếu NewsRepository đã có trường này
        var pageData = newsRepository.findAll(pageable);

        return PageResponse.<NewsResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream().map(newsMapper::toNewsResponse).toList())
                .build();
    }

    @Override
    public NewsResponse createNews(NewsRequest newsRequest, String showroomId, List<MultipartFile> images) {
        // 1. Kiểm tra showroom tồn tại bên Catalog Service
        var showRoomRes = catalogClient.getShowRoomById(showroomId);
        if (showRoomRes.getResult() == null) {
            throw new AppException(ErrorCode.SHOW_ROOM_NOT_FOUND);
        }

        News news = newsMapper.toNews(newsRequest);
        news.setShowroomId(showroomId);

        // 2. Upload ảnh
        if (images == null || images.isEmpty()) {
            throw new AppException(ErrorCode.IMAGE_IS_EMPTY);
        }
        news.setNewImages(uploadNewsImages(images, news));

        return newsMapper.toNewsResponse(newsRepository.save(news));
    }

    @Override
    public NewsResponse updateNews(NewsRequest request, Long newsId, List<MultipartFile> images) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_IS_EMPTY));

        // Cập nhật thông tin text
        if(request.getContent() != null) news.setContent(request.getContent());
        if(request.getTitle() != null) news.setTitle(request.getTitle());
        if(request.getDescription() != null) news.setDescription(request.getDescription());

        // Cập nhật ảnh nếu có gửi ảnh mới kèm theo
        if (images != null && !images.isEmpty()) {
            // Lưu ý: Nếu muốn xóa ảnh cũ trên Cloudinary, bạn cần thêm logic xóa tại đây
            news.setNewImages(uploadNewsImages(images, news));
        }

        return newsMapper.toNewsResponse(newsRepository.save(news));
    }

    private List<NewsImage> uploadNewsImages(List<MultipartFile> images, News news) {
        List<NewsImage> newsImageList = new ArrayList<>();
        for (MultipartFile img : images) {
            try {
                Map res = cloudinary.uploader().upload(img.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto", "folder", "news_images"));

                String imageUrl = res.get("secure_url").toString();
                newsImageList.add(NewsImage.builder()
                        .image(imageUrl)
                        .news(news) // Thiết lập quan hệ để Cascade lưu xuống DB
                        .build());
            } catch (IOException ex) {
                throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
            }
        }
        return newsImageList;
    }

    @Override
    public void deleteNews(Long newsId) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_IS_EMPTY));
        newsRepository.delete(news);
    }
}
