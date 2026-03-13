package sigac.controller;

import sigac.dto.CondominioDTO;
import sigac.dto.CreateUserRequest;
import sigac.dto.UpdateUserRequest;
import sigac.dto.UserDTO;
import sigac.service.CondominioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/condominios")
public class CondominioController {

    private final CondominioService condominioService;

    public CondominioController(CondominioService condominioService) {
        this.condominioService = condominioService;
    }

    @GetMapping
    public List<CondominioDTO> listar() {
        return condominioService.listarCondominios();
    }

    @GetMapping("/{id}")
    public CondominioDTO buscar(@PathVariable Long id) {
        return condominioService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<CondominioDTO> criar(@Valid @RequestBody CondominioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(condominioService.criarCondominio(dto));
    }

    @PutMapping("/{id}")
    public CondominioDTO atualizar(@PathVariable Long id, @Valid @RequestBody CondominioDTO dto) {
        return condominioService.atualizar(id, dto);
    }

    @PostMapping("/{id}/gestores")
    public ResponseEntity<UserDTO> criarGestor(@PathVariable Long id, @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(condominioService.criarGestor(id, request));
    }

    @GetMapping("/{id}/gestores")
    public List<UserDTO> listarGestores(@PathVariable Long id) {
        return condominioService.listarGestores(id);
    }

    @PutMapping("/{id}/gestores/{userId}")
    public UserDTO atualizarGestor(@PathVariable Long id, @PathVariable Long userId, @Valid @RequestBody UpdateUserRequest request) {
        return condominioService.atualizarGestor(id, userId, request);
    }

    @DeleteMapping("/{id}/gestores/{userId}")
    public ResponseEntity<Void> removerGestor(@PathVariable Long id, @PathVariable Long userId) {
        condominioService.removerGestor(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/sindicos")
    public ResponseEntity<UserDTO> criarSindico(@PathVariable Long id, @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(condominioService.criarSindico(id, request));
    }

    @GetMapping("/{id}/sindicos")
    public List<UserDTO> listarSindicos(@PathVariable Long id) {
        return condominioService.listarSindicos(id);
    }

    @PutMapping("/{id}/sindicos/{userId}")
    public UserDTO atualizarSindico(@PathVariable Long id, @PathVariable Long userId, @Valid @RequestBody UpdateUserRequest request) {
        return condominioService.atualizarSindico(id, userId, request);
    }

    @DeleteMapping("/{id}/sindicos/{userId}")
    public ResponseEntity<Void> removerSindico(@PathVariable Long id, @PathVariable Long userId) {
        condominioService.removerSindico(id, userId);
        return ResponseEntity.noContent().build();
    }
}
