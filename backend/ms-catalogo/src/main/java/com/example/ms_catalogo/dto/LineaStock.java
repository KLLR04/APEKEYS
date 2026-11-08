package com.example.ms_catalogo.dto;

// una linea de un movimiento de stock: que producto y cuantas unidades
public record LineaStock(
        Integer productoId,
        Integer cantidad
) {
}
