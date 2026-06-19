package hackthon.grupo3.spring.api;

import hackthon.grupo3.spring.model.Palpite;
import hackthon.grupo3.spring.service.PalpiteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/palpites")
public class PalpiteApi {

    private final PalpiteService service;

    public PalpiteApi(PalpiteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Palpite>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Palpite> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Palpite>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.listarPorUsuario(usuarioId));
    }

    @PostMapping
    public ResponseEntity<Palpite> cadastrar(@RequestBody Palpite palpite) {
        return ResponseEntity.ok(service.salvar(palpite));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Palpite> alterar(@PathVariable Long id, @RequestBody Palpite palpite) {
        return ResponseEntity.ok(service.alterar(id, palpite));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}
