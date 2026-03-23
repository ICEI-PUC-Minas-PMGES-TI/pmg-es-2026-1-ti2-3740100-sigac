package sigac.service;

import sigac.domain.Manutencao;
import sigac.domain.TipoManutencao;
import sigac.repository.InquilinoRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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

    /**
     * Envia e-mail em HTML para todos os inquilinos informando que uma manutenção foi alterada.
     */
    @Async
    public void enviarNotificacaoAlteracaoManutencao(Manutencao manutencao, String nomeCondominio) {
        List<String> emails = inquilinoRepository.findByCondominioId(manutencao.getCondominio().getId()).stream()
                .map(i -> i.getEmail())
                .collect(Collectors.toList());
        if (emails.isEmpty()) {
            log.info("Nenhum inquilino cadastrado para notificar sobre alteração da manutenção {}", manutencao.getId());
            return;
        }
        boolean isEmergencial = manutencao.getTipo() == TipoManutencao.EMERGENCIAL;
        String tipo = isEmergencial ? "Emergencial" : "Prevista";
        String assunto = "SIGAC - Alteração em manutenção - " + nomeCondominio;
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
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alteração em manutenção</title></head>
            <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f1f5f9;">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
              <tr><td align="center">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(15,23,42,0.15),0 0 0 1px rgba(15,23,42,0.04);">
              <tr>
                <td style="background:linear-gradient(145deg,#0f172a 0%%,#1e293b 50%%);padding:32px 28px;text-align:center;">
                  <p style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">SIGAC</p>
                  <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">Alteração em manutenção</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 28px 24px;">
                  <p style="margin:0 0 6px;color:#64748b;font-size:13px;">Prezado(a) morador(a),</p>
                  <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.55;">Informamos que a seguinte manutenção foi <strong>alterada</strong>. Confira os dados atualizados abaixo.</p>
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:linear-gradient(135deg,#fef3c7 0%%,#fde68a 100%%);border-radius:14px;border:2px solid #f59e0b;">
                    <tr><td style="padding:18px 22px;">
                      <p style="margin:0 0 8px;color:#b45309;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">O que será realizado</p>
                      <p style="margin:0;color:#0f172a;font-size:17px;font-weight:600;">%s</p>
                    </td></tr>
                  </table>
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;">
                    <tr><td style="padding:20px 22px;">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                        <tr><td style="padding:0 0 4px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;">Condomínio</td></tr>
                        <tr><td style="padding:0 0 18px;color:#0f172a;font-size:16px;font-weight:600;">%s</td></tr>
                        <tr><td style="padding:0 0 4px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;">Data</td></tr>
                        <tr><td style="padding:0 0 18px;"><span style="display:inline-block;background:#0f172a;color:#fff;padding:8px 14px;border-radius:10px;font-size:14px;font-weight:600;">%s</span></td></tr>
                        <tr><td style="padding:0 0 4px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;">Tipo</td></tr>
                        <tr><td style="padding:0 0 4px;"><span style="display:inline-block;%s padding:6px 12px;border-radius:8px;font-size:13px;font-weight:600;">%s</span></td></tr>
                        %s
                      </table>
                    </td></tr>
                  </table>
                  %s
                  <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">E-mail automático | SIGAC</p>
                </td>
              </tr>
            </table>
              </td></tr>
            </table>
            </body>
            </html>
            """
                .formatted(escapeHtml(manutencao.getDescricao()), escapeHtml(nomeCondominio), dataFormatada, badgeTipoCores, tipo, prestadorLinha, instrucoes);

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
            log.info("Notificação de alteração da manutenção {} enviada para {} inquilino(s)", manutencao.getId(), emails.size());
        } catch (MessagingException e) {
            log.error("Erro ao enviar e-mail de alteração de manutenção: {}", e.getMessage());
        }
    }

    /**
     * Envia relatório de gastos em PDF para um ou mais destinatários (HTML responsivo + anexo).
     */
    public void enviarRelatorioGastosPdf(
            List<String> destinatarios,
            String nomeCondominio,
            String periodoLegivel,
            String totalMesFormatado,
            byte[] pdfBytes,
            String nomeArquivoAnexo) throws MessagingException {

        if (destinatarios == null || destinatarios.isEmpty()) {
            throw new MessagingException("Informe ao menos um destinatário");
        }
        if (pdfBytes == null || pdfBytes.length < 5) {
            throw new MessagingException("PDF inválido ou vazio");
        }
        String assunto = "SIGAC - Relatório de gastos — " + nomeCondominio + " (" + periodoLegivel + ")";

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <title>Relatório de gastos</title>
            </head>
            <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#eef2f7;">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:36px 16px;">
              <tr><td align="center">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(15,23,42,0.12),0 0 0 1px rgba(15,23,42,0.06);">
              <tr>
                <td style="background:linear-gradient(135deg,#1b3266 0%%,#2f6ce6 55%%,#0ea5e9 100%%);padding:36px 28px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.82);">SIGAC</p>
                  <p style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;line-height:1.2;">Relatório de gastos</p>
                  <p style="margin:12px 0 0;font-size:14px;color:rgba(255,255,255,0.92);line-height:1.45;">Condomínio administrado com transparência</p>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 32px 32px;">
                  <p style="margin:0 0 10px;color:#64748b;font-size:14px;">Olá,</p>
                  <p style="margin:0 0 24px;color:#334155;font-size:16px;line-height:1.65;">
                    Segue em <strong>anexo</strong> o relatório de gastos do condomínio, referente ao período indicado abaixo.
                  </p>
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#f8fafc 0%%,#f1f5f9 100%%);border-radius:16px;border:1px solid #e2e8f0;margin-bottom:22px;">
                    <tr><td style="padding:22px 24px;">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                        <tr>
                          <td style="padding:0 0 6px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Condomínio</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 20px;color:#0f172a;font-size:18px;font-weight:700;">%s</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 6px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Período</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 20px;"><span style="display:inline-block;background:#0f172a;color:#fff;padding:10px 16px;border-radius:12px;font-size:15px;font-weight:600;">%s</span></td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 6px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Total do mês (resumo)</td>
                        </tr>
                        <tr>
                          <td style="padding:0;"><span style="display:inline-block;background:linear-gradient(135deg,#d1fae5 0%%,#a7f3d0 100%%);color:#065f46;padding:12px 18px;border-radius:12px;font-size:18px;font-weight:800;border:1px solid #6ee7b7;">%s</span></td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                  <div style="padding:18px 20px;background:#eff6ff;border-radius:14px;border:1px solid #bfdbfe;margin-bottom:8px;">
                    <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.55;">
                      O arquivo PDF contém o detalhamento (funcionários, manutenções e gastos com produtos) para prestação de contas ou arquivo do financeiro.
                    </p>
                  </div>
                  <p style="margin:28px 0 0;padding-top:22px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.5;">
                    Mensagem automática do SIGAC • Administração condominial<br/>
                    Não responda a este e-mail
                  </p>
                </td>
              </tr>
            </table>
              </td></tr>
            </table>
            </body>
            </html>
            """
                .formatted(
                        escapeHtml(nomeCondominio),
                        escapeHtml(periodoLegivel),
                        escapeHtml(totalMesFormatado)
                );

        List<InternetAddress> toAddresses = new ArrayList<>();
        for (String raw : destinatarios) {
            if (raw == null || raw.isBlank()) continue;
            try {
                InternetAddress ia = new InternetAddress(raw.trim());
                ia.validate();
                toAddresses.add(ia);
            } catch (AddressException ex) {
                throw new MessagingException("E-mail inválido: " + raw.trim(), ex);
            }
        }
        if (toAddresses.isEmpty()) {
            throw new MessagingException("Nenhum e-mail de destino válido");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(toAddresses.toArray(new InternetAddress[0]));
        helper.setSubject(assunto);
        helper.setText(html, true);

        String attachmentName = nomeArquivoAnexo != null && !nomeArquivoAnexo.isBlank() ? nomeArquivoAnexo : "relatorio-gastos.pdf";
        helper.addAttachment(attachmentName, new ByteArrayResource(pdfBytes), "application/pdf");
        mailSender.send(message);
        log.info("Relatório de gastos enviado por e-mail para {} destinatário(s)", toAddresses.size());
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
