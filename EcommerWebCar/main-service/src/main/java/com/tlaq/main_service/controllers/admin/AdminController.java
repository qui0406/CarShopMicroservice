package com.tlaq.main_service.controllers.admin;

import com.tlaq.main_service.dto.responses.MonthlyRevenueProjection;
import com.tlaq.main_service.services.StatsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;

import java.security.Principal;
import java.util.List;


@Controller
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminController {
    StatsService statsService;

    @GetMapping("/login")
    public String login(@RequestParam(value = "error", required = false) String error,
                        @RequestParam(value = "logout", required = false) String logout,
                        Model model) {

        log.info("Accessing login page");

        if (error != null) {
            model.addAttribute("error", "Invalid username or password");
        }

        if (logout != null) {
            model.addAttribute("logout", "You have been logged out successfully");
        }

        return "login"; // returns src/main/resources/templates/login.html
    }

    @GetMapping("/admin/dashboard")
    public String dashboard(Model model, @RequestParam(value = "year", required = false, defaultValue = "2025") int year,
                            @RequestParam(value = "month", required = false, defaultValue = "1") int month,
                            Principal principal) {
        log.info("Accessing dashboard for user: {}", principal.getName());

        List<MonthlyRevenueProjection> getAllRevenue = statsService.getMonthlyRevenue();
        MonthlyRevenueProjection monthlyRevenueProjection = statsService.getMonthlyRevenue(year, month);

        model.addAttribute("username", principal.getName());
        model.addAttribute("allRevenue", getAllRevenue);
        model.addAttribute("monthlyRevenueProjection", monthlyRevenueProjection);
        return "dashboard";
    }

    @GetMapping("/admin")
    public String adminRedirect() {
        return "redirect:/dashboard";
    }

    @GetMapping("/admin/cars")
    public String carsManagement(Model model) {
        log.info("Accessing cars management page");
        // Add cars data to model
        return "admin/cars"; // You'll need to create this template
    }

    @GetMapping("/admin/orders")
    public String ordersManagement(Model model) {
        log.info("Accessing orders management page");
        return "admin/orders";
    }

    @GetMapping("/admin/stats")
    public String statsManagement(Model model) {


        return "stats";
    }

}
