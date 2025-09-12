package com.tlaq.chat_service.service;

import com.sun.tools.javac.Main;
import com.tlaq.chat_service.dto.PageResponse;
import com.tlaq.chat_service.dto.request.ConversationRequest;
import com.tlaq.chat_service.dto.response.ConversationResponse;
import com.tlaq.chat_service.entity.Conversation;
import com.tlaq.chat_service.entity.ParticipantInfo;
import com.tlaq.chat_service.entity.enums.ConversationStatus;
import com.tlaq.chat_service.exceptions.AppException;
import com.tlaq.chat_service.exceptions.ErrorCode;
import com.tlaq.chat_service.mapper.ConversationMapper;
import com.tlaq.chat_service.repository.ConversationRepository;
import com.tlaq.chat_service.repository.httpClient.MainClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationService {
    ConversationRepository conversationRepository;
    MainClient mainClient;
    ConversationMapper conversationMapper;


    public PageResponse<ConversationResponse> getAllConversations(int page, int size){
        Sort sort= Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable= PageRequest.of(page- 1, size, sort);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        checkValidStaff(authentication);

        var pageData = conversationRepository.findAll(pageable);
        return PageResponse.<ConversationResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(pageData.getContent().stream()
                        .map(conversationMapper::toConversationResponse).toList())
                .build();
    }


    public ConversationResponse getCustomerConversation() {
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfoResponse = mainClient.getProfile(userKeyCloakId);

        if (Objects.isNull(userInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();
        var conversation = conversationRepository.findByCustomerId(userInfo.getId())
                .orElseThrow(()-> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        return toCustomerConversationResponse(conversation);
    }

    private ConversationResponse toCustomerConversationResponse(Conversation conversation) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String userKeyCloakId = authentication.getName();

        var userInfoResponse = mainClient.getProfile(userKeyCloakId);

        if (Objects.isNull(userInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();
        return ConversationResponse.builder()
            .id(conversation.getId())
            .customerId(conversation.getCustomerId())
            .customerInfo(ParticipantInfo.builder()
                .id(userInfo.getId())
                .userKeycloakId(userInfo.getUserKeyCloakId())
                .avatar(userInfo.getAvatar())
                .firstName(userInfo.getFirstName())
                .lastName(userInfo.getLastName())
                .username(userInfo.getUsername())
                .build())
            .status(conversation.getStatus())
            .createdAt(conversation.getCreatedAt())
            .build();
    }

    public ConversationResponse createOrGetConversation() {
        String userKeyCloakId = SecurityContextHolder.getContext().getAuthentication().getName();

        var userInfoResponse = mainClient.getProfile(userKeyCloakId);

        if (Objects.isNull(userInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();

        var existingConversation = conversationRepository.findByCustomerId(userInfo.getId());
        if (existingConversation.isPresent()) {
            var conversation = existingConversation.get();
            return toCustomerConversationResponse(conversation);
        }

        ParticipantInfo customerInfo = ParticipantInfo.builder()
            .id(userInfo.getId())
            .userKeycloakId(userInfo.getUserKeyCloakId())
            .username(userInfo.getUsername())
            .firstName(userInfo.getFirstName())
            .lastName(userInfo.getLastName())
            .avatar(userInfo.getAvatar())
        .build();

        Conversation newConversation = Conversation.builder()
            .customerId(userInfo.getId())
            .customerInfo(customerInfo)
            .staffIds(new ArrayList<>())
            .status(ConversationStatus.WAITING)
            .createdAt(Instant.now())
        .build();

        var savedConversation = conversationRepository.save(newConversation);

        notifyAvailableStaff(savedConversation);

        return toCustomerConversationResponse(savedConversation);
    }

    private void notifyAvailableStaff(Conversation conversation) {
        log.info("New conversation created: {} for customer: {}",
                conversation.getId(), conversation.getCustomerInfo().getUsername());
    }

    private void checkValidStaff(Authentication authentication){
        authentication = SecurityContextHolder.getContext().getAuthentication();
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        boolean hasStaffRole = false;
        for (GrantedAuthority authority : authorities) {
            if (authority.getAuthority().equals("ROLE_STAFF")) {
                hasStaffRole = true;
                break;
            }
        }

        if (!hasStaffRole) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}
