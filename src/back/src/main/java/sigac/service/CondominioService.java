package sigac.service;

import sigac.domain.*;
import sigac.dto.CondominioDTO;
import sigac.security.UserPrincipal;
import sigac.dto.CreateUserRequest;
import sigac.dto.UpdateUserRequest;
import sigac.dto.UserDTO;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CondominioService {

    private final CondominioRepository condominioRepository;
    private final UserRepository userRepository;
    private final GestorCondominioRepository gestorCondominioRepository;
    private final SindicoCondominioRepository sindicoCondominioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CondominioAcessoService acessoService;

    public CondominioService(CondominioRepository condominioRepository, UserRepository userRepository, GestorCondominioRepository gestorCondominioRepository, SindicoCondominioRepository sindicoCondominioRepository, PasswordEncoder passwordEncoder, CondominioAcessoService acessoService) {
        this.condominioRepository = condominioRepository;
        this.userRepository = userRepository;
        this.gestorCondominioRepository = gestorCondominioRepository;
        this.sindicoCondominioRepository = sindicoCondominioRepository;
        this.passwordEncoder = passwordEncoder;
        this.acessoService = acessoService;
    }

    @Transactional(readOnly = true)
    public List<CondominioDTO> listarCondominios() {
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        if (principal == null) throw new ForbiddenException("Não autenticado");
        if (principal.getRole() == Role.SIGAC_ADMIN) {
            return condominioRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
        }
        if (principal.getRole() == Role.GESTOR) {
            return gestorCondominioRepository.findByUserId(principal.getId()).stream()
                    .map(g -> toDTO(g.getCondominio()))
                    .collect(Collectors.toList());
        }
        if (principal.getRole() == Role.SINDICO) {
            return sindicoCondominioRepository.findByUserId(principal.getId()).stream()
                    .map(s -> toDTO(s.getCondominio()))
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    @Transactional
    public CondominioDTO criarCondominio(CondominioDTO dto) {
        assertAdmin("Apenas SIGAC Admin pode criar condomínios");
        Condominio c = new Condominio();
        applyCondominioChanges(c, dto);
        c = condominioRepository.save(c);
        return toDTO(c);
    }

    @Transactional(readOnly = true)
    public CondominioDTO buscarPorId(Long id) {
        if (!acessoService.podeAcessarCondominio(id)) throw new ForbiddenException("Sem acesso a este condomínio");
        Condominio c = condominioRepository.findById(id).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        return toDTO(c);
    }

    @Transactional
    public CondominioDTO atualizar(Long id, CondominioDTO dto) {
        assertAdmin("Apenas SIGAC Admin pode editar condomínios");
        Condominio c = condominioRepository.findById(id).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        applyCondominioChanges(c, dto);
        return toDTO(condominioRepository.save(c));
    }

    @Transactional
    public void excluir(Long id) {
        assertAdmin("Apenas SIGAC Admin pode excluir condomínios");
        Condominio condominio = condominioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));

        List<Long> userIds = gestorCondominioRepository.findByCondominioId(id).stream()
                .map(g -> g.getUser().getId())
                .collect(Collectors.toList());
        userIds.addAll(
                sindicoCondominioRepository.findByCondominioId(id).stream()
                        .map(s -> s.getUser().getId())
                        .collect(Collectors.toList())
        );

        condominioRepository.delete(condominio);
        condominioRepository.flush();

        userIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .forEach(this::deleteUserIfOrphaned);
    }

    /** Cria um usuário com role GESTOR e associa ao condomínio. (SIGAC Admin only) */
    @Transactional
    public UserDTO criarGestor(Long condominioId, CreateUserRequest request) {
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        if (principal == null || principal.getRole() != Role.SIGAC_ADMIN) {
            throw new ForbiddenException("Apenas SIGAC Admin pode criar gestores");
        }
        Condominio condominio = condominioRepository.findById(condominioId).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Já existe usuário com este e-mail");
        }
        User user = new User();
        user.setNome(request.getNome());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.GESTOR);
        user = userRepository.save(user);
        GestorCondominio gc = new GestorCondominio();
        gc.setCondominio(condominio);
        gc.setUser(user);
        gestorCondominioRepository.save(gc);
        return toUserDTO(user);
    }

    /** Cria um usuário com role SINDICO e associa ao condomínio. (SIGAC Admin only) */
    @Transactional
    public UserDTO criarSindico(Long condominioId, CreateUserRequest request) {
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        if (principal == null || principal.getRole() != Role.SIGAC_ADMIN) {
            throw new ForbiddenException("Apenas SIGAC Admin pode criar síndicos");
        }
        Condominio condominio = condominioRepository.findById(condominioId).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Já existe usuário com este e-mail");
        }
        User user = new User();
        user.setNome(request.getNome());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.SINDICO);
        user = userRepository.save(user);
        SindicoCondominio sc = new SindicoCondominio();
        sc.setCondominio(condominio);
        sc.setUser(user);
        sindicoCondominioRepository.save(sc);
        return toUserDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> listarGestores(Long condominioId) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        return gestorCondominioRepository.findByCondominioId(condominioId).stream()
                .map(g -> toUserDTO(g.getUser()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> listarSindicos(Long condominioId) {
        if (!acessoService.podeAcessarCondominio(condominioId)) throw new ForbiddenException("Sem acesso");
        return sindicoCondominioRepository.findByCondominioId(condominioId).stream()
                .map(s -> toUserDTO(s.getUser()))
                .collect(Collectors.toList());
    }

    /** Atualiza nome e e-mail de um gestor associado ao condomínio. (SIGAC Admin only) */
    @Transactional
    public UserDTO atualizarGestor(Long condominioId, Long userId, UpdateUserRequest request) {
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        if (principal == null || principal.getRole() != Role.SIGAC_ADMIN) {
            throw new ForbiddenException("Apenas SIGAC Admin pode editar gestores");
        }
        GestorCondominio gc = gestorCondominioRepository.findByCondominioIdAndUserId(condominioId, userId)
                .orElseThrow(() -> new NotFoundException("Gestor não encontrado para este condomínio"));
        User user = gc.getUser();
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Já existe usuário com este e-mail");
        }
        user.setNome(request.getNome());
        user.setEmail(request.getEmail());
        if (request.getNovaSenha() != null && !request.getNovaSenha().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNovaSenha()));
        }
        return toUserDTO(userRepository.save(user));
    }

    /** Remove vínculo de gestor com o condomínio, e apaga usuário se não tiver outros vínculos. (SIGAC Admin only) */
    @Transactional
    public void removerGestor(Long condominioId, Long userId) {
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        if (principal == null || principal.getRole() != Role.SIGAC_ADMIN) {
            throw new ForbiddenException("Apenas SIGAC Admin pode remover gestores");
        }
        GestorCondominio gc = gestorCondominioRepository.findByCondominioIdAndUserId(condominioId, userId)
                .orElseThrow(() -> new NotFoundException("Gestor não encontrado para este condomínio"));
        User user = gc.getUser();
        gestorCondominioRepository.delete(gc);
        boolean aindaEhGestor = !gestorCondominioRepository.findByUserId(user.getId()).isEmpty();
        boolean aindaEhSindico = !sindicoCondominioRepository.findByUserId(user.getId()).isEmpty();
        if (!aindaEhGestor && !aindaEhSindico) {
            userRepository.delete(user);
        }
    }

    /** Atualiza nome e e-mail de um síndico associado ao condomínio. (SIGAC Admin only) */
    @Transactional
    public UserDTO atualizarSindico(Long condominioId, Long userId, UpdateUserRequest request) {
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        if (principal == null || principal.getRole() != Role.SIGAC_ADMIN) {
            throw new ForbiddenException("Apenas SIGAC Admin pode editar síndicos");
        }
        SindicoCondominio sc = sindicoCondominioRepository.findByCondominioIdAndUserId(condominioId, userId)
                .orElseThrow(() -> new NotFoundException("Síndico não encontrado para este condomínio"));
        User user = sc.getUser();
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Já existe usuário com este e-mail");
        }
        user.setNome(request.getNome());
        user.setEmail(request.getEmail());
        if (request.getNovaSenha() != null && !request.getNovaSenha().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNovaSenha()));
        }
        return toUserDTO(userRepository.save(user));
    }

    /** Remove vínculo de síndico com o condomínio, e apaga usuário se não tiver outros vínculos. (SIGAC Admin only) */
    @Transactional
    public void removerSindico(Long condominioId, Long userId) {
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        if (principal == null || principal.getRole() != Role.SIGAC_ADMIN) {
            throw new ForbiddenException("Apenas SIGAC Admin pode remover síndicos");
        }
        SindicoCondominio sc = sindicoCondominioRepository.findByCondominioIdAndUserId(condominioId, userId)
                .orElseThrow(() -> new NotFoundException("Síndico não encontrado para este condomínio"));
        User user = sc.getUser();
        sindicoCondominioRepository.delete(sc);
        boolean aindaEhGestor = !gestorCondominioRepository.findByUserId(user.getId()).isEmpty();
        boolean aindaEhSindico = !sindicoCondominioRepository.findByUserId(user.getId()).isEmpty();
        if (!aindaEhGestor && !aindaEhSindico) {
            userRepository.delete(user);
        }
    }

    private CondominioDTO toDTO(Condominio c) {
        CondominioDTO dto = new CondominioDTO();
        dto.setId(c.getId());
        dto.setNome(c.getNome());
        dto.setEndereco(c.getEndereco());
        dto.setEnderecoCompleto(buildEnderecoCompleto(c));
        dto.setCnpj(c.getCnpj());
        dto.setCep(c.getCep());
        dto.setLogradouro(c.getLogradouro());
        dto.setNumero(c.getNumero());
        dto.setComplemento(c.getComplemento());
        dto.setBairro(c.getBairro());
        dto.setCidade(c.getCidade());
        dto.setUf(c.getUf());
        return dto;
    }

    private UserDTO toUserDTO(User u) {
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setNome(u.getNome());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole());
        return dto;
    }

    /**
     * Normaliza CNPJ para a nova norma alfanumérica:
     * - remove pontuação/espaços
     * - converte para maiúsculas
     * - exige exatamente 14 caracteres [A-Z0-9] quando informado
     *
     * Mantém compatibilidade com CNPJ numérico legado (vira 14 dígitos após normalizar).
     */
    static String normalizeCnpjAlpha(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) return null;

        String normalized = trimmed.replaceAll("[^0-9A-Za-z]", "").toUpperCase();
        if (normalized.length() != 14) {
            throw new IllegalArgumentException("CNPJ inválido. Informe 14 caracteres (alfanumérico), com ou sem pontuação.");
        }
        if (!normalized.matches("^[A-Z0-9]{14}$")) {
            throw new IllegalArgumentException("CNPJ inválido. Use apenas letras A-Z e números 0-9.");
        }
        return normalized;
    }

    private void applyCondominioChanges(Condominio condominio, CondominioDTO dto) {
        condominio.setNome(trimToNull(dto.getNome()));
        condominio.setCnpj(normalizeCnpjAlpha(dto.getCnpj()));
        condominio.setCep(normalizeCep(dto.getCep()));
        condominio.setLogradouro(trimToNull(dto.getLogradouro()));
        condominio.setNumero(trimToNull(dto.getNumero()));
        condominio.setComplemento(trimToNull(dto.getComplemento()));
        condominio.setBairro(trimToNull(dto.getBairro()));
        condominio.setCidade(trimToNull(dto.getCidade()));
        condominio.setUf(normalizeUf(dto.getUf()));

        String enderecoInformado = trimToNull(dto.getEndereco());
        if (enderecoInformado == null) {
            enderecoInformado = trimToNull(dto.getEnderecoCompleto());
        }
        condominio.setEndereco(enderecoInformado != null ? enderecoInformado : buildEnderecoCompleto(condominio));
    }

    private void deleteUserIfOrphaned(Long userId) {
        if (userId == null) return;
        if (!gestorCondominioRepository.findByUserId(userId).isEmpty()) return;
        if (!sindicoCondominioRepository.findByUserId(userId).isEmpty()) return;
        userRepository.findById(userId).ifPresent(userRepository::delete);
    }

    private void assertAdmin(String message) {
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        if (principal == null || principal.getRole() != Role.SIGAC_ADMIN) {
            throw new ForbiddenException(message);
        }
    }

    private static String trimToNull(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String normalizeCep(String raw) {
        String trimmed = trimToNull(raw);
        if (trimmed == null) return null;
        String digits = trimmed.replaceAll("\\D", "");
        if (digits.length() != 8) {
            throw new IllegalArgumentException("CEP inválido. Informe 8 dígitos.");
        }
        return digits;
    }

    private static String normalizeUf(String raw) {
        String trimmed = trimToNull(raw);
        if (trimmed == null) return null;
        String normalized = trimmed.toUpperCase();
        if (!normalized.matches("^[A-Z]{2}$")) {
            throw new IllegalArgumentException("UF inválida. Use a sigla com 2 letras.");
        }
        return normalized;
    }

    private static String buildEnderecoCompleto(Condominio condominio) {
        return joinNonBlank(
                joinNonBlank(condominio.getLogradouro(), condominio.getNumero(), ", "),
                condominio.getComplemento(),
                " - "
        ).isBlank()
                ? joinNonBlank(condominio.getBairro(), joinNonBlank(condominio.getCidade(), condominio.getUf(), "/"), " - ")
                : joinNonBlank(
                        joinNonBlank(
                                joinNonBlank(condominio.getLogradouro(), condominio.getNumero(), ", "),
                                condominio.getComplemento(),
                                " - "
                        ),
                        joinNonBlank(condominio.getBairro(), joinNonBlank(condominio.getCidade(), condominio.getUf(), "/"), " - "),
                        " - "
                );
    }

    private static String joinNonBlank(String first, String second, String separator) {
        String left = trimToNull(first);
        String right = trimToNull(second);
        if (left == null && right == null) return "";
        if (left == null) return right;
        if (right == null) return left;
        return left + separator + right;
    }
}
