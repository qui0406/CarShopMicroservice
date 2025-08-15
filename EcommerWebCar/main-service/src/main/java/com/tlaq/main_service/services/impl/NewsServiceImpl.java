package com.tlaq.main_service.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tlaq.main_service.dto.PageResponse;
import com.tlaq.main_service.dto.requests.newsRequest.NewsRequest;
import com.tlaq.main_service.dto.responses.carResponse.CarResponse;
import com.tlaq.main_service.dto.responses.newsResponse.NewsResponse;
import com.tlaq.main_service.entity.CarImage;
import com.tlaq.main_service.entity.News;
import com.tlaq.main_service.entity.NewsImage;
import com.tlaq.main_service.entity.ShowRoom;
import com.tlaq.main_service.exceptions.AppException;
import com.tlaq.main_service.exceptions.ErrorCode;
import com.tlaq.main_service.mapper.NewsMapper;
import com.tlaq.main_service.repositories.NewsRepository;
import com.tlaq.main_service.repositories.ShowRoomRepository;
import com.tlaq.main_service.services.NewsService;
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
    ShowRoomRepository showRoomRepository;
    Cloudinary cloudinary;
    NewsMapper newsMapper;

    @Override
    public PageResponse<NewsResponse> getNews(String showroomId, int page, int size) {
        Sort sort= Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable= PageRequest.of(page- 1, size, sort);
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
        News news = newsMapper.toNews(newsRequest);
        ShowRoom showRoom = showRoomRepository.findById(showroomId)
                .orElseThrow(()->new AppException(ErrorCode.SHOW_ROOM_IS_EMPTY));
        news.setShowRoom(showRoom);

        List<NewsImage> newsImageList = new ArrayList<>();

        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                try {
                    Map res = cloudinary.uploader().upload(img.getBytes(),
                            ObjectUtils.asMap("resource_type", "auto"));
                    String imageUrl = res.get("secure_url").toString();
                    NewsImage newsImage = NewsImage.builder()
                            .image(imageUrl)
                            .build();
                    newsImageList.add(newsImage);
                } catch (IOException ex) {
                    throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
                }
            }
        }else{
            throw new AppException(ErrorCode.IMAGE_IS_EMPTY);
        }
        news.setNewImages(newsImageList);
        newsRepository.save(news);
        return newsMapper.toNewsResponse(news);
    }

    @Override
    public NewsResponse updateNews(NewsRequest request, Long newsId, List<MultipartFile> images) {
        News news= newsRepository.findById(newsId).orElseThrow(()-> new AppException(ErrorCode.NEWS_IS_EMPTY));
        List<NewsImage> newsImageList = new ArrayList<>();

        if (images != null && !images.isEmpty()) {
            for (MultipartFile img : images) {
                try {
                    Map res = cloudinary.uploader().upload(img.getBytes(),
                            ObjectUtils.asMap("resource_type", "auto"));
                    String imageUrl = res.get("secure_url").toString();
                    NewsImage newsImage = NewsImage.builder()
                            .image(imageUrl)
                            .build();
                    newsImageList.add(newsImage);
                } catch (IOException ex) {
                    throw new AppException(ErrorCode.UPLOAD_IMAGE_ERROR);
                }
            }
        }

        if(request.getContent()!=null) news.setContent(request.getContent());
        if(request.getTitle()!=null) news.setTitle(request.getTitle());
        if(request.getDescription()!=null) news.setDescription(request.getDescription());
        if(images != null && !images.isEmpty()) news.setNewImages(newsImageList);

        newsRepository.save(news);
        return newsMapper.toNewsResponse(news);
    }

    @Override
    public void deleteNews(Long newsId) {
        News news= newsRepository.findById(newsId).orElseThrow(()-> new AppException(ErrorCode.NEWS_IS_EMPTY));
        newsRepository.delete(news);
    }
}
