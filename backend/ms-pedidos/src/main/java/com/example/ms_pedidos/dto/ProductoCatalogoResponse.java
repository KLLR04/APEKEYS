package com.example.ms_pedidos.dto;

import java.math.BigDecimal;

public record ProductoCatalogoResponse(
        Integer idProducto,
        String nombre,
        String descripcion,
        BigDecimal precio,
        BigDecimal precioOferta,
        Integer stock,
        String disponibilidad
) {

    // precio que se cobra: el de oferta si existe y es menor que el normal
    public BigDecimal precioFinal() {
        if (precioOferta != null
                && precioOferta.signum() > 0
                && precio != null
                && precioOferta.compareTo(precio) < 0) {
            return precioOferta;
        }
        return precio;
    }
}
