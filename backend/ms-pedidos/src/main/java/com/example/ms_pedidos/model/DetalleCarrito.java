package com.example.ms_pedidos.model;

import jakarta.persistence.*;

@Entity
@Table(name = "DETALLE_CARRITO")
@IdClass(DetalleCarritoId.class)
public class DetalleCarrito {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CARRITO_id_carrito", nullable = false)
    private Carrito carrito;

    @Id
    @Column(name = "PRODUCTO_id_producto", nullable = false)
    private Integer productoId;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    public DetalleCarrito() {
    }

    // gett

    public Carrito getCarrito() {
        return carrito;
    }

    public Integer getProductoId() {
        return productoId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    // sett

    public void setCarrito(Carrito carrito) {
        this.carrito = carrito;
    }

    public void setProductoId(Integer productoId) {
        this.productoId = productoId;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}
