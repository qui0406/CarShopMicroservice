package com.tlaq.main_service.mapper;

import com.tlaq.main_service.dto.requests.newsRequest.NewsRequest;
import com.tlaq.main_service.dto.responses.newsResponse.NewsResponse;
import com.tlaq.main_service.entity.News;
import com.tlaq.main_service.entity.NewsImage;
import com.tlaq.main_service.mapper.decorator.NewsMapperDecorator;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
@DecoratedWith(NewsMapperDecorator.class)
public interface NewsMapper {
    NewsResponse toNewsResponse(News news);

    News toNews(NewsRequest newsRequest);

    default List<String> mapNewsImages(List<NewsImage> images) {
        if (images == null) return new ArrayList<>();
        return images.stream()
                .map(NewsImage::getImage)
                .collect(Collectors.toList());
    }

}
