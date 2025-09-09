package com.tlaq.main_service.configs;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomCatConfig implements WebServerFactoryCustomizer<TomcatServletWebServerFactory>{
    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addConnectorCustomizers(connector -> {
//            connector.setMaxPartCount(1000);

            connector.setProperty("maxPostSize", String.valueOf(2L * 1024 * 1024 * 1024)); // 2GB
            connector.setProperty("maxSwallowSize", String.valueOf(2L * 1024 * 1024 * 1024)); // 2GB
        });
    }
}
