package hackthon.grupo3.spring.api;

import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioApi {

    private final UsuarioService service;

    public UsuarioApi(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/ranking")
    public ResponseEntity<?> ranking() {
        try {
            List<hackthon.grupo3.spring.dto.UsuarioRankingResponse> rankingList = service.obterRanking().stream()
                    .map(hackthon.grupo3.spring.dto.UsuarioRankingResponse::de)
                    .toList();
            return ResponseEntity.ok(rankingList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("ERRO: " + e.getMessage() + " | Causa: " + (e.getCause() != null ? e.getCause().getMessage() : ""));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Usuario> cadastrar(@Valid @RequestBody Usuario usuario) {
        return ResponseEntity.ok(service.salvar(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> alterar(@PathVariable Long id, @Valid @RequestBody Usuario usuario) {
        usuario.setId(id);
        return ResponseEntity.ok(service.salvar(usuario));
    }

    @PutMapping("/{id}/bloquear")
    public ResponseEntity<Usuario> bloquear(@PathVariable Long id) {
        return ResponseEntity.ok(service.bloquear(id));
    }

    @PutMapping("/{id}/desbloquear")
    public ResponseEntity<Usuario> desbloquear(@PathVariable Long id) {
        return ResponseEntity.ok(service.desbloquear(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}
