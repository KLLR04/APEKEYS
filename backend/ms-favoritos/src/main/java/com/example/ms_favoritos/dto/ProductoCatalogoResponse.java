package com.example.ms_favoritos.dto;

import java.math.BigDecimal;

public record ProductoCatalogoResponse(
        Integer idProducto,
        String nombre,
        String descripcion,
        BigDecimal precio,
        Integer stock,
        String disponibilidad
) {
}
