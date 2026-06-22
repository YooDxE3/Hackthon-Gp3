package hackthon.grupo3.spring.service;

import hackthon.grupo3.spring.exception.TokenRecuperacaoInvalidoException;
import hackthon.grupo3.spring.model.TokenResetSenha;
import hackthon.grupo3.spring.model.Usuario;
import hackthon.grupo3.spring.repository.TokenResetSenhaRepository;
import hackthon.grupo3.spring.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RecuperacaoSenhaService {

    private final UsuarioRepository usuarioRepository;
    private final TokenResetSenhaRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final long expiracaoMinutos;

    public RecuperacaoSenhaService(
            UsuarioRepository usuarioRepository,
            TokenResetSenhaRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.recuperacao-senha.expiracao-minutos:30}")
            long expiracaoMinutos
    ) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.expiracaoMinutos = expiracaoMinutos;
    }

    @Transactional
    public void solicitar(String email) {
        usuarioRepository.findByEmailIgnoreCase(email.trim())
                .ifPresent(this::criarEEnviarToken);
    }

    private void criarEEnviarToken(Usuario usuario) {
        var tokensAntigos =
                tokenRepository.findAllByUsuarioAndUsadoFalse(usuario);

        tokensAntigos.forEach(token -> token.setUsado(true));
        tokenRepository.saveAll(tokensAntigos);

        TokenResetSenha tokenReset = new TokenResetSenha();
        tokenReset.setUsuario(usuario);
        tokenReset.setToken(UUID.randomUUID().toString());
        tokenReset.setExpiraEm(
                LocalDateTime.now().plusMinutes(expiracaoMinutos)
        );
        tokenReset.setUsado(false);

        tokenRepository.save(tokenReset);

        emailService.enviarRecuperacaoSenha(
                usuario.getEmail(),
                tokenReset.getToken(),
                expiracaoMinutos
        );
    }

    @Transactional
    public void redefinir(String token, String novaSenha) {
        TokenResetSenha tokenReset =
                tokenRepository.findByTokenAndUsadoFalse(token)
                        .orElseThrow(() ->
                                new TokenRecuperacaoInvalidoException(
                                        "Token inválido ou já utilizado"
                                )
                        );

        if (tokenReset.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new TokenRecuperacaoInvalidoException(
                    "Token de recuperação expirado"
            );
        }

        Usuario usuario = tokenReset.getUsuario();

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        tokenReset.setUsado(true);

        usuarioRepository.save(usuario);
        tokenRepository.save(tokenReset);
    }
}