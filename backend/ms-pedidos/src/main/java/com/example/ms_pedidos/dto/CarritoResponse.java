package com.example.ms_pedidos.dto;

import java.util.List;

public record CarritoResponse(
        Integer idCarrito,
        String usuarioEmail,
        List<DetalleCarritoResponse> productos
) {
}
