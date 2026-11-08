package com.example.ms_pedidos.service;

import com.example.ms_pedidos.dto.LineaStock;
import com.example.ms_pedidos.dto.ProductoCatalogoResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CatalogoClient {

    private final RestClient catalogoRestClient;
    private final String internalApiKey;

    public CatalogoClient(
            RestClient catalogoRestClient,
            @Value("${app.internal.api-key:}") String internalApiKey) {

        this.catalogoRestClient = catalogoRestClient;
        this.internalApiKey = internalApiKey;
    }

    // consultar un producto en ms catalogo
    public ProductoCatalogoResponse obtenerProducto(Integer productoId) {

        if (productoId == null || productoId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID del producto no es valido"
            );
        }

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
        } catch (RestClientException | IllegalStateException e) {
            throw catalogoNoDisponible("No fue posible consultar MS_CATALOGO", e);
        }
    }

    // descontar el stock de todo el pedido en una sola llamada: ms catalogo descuenta todo o nada
    public void descontarStock(List<LineaStock> lineas) {

        try {
            catalogoRestClient.post()
                    .uri("/api/productos/descontar-stock")
                    .header("X-Internal-Api-Key", internalApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(lineas)
                    .retrieve()
                    .onStatus(
                            status -> status.value() == 409,
                            (request, response) -> {
                                throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Uno de los productos se quedo sin stock. Revisa tu carrito"
                                );
                            }
                    )
                    .onStatus(
                            status -> status.value() == 401,
                            (request, response) -> {
                                throw new ResponseStatusException(
                                        HttpStatus.BAD_GATEWAY,
                                        "MS_CATALOGO rechazo la clave interna"
                                );
                            }
                    )
                    .toBodilessEntity();

        } catch (ResponseStatusException e) {
            throw e;
        } catch (RestClientException | IllegalStateException e) {
            throw catalogoNoDisponible("No fue posible descontar stock en MS_CATALOGO", e);
        }
    }

    // devolver el stock descontado si el pedido no se pudo guardar
    public void reponerStock(List<LineaStock> lineas) {

        catalogoRestClient.post()
                .uri("/api/productos/reponer-stock")
                .header("X-Internal-Api-Key", internalApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(lineas)
                .retrieve()
                .toBodilessEntity();
    }

    // ms catalogo apagado o todavia no registrado en eureka
    private ResponseStatusException catalogoNoDisponible(String mensaje, Exception causa) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, mensaje, causa);
    }
}
