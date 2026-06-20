package hackthon.grupo3.spring.api;

import hackthon.grupo3.spring.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ranking")
public class RankingApi {

    private final UsuarioService service;

    public RankingApi(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
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
}
