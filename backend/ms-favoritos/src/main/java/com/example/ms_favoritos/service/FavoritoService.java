package com.example.ms_favoritos.service;

import com.example.ms_favoritos.dto.FavoritoEstadoResponse;
import com.example.ms_favoritos.dto.FavoritoResponse;
import com.example.ms_favoritos.model.Favorito;
import com.example.ms_favoritos.model.FavoritoId;
import com.example.ms_favoritos.repository.FavoritoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final CatalogoClient catalogoClient;

    public FavoritoService(
            FavoritoRepository favoritoRepository,
            CatalogoClient catalogoClient) {

        this.favoritoRepository = favoritoRepository;
        this.catalogoClient = catalogoClient;
    }

    // listar los favoritos del usuario autenticado
    @Transactional(readOnly = true)
    public List<FavoritoResponse> listarMisFavoritos(String email) {

        validarEmail(email);

        return favoritoRepository.findByUsuarioEmail(email)
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // consultar si un producto esta en mis favoritos
    @Transactional(readOnly = true)
    public FavoritoEstadoResponse consultarFavorito(String email, Integer productoId) {

        validarEmail(email);
        validarProductoId(productoId);

        boolean existe = favoritoRepository.existsById(new FavoritoId(productoId, email));

        return new FavoritoEstadoResponse(productoId, existe);
    }

    // agregar un producto a mis favoritos
    @Transactional
    public FavoritoResponse agregarFavorito(String email, Integer productoId) {

        validarEmail(email);
        validarProductoId(productoId);

        if (favoritoRepository.existsById(new FavoritoId(productoId, email))) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El producto ya está en favoritos"
            );
        }

        // validar que el producto exista en el catalogo
        catalogoClient.obtenerProducto(productoId);

        Favorito favorito = new Favorito();
        favorito.setProductoId(productoId);
        favorito.setUsuarioEmail(email);

        return convertirRespuesta(favoritoRepository.save(favorito));
    }

    // quitar un producto de mis favoritos
    @Transactional
    public void eliminarFavorito(String email, Integer productoId) {

        validarEmail(email);
        validarProductoId(productoId);

        FavoritoId id = new FavoritoId(productoId, email);

        Favorito favorito = favoritoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El producto no está en favoritos"
                ));

        favoritoRepository.delete(favorito);
    }

    // borrar los favoritos de todos los usuarios para un producto eliminado del catalogo
    @Transactional
    public int eliminarFavoritosDeProducto(Integer productoId) {

        validarProductoId(productoId);

        return favoritoRepository.eliminarPorProducto(productoId);
    }

    private void validarEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuario no identificado"
            );
        }
    }

    private void validarProductoId(Integer productoId) {
        if (productoId == null || productoId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID del producto no es valido"
            );
        }
    }

    private FavoritoResponse convertirRespuesta(Favorito favorito) {
        return new FavoritoResponse(
                favorito.getProductoId(),
                favorito.getUsuarioEmail()
        );
    }
}
