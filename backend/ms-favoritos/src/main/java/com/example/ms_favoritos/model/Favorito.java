package com.example.ms_favoritos.model;

import jakarta.persistence.*;

@Entity
@Table(name = "FAVORITO")
@IdClass(FavoritoId.class)
public class Favorito {

    @Id
    @Column(name = "PRODUCTO_id_producto", nullable = false)
    private Integer productoId;

    @Id
    @Column(name = "USUARIO_email", length = 100, nullable = false)
    private String usuarioEmail;

    public Favorito() {
    }

    // gett

    public Integer getProductoId() {
        return productoId;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    // sett

    public void setProductoId(Integer productoId) {
        this.productoId = productoId;
    }

    public void setUsuarioEmail(String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }
}
