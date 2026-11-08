package com.example.ms_pedidos.model;

import jakarta.persistence.*;

@Entity
@Table(name = "CARRITO")
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carrito")
    private Integer idCarrito;

    @Column(name = "USUARIO_email", length = 100, nullable = false)
    private String usuarioEmail;

    public Carrito() {
    }

    // gett

    public Integer getIdCarrito() {
        return idCarrito;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    // sett

    public void setIdCarrito(Integer idCarrito) {
        this.idCarrito = idCarrito;
    }

    public void setUsuarioEmail(String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }
}
