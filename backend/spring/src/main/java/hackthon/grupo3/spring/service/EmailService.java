package hackthon.grupo3.spring.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String remetente;
    private final String urlRecuperacao;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String remetente,
            @Value("${app.recuperacao-senha.url}") String urlRecuperacao
    ) {
        this.mailSender = mailSender;
        this.remetente = remetente;
        this.urlRecuperacao = urlRecuperacao;
    }

    public void enviarRecuperacaoSenha(
            String destinatario,
            String token,
            long expiracaoMinutos
    ) {
        String link = UriComponentsBuilder
                .fromUriString(urlRecuperacao)
                .queryParam("token", token)
                .build()
                .encode()
                .toUriString();

        SimpleMailMessage mensagem = new SimpleMailMessage();

        mensagem.setFrom(remetente);
        mensagem.setTo(destinatario);
        mensagem.setSubject("Recuperação de senha - Bolão da Copa 2026");

        mensagem.setText("""
                Recebemos uma solicitação para redefinir sua senha.

                Abra o link abaixo no dispositivo com o aplicativo instalado:

                %s

                Token de recuperação:

                %s

                Esse token expira em %d minutos e pode ser usado apenas uma vez.

                Se você não solicitou a recuperação, ignore este e-mail.
                """.formatted(link, token, expiracaoMinutos));

        mailSender.send(mensagem);
    }
}