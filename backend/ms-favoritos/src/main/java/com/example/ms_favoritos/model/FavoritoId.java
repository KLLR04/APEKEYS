package com.example.ms_favoritos.model;

import java.io.Serializable;
import java.util.Objects;

public class FavoritoId implements Serializable {

    private Integer productoId;
    private String usuarioEmail;

    public FavoritoId() {
    }

    public FavoritoId(Integer productoId, String usuarioEmail) {
        this.productoId = productoId;
        this.usuarioEmail = usuarioEmail;
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

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }

        if (!(obj instanceof FavoritoId otro)) {
            return false;
        }

        return Objects.equals(productoId, otro.productoId)
                && Objects.equals(usuarioEmail, otro.usuarioEmail);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productoId, usuarioEmail);
    }
}
