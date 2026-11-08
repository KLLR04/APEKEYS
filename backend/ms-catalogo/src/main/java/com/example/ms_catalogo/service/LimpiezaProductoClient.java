package com.example.ms_catalogo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LimpiezaProductoClient {

    private final RestClient restClient;
    private final String internalApiKey;
    private final String favoritosUrl;
    private final String pedidosUrl;

    public LimpiezaProductoClient(
            RestClient.Builder loadBalancedRestClientBuilder,
            @Value("${app.internal.api-key:}") String internalApiKey,
            @Value("${app.favoritos.url}") String favoritosUrl,
            @Value("${app.pedidos.url}") String pedidosUrl) {

        this.restClient = loadBalancedRestClientBuilder.build();
        this.internalApiKey = internalApiKey;
        this.favoritosUrl = favoritosUrl;
        this.pedidosUrl = pedidosUrl;
    }

    // pedir a ms favoritos y ms pedidos que quiten el producto que se va a eliminar
    public void quitarDeFavoritosYCarritos(Integer productoId) {

        quitar(favoritosUrl + "/api/favoritos/interno/producto/{id}", productoId, "MS_FAVORITOS");
        quitar(pedidosUrl + "/api/carritos/interno/producto/{id}", productoId, "MS_PEDIDOS");
    }

    private void quitar(String url, Integer productoId, String servicio) {

        try {
            restClient.delete()
                    .uri(url, productoId)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException | IllegalStateException e) {

            // si el otro servicio no responde no se borra el producto para no dejar datos huerfanos
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo eliminar el producto porque " + servicio
                            + " no respondio. Intente nuevamente",
                    e
            );
        }
    }
}
