package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.model.enums.Perfil;
import hackthon.grupo3.spring.service.TokenService;
import hackthon.grupo3.spring.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UsuarioService usuarioService;

    public AuthController(AuthenticationManager authenticationManager, TokenService tokenService, UsuarioService usuarioService ) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.usuarioService = usuarioService;
    }
    // receber o JSON do mobile
    public record LoginRequest(String email, String senha) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(request.email(), request.senha());

        Authentication authentication = authenticationManager.authenticate(authToken);

        String token = tokenService.gerarToken(authentication);

        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try{
            usuario.setPerfil(Perfil.USER);
            usuario.setCriadoEm(LocalDateTime.now());
            usuario.setBloqueado(false);

            Usuario novoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok(Map.of("mensagem", "Usuário cadastrado com sucesso", "id", novoUsuario.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}
