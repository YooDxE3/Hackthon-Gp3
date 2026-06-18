package hackthon.grupo3.spring.api;



import hackthon.grupo3.spring.model.Partida;
import hackthon.grupo3.spring.service.PartidaService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/partidas")
@Service
public class PartidaApi {

    private final PartidaService service;

    public PartidaApi(PartidaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Partida>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partida> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Partida> cadastrar(@Valid @RequestBody Partida partida) {
        return ResponseEntity.ok(service.salvar(partida));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partida> alterar(@PathVariable Long id, @Valid @RequestBody Partida partida) {
        partida.setId(id);
        return ResponseEntity.ok(service.salvar(partida));
    }

    @PutMapping("/{id}/resultado")
    public ResponseEntity<Partida> lancarResultado(
            @PathVariable Long id,
            @RequestParam Integer golsA,
            @RequestParam Integer golsB
    ) {
        return ResponseEntity.ok(service.lancarResultado(id, golsA, golsB));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}
