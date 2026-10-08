package com.br.cafeteriamomentocafe.controller;

import com.br.cafeteriamomentocafe.model.cliente;
import com.br.cafeteriamomentocafe.service.clienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class clienteController {

    private final clienteService service;

    public clienteController(clienteService service) {
        this.service = service;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody cliente cliente) {

        try {
            return ResponseEntity.ok(service.cadastrar(cliente));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody cliente cliente) {

        try {
            return ResponseEntity.ok(
                    service.login(
                            cliente.getEmail(),
                            cliente.getSenha()
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public List<cliente> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable Long id) {

        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}