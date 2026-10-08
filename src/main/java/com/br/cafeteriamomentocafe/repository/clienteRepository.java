package com.br.cafeteriamomentocafe.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface clienteRepository<Cliente> extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByEmail(String email);
}