package com.tlaq.notification_service.helper;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class TemplateEngine {
    public String render(String template, Map<String, Object> params) {
        if (params == null) return template;
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            template = template.replace("{{" + entry.getKey() + "}}", entry.getValue().toString());
        }
        return template;
    }
}