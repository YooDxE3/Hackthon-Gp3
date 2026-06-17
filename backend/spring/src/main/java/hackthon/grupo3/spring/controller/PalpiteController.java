package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.dto.PalpiteRequest;
import hackthon.grupo3.spring.dto.PalpiteResponse;
import hackthon.grupo3.spring.exception.RecursoNaoEncontradoException;
import hackthon.grupo3.spring.model.Palpite;
import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import hackthon.grupo3.spring.service.PalpiteService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/palpites")
public class PalpiteController {

    private final PalpiteService service;
    private final UsuarioRepository usuarioRepository;

    public PalpiteController(PalpiteService service, UsuarioRepository usuarioRepository) {
        this.service = service;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public PalpiteResponse salvar(@RequestBody PalpiteRequest req, Authentication authentication) {
        Usuario usuario = usuarioLogado(authentication);
        Palpite palpite = service.registrarOuEditar(usuario, req);
        return PalpiteResponse.de(palpite);
    }

    @GetMapping("/meus")
    public List<PalpiteResponse> meus(Authentication authentication) {
        Usuario usuario = usuarioLogado(authentication);
        return service.listarDoUsuario(usuario.getId()).stream()
                .map(PalpiteResponse::de)
                .toList();
    }

    private Usuario usuarioLogado(Authentication authentication) {
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario logado nao encontrado"));
    }
}
