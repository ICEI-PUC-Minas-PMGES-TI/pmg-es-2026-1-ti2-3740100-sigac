package sigac.service;

import sigac.domain.Manutencao;
import sigac.domain.TipoManutencao;
import sigac.repository.InquilinoRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final JavaMailSender mailSender;
    private final InquilinoRepository inquilinoRepository;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, InquilinoRepository inquilinoRepository,
                        @Value("${sigac.mail.from:sigacalertas@gmail.com}") String fromAddress) {
        this.mailSender = mailSender;
        this.inquilinoRepository = inquilinoRepository;
        this.fromAddress = fromAddress;
    }

    /**
     * Envia e-mail em HTML para todos os inquilinos do condomínio informando a manutenção programada.
     * Data em formato dd/MM/yyyy. Instruções/dicas aparecem no corpo quando preenchidas.
     */
    @Async
    public void enviarNotificacaoManutencao(Manutencao manutencao, String nomeCondominio) {
        List<String> emails = inquilinoRepository.findByCondominioId(manutencao.getCondominio().getId()).stream()
                .map(i -> i.getEmail())
                .collect(Collectors.toList());
        if (emails.isEmpty()) {
            log.info("Nenhum inquilino cadastrado para notificar sobre manutenção {}", manutencao.getId());
            return;
        }
        String tipo = manutencao.getTipo() == TipoManutencao.EMERGENCIAL ? "Emergencial" : "Prevista";
        String assunto = "SIGAC - Manutenção " + tipo + " no condomínio " + nomeCondominio;
        String dataFormatada = manutencao.getData().format(DATA_BR);
        String prestadorLinha = manutencao.getPrestador() != null && !manutencao.getPrestador().isBlank()
                ? "<tr><td style=\"padding:6px 0;color:#475569;\">Prestador:</td><td style=\"padding:6px 0;\">" + escapeHtml(manutencao.getPrestador()) + "</td></tr>"
                : "";
        String instrucoes = manutencao.getInstrucoesEmail() != null && !manutencao.getInstrucoesEmail().isBlank()
                ? "<p style=\"margin-top:20px;color:#1b3266;font-size:14px;\">" + escapeHtml(manutencao.getInstrucoesEmail()) + "</p>"
                : "";

        String html = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Manutenção programada</title></head>
            <body style="margin:0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:linear-gradient(160deg,#f8fafc 0%%,#e0e7ff 50%%,#f1f5f9 100%%);padding:28px;">
            <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(27,50,102,0.12),0 1px 3px rgba(0,0,0,0.06);">
              <div style="background:linear-gradient(135deg,#1b3266 0%%,#2f6ce6 100%%);color:#fff;padding:24px 28px;">
                <strong style="font-size:20px;letter-spacing:-0.02em;">SIGAC</strong>
                <span style="font-size:13px;opacity:0.95;"> — Sistema de Gestão Administrativa Condominial</span>
              </div>
              <div style="padding:28px;">
                <p style="margin:0 0 8px;color:#334155;font-size:15px;">Prezado(a) morador(a),</p>
                <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.5;">Informamos que está programada a seguinte manutenção:</p>
                <div style="background:linear-gradient(135deg,#f0f9ff 0%%,#e0f2fe 100%%);border-radius:12px;padding:16px 20px;margin-bottom:20px;border-left:4px solid #2f6ce6;">
                  <table style="width:100%%;border-collapse:collapse;font-size:14px;">
                    <tr><td style="padding:6px 0;color:#64748b;width:110px;">Condomínio</td><td style="padding:6px 0;color:#1e293b;font-weight:500;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#64748b;">Data</td><td style="padding:6px 0;"><span style="background:#1b3266;color:#fff;padding:4px 10px;border-radius:8px;font-size:13px;">%s</span></td></tr>
                    <tr><td style="padding:6px 0;color:#64748b;">Descrição</td><td style="padding:6px 0;color:#1e293b;">%s</td></tr>
                    <tr><td style="padding:6px 0;color:#64748b;">Tipo</td><td style="padding:6px 0;color:#1e293b;">%s</td></tr>
                    %s
                  </table>
                </div>
                %s
                <p style="margin-top:24px;font-size:12px;color:#94a3b8;">Este é um e-mail automático do sistema SIGAC.</p>
              </div>
            </div>
            </body>
            </html>
            """
                .formatted(
                        escapeHtml(nomeCondominio),
                        dataFormatada,
                        escapeHtml(manutencao.getDescricao()),
                        tipo,
                        prestadorLinha,
                        instrucoes
                );

        try {
            for (String to : emails) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromAddress);
                helper.setTo(to);
                helper.setSubject(assunto);
                helper.setText(html, true);
                mailSender.send(message);
            }
            log.info("Notificação de manutenção {} enviada para {} inquilino(s)", manutencao.getId(), emails.size());
        } catch (MessagingException e) {
            log.error("Erro ao enviar e-mail de manutenção: {}", e.getMessage());
        }
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
