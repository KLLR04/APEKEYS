package com.example.ms_favoritos.service;

import com.example.ms_favoritos.dto.ProductoCatalogoResponse;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CatalogoClient {

    private final RestClient catalogoRestClient;

    public CatalogoClient(RestClient catalogoRestClient) {
        this.catalogoRestClient = catalogoRestClient;
    }

    // consultar un producto en ms catalogo para validar que exista
    public ProductoCatalogoResponse obtenerProducto(Integer productoId) {

        try {
            ProductoCatalogoResponse producto =
                    catalogoRestClient.get()
                            .uri("/api/productos/{id}", productoId)
                            .retrieve()
                            .onStatus(
                                    status -> status.value() == 404,
                                    (request, response) -> {
                                        throw new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Producto no encontrado"
                                        );
                                    }
                            )
                            .body(ProductoCatalogoResponse.class);

            if (producto == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "El catalogo devolvio una respuesta vacia"
                );
            }

            return producto;

        } catch (ResponseStatusException e) {
            throw e;

        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No fue posible consultar MS_CATALOGO",
                    e
            );
        }
    }
}
