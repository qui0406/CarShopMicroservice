package com.tlaq.main_service.controllers.admin;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.client.RestTemplate;

import java.util.List;


@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/login")
    public String login(Model model) {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        return "dashboard";
    }
}
