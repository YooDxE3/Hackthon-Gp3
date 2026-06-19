package hackthon.grupo3.spring.api;

import hackthon.grupo3.spring.model.Selecao;
import hackthon.grupo3.spring.service.SelecaoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/selecoes")
public class SelecaoApi {

    private final SelecaoService service;

    public SelecaoApi(SelecaoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Selecao>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Selecao> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Selecao> cadastrar(@Valid @RequestBody Selecao selecao) {
        return ResponseEntity.ok(service.salvar(selecao));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Selecao> alterar(@PathVariable Long id, @Valid @RequestBody Selecao selecao) {
        selecao.setId(id);
        return ResponseEntity.ok(service.salvar(selecao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}
