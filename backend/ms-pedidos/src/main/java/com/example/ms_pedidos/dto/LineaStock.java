package com.example.ms_pedidos.dto;

// una linea del movimiento de stock que se envia a ms catalogo
public record LineaStock(
        Integer productoId,
        Integer cantidad
) {
}
