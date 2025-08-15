package com.tlaq.main_service.mapper.decorator;

import com.tlaq.main_service.dto.requests.newsRequest.NewsRequest;
import com.tlaq.main_service.dto.responses.newsResponse.NewsResponse;
import com.tlaq.main_service.entity.News;
import com.tlaq.main_service.entity.NewsImage;
import com.tlaq.main_service.entity.ShowRoom;
import com.tlaq.main_service.entity.ShowRoomImage;
import com.tlaq.main_service.mapper.NewsMapper;
import com.tlaq.main_service.mapper.ShowRoomMapper;
import com.tlaq.main_service.repositories.ShowRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class NewsMapperDecorator implements NewsMapper {
    @Autowired
    @Qualifier("delegate")
    private NewsMapper delegate;

    @Autowired
    private ShowRoomRepository showRoomRepository;

    @Override
    public NewsResponse toNewsResponse(News news) {
        NewsResponse newsResponse = delegate.toNewsResponse(news);

        if(news.getNewImages()!=null){
            List<String> images = news.getNewImages().stream()
                    .map(NewsImage::getImage)
                    .collect(Collectors.toList());
            newsResponse.setNewImages(images);
        }else {
            newsResponse.setNewImages(new ArrayList<>());
        }

        newsResponse.setCreatedAt(news.getCreatedAt());

        return  newsResponse;
    }

    @Override
    public News toNews(NewsRequest newsRequest) {
        News news = delegate.toNews(newsRequest);
        return  news;
    }
}
