package com.br.cafeteriamomentocafe.service;

import com.br.cafeteriamomentocafe.model.cliente;
import com.br.cafeteriamomentocafe.repository.clienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class clienteService {

    private final clienteRepository repository;

    public clienteService(clienteRepository repository) {
        this.repository = repository;
    }

    public cliente cadastrar(cliente cliente) {

        if (repository.findByEmail(cliente.getEmail()).isPresent()) {
            throw new RuntimeException("Este e-mail já está cadastrado.");
        }

        return (cliente) repository.save(cliente);
    }

    public List<cliente> listar() {
        return repository.findAll();
    }

    public Optional<cliente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public cliente login(String email, String senha) {

        Optional<cliente> cliente = repository.findByEmail(email);

        if (cliente.isEmpty()) {
            throw new RuntimeException("E-mail não encontrado.");
        }

        if (!cliente.get().getSenha().equals(senha)) {
            throw new RuntimeException("Senha incorreta.");
        }

        return cliente.get();
    }
}