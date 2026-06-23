package hackthon.grupo3.spring.controller;

import hackthon.grupo3.spring.dto.RedefinirSenhaRequest;
import hackthon.grupo3.spring.dto.SolicitarRecuperacaoSenhaRequest;
import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.model.enums.Perfil;
import hackthon.grupo3.spring.service.RecuperacaoSenhaService;
import hackthon.grupo3.spring.service.TokenService;
import hackthon.grupo3.spring.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UsuarioService usuarioService;
    private final RecuperacaoSenhaService recuperacaoSenhaService;

    public AuthController(
            AuthenticationManager authenticationManager,
            TokenService tokenService,
            UsuarioService usuarioService,
            RecuperacaoSenhaService recuperacaoSenhaService
    ) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.usuarioService = usuarioService;
        this.recuperacaoSenhaService = recuperacaoSenhaService;
    }

    public record LoginRequest(String email, String senha) {
    }

    public record VerificarCodigoRequest(String token) {
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.senha()
                );

        Authentication authentication =
                authenticationManager.authenticate(authToken);

        String token = tokenService.gerarToken(authentication);

        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            usuario.setPerfil(Perfil.USER);
            usuario.setCriadoEm(LocalDateTime.now());
            usuario.setBloqueado(false);

            Usuario novoUsuario =
                    usuarioService.registrarUsuario(usuario);

            return ResponseEntity.ok(Map.of(
                    "mensagem", "Usuário cadastrado com sucesso",
                    "id", novoUsuario.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> solicitarRecuperacao(
            @Valid @RequestBody SolicitarRecuperacaoSenhaRequest request
    ) {
        recuperacaoSenhaService.solicitar(request.email());

        return ResponseEntity.ok(Map.of(
                "mensagem",
                "Se o e-mail estiver cadastrado, enviaremos as instruções"
        ));
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<?> verificarCodigo(
            @Valid @RequestBody VerificarCodigoRequest request
    ) {
        recuperacaoSenhaService.validarCodigo(request.token());
        return ResponseEntity.ok(Map.of(
                "mensagem",
                "Código válido"
        ));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(
            @Valid @RequestBody RedefinirSenhaRequest request
    ) {
        recuperacaoSenhaService.redefinir(
                request.token(),
                request.novaSenha()
        );

        return ResponseEntity.ok(Map.of(
                "mensagem",
                "Senha redefinida com sucesso"
        ));
    }
}