package com.tlaq.cms_service.mapper;


import com.tlaq.cms_service.dto.request.NewsRequest;
import com.tlaq.cms_service.dto.response.NewsResponse;
import com.tlaq.cms_service.entity.News;
import com.tlaq.cms_service.entity.NewsImage;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
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
