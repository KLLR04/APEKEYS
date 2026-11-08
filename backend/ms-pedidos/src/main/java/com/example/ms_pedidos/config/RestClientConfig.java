package com.example.ms_pedidos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.web.client.RestClientBuilderConfigurer;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    // crear un builder balanceado para resolver microservicios por nombre en eureka
    @Bean
    @LoadBalanced
    public RestClient.Builder loadBalancedRestClientBuilder(
            RestClientBuilderConfigurer configurer) {

        return configurer.configure(RestClient.builder());
    }

    // crear el cliente que apunta a ms catalogo
    @Bean
    public RestClient catalogoRestClient(
            RestClient.Builder loadBalancedRestClientBuilder,
            @Value("${app.catalogo.url}") String catalogoUrl) {

        return loadBalancedRestClientBuilder
                .baseUrl(catalogoUrl)
                .build();
    }
}
