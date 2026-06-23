package hackthon.grupo3.spring.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Value;
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
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(remetente);
            helper.setTo(destinatario);
            helper.setSubject("Recuperação de senha - Bolão da Copa 2026");

            String htmlMsg = """
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #E4E4E7; border-radius: 12px; text-align: center;">
                    <h2 style="color: #09090B; margin-bottom: 8px;">Recuperação de Senha</h2>
                    <p style="font-size: 16px; color: #52525B; line-height: 1.5;">Recebemos uma solicitação para redefinir sua senha do <b>Bolão da Copa</b>.</p>
                    <p style="font-size: 16px; color: #52525B; line-height: 1.5;">Copie o código abaixo e cole no aplicativo para continuar:</p>
                    
                    <div style="margin: 32px 0;">
                        <span style="background-color: #F4F4F5; color: #09090B; padding: 16px 32px; border-radius: 12px; font-weight: 800; font-size: 32px; letter-spacing: 8px; border: 2px dashed #D4D4D8;">%s</span>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #E4E4E7; margin: 24px 0;" />
                    
                    <p style="color: #71717A; font-size: 12px; margin-top: 20px;">
                        Este código expira em %d minutos e pode ser usado apenas uma vez.<br>
                        Se você não solicitou a recuperação, pode ignorar e excluir este e-mail com segurança.
                    </p>
                </div>
                """.formatted(token, expiracaoMinutos);

            helper.setText(htmlMsg, true);
            mailSender.send(mimeMessage);

        } catch (Exception e) {
            System.err.println("Erro ao enviar email HTML: " + e.getMessage());
            throw new RuntimeException("Erro ao enviar e-mail de recuperação.");
        }
    }
}