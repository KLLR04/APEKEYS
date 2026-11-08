package com.example.ms_pedidos.model;

import java.io.Serializable;
import java.util.Objects;

public class DetalleCarritoId implements Serializable {

    private Integer carrito;
    private Integer productoId;

    public DetalleCarritoId() {
    }

    public DetalleCarritoId(Integer carrito, Integer productoId) {
        this.carrito = carrito;
        this.productoId = productoId;
    }

    // gett

    public Integer getCarrito() {
        return carrito;
    }

    public Integer getProductoId() {
        return productoId;
    }

    // sett

    public void setCarrito(Integer carrito) {
        this.carrito = carrito;
    }

    public void setProductoId(Integer productoId) {
        this.productoId = productoId;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }

        if (!(obj instanceof DetalleCarritoId otro)) {
            return false;
        }

        return Objects.equals(carrito, otro.carrito)
                && Objects.equals(productoId, otro.productoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(carrito, productoId);
    }
}
