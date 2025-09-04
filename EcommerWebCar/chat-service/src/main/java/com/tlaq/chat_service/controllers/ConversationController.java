package com.tlaq.chat_service.controllers;

import com.tlaq.chat_service.dto.ApiResponse;
import com.tlaq.chat_service.dto.PageResponse;
import com.tlaq.chat_service.dto.request.ConversationRequest;
import com.tlaq.chat_service.dto.response.ConversationResponse;
import com.tlaq.chat_service.service.ConversationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("conversations")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    ConversationService conversationService;

    @PostMapping("/create-or-get")
    ApiResponse<ConversationResponse> createConversation() {
        return ApiResponse.<ConversationResponse>builder()
            .result(conversationService.createOrGetConversation())
            .build();
    }


    @GetMapping("/get-all-conversation")
    public ApiResponse<PageResponse<ConversationResponse>> getAllConversation(
            @RequestParam(value ="page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "12") int size){
        return ApiResponse.<PageResponse<ConversationResponse>>builder()
                .result(conversationService.getAllConversations(page, size))
                .build();
    }

    @GetMapping("/customer-get-conversation")
    public ApiResponse<ConversationResponse> getCustomerConversation(){
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.getCustomerConversation())
                .build();
    }
}
