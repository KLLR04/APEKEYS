package com.example.ms_pedidos.dto;

public record AgregarProductoCarritoRequest(
        Integer productoId,
        Integer cantidad
) {
}
