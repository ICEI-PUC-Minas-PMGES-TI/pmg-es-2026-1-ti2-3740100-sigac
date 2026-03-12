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
        boolean isEmergencial = manutencao.getTipo() == TipoManutencao.EMERGENCIAL;
        String tipo = isEmergencial ? "Emergencial" : "Prevista";
        String assunto = "SIGAC - Manutenção " + tipo + " no condomínio " + nomeCondominio;
        String dataFormatada = manutencao.getData().format(DATA_BR);
        String prestadorLinha = manutencao.getPrestador() != null && !manutencao.getPrestador().isBlank()
                ? "<tr><td style=\"padding:10px 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;\">Prestador</td></tr><tr><td style=\"padding:0 0 16px;color:#0f172a;font-size:15px;font-weight:500;\">" + escapeHtml(manutencao.getPrestador()) + "</td></tr>"
                : "";
        String instrucoes = manutencao.getInstrucoesEmail() != null && !manutencao.getInstrucoesEmail().isBlank()
                ? "<div style=\"margin-top:24px;padding:20px;background:#fffbeb;border-radius:12px;border:1px solid #fde68a;\"><p style=\"margin:0 0 8px;color:#92400e;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;\">Instruções e orientações</p><p style=\"margin:0;color:#78350f;font-size:14px;line-height:1.6;\">" + escapeHtml(manutencao.getInstrucoesEmail()) + "</p></div>"
                : "";

        String badgeTipoCores = isEmergencial
                ? "background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;"
                : "background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;";

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <title>Manutenção programada</title>
            </head>
            <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f1f5f9;">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
              <tr><td align="center">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(15,23,42,0.15),0 0 0 1px rgba(15,23,42,0.04);">
              <tr>
                <td style="background:linear-gradient(145deg,#0f172a 0%%,#1e293b 50%%,#334155 100%%);padding:32px 28px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Sistema de Gestão</p>
                  <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.03em;color:#ffffff;">SIGAC</p>
                  <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Administração Condominial</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 28px 24px;">
                  <p style="margin:0 0 6px;color:#64748b;font-size:13px;">Prezado(a) morador(a),</p>
                  <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.55;">Informamos que está programada a seguinte manutenção em seu condomínio.</p>
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:linear-gradient(135deg,#eff6ff 0%%,#dbeafe 100%%);border-radius:14px;border:2px solid #3b82f6;border-left-width:6px;">
                    <tr><td style="padding:18px 22px;">
                      <p style="margin:0 0 8px;color:#1d4ed8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">O que será realizado</p>
                      <p style="margin:0;color:#0f172a;font-size:17px;font-weight:600;line-height:1.5;">%s</p>
                    </td></tr>
                  </table>
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#f8fafc 0%%,#f1f5f9 100%%);border-radius:14px;border:1px solid #e2e8f0;">
                    <tr><td style="padding:20px 22px;">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                        <tr>
                          <td style="padding:0 0 4px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Condomínio</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 18px;color:#0f172a;font-size:16px;font-weight:600;">%s</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 4px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Data</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 18px;"><span style="display:inline-block;background:#0f172a;color:#fff;padding:8px 14px;border-radius:10px;font-size:14px;font-weight:600;">%s</span></td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 4px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Tipo</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 4px;"><span style="display:inline-block;%s padding:6px 12px;border-radius:8px;font-size:13px;font-weight:600;">%s</span></td>
                        </tr>
                        %s
                      </table>
                    </td></tr>
                  </table>
                  %s
                  <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">E-mail automático | SIGAC • Não responda a esta mensagem</p>
                </td>
              </tr>
            </table>
              </td></tr>
            </table>
            </body>
            </html>
            """
                .formatted(
                        escapeHtml(manutencao.getDescricao()),
                        escapeHtml(nomeCondominio),
                        dataFormatada,
                        badgeTipoCores,
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
