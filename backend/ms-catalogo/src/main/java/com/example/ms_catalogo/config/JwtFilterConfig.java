package com.example.ms_catalogo.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtFilterConfig {

    // evitar que el filtro jwt se registre fuera de spring security
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(
            JwtAuthenticationFilter jwtFilter) {

        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(jwtFilter);

        registration.setEnabled(false);

        return registration;
    }

    // evitar que el filtro de clave interna se registre fuera de spring security
    @Bean
    public FilterRegistrationBean<InternalApiKeyFilter> internalApiKeyFilterRegistration(
            InternalApiKeyFilter internalApiKeyFilter) {

        FilterRegistrationBean<InternalApiKeyFilter> registration =
                new FilterRegistrationBean<>(internalApiKeyFilter);

        registration.setEnabled(false);

        return registration;
    }
}
