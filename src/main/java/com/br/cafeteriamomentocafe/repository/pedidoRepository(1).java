package com.br.cafeteriamomentocafe.repository;

import com.br.cafeteriamomentocafe.model.pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface pedidoRepository extends JpaRepository<pedido, Long> {

    List<pedido> findByClienteId(Long clienteId);

    List<pedido> findByStatus(String status);
}