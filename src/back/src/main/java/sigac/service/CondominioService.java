package sigac.service;

import sigac.domain.*;
import sigac.dto.CondominioDTO;
import sigac.security.UserPrincipal;
import sigac.dto.CreateUserRequest;
import sigac.dto.UserDTO;
import sigac.exception.ForbiddenException;
import sigac.exception.NotFoundException;
import sigac.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
        UserPrincipal principal = CondominioAcessoService.getCurrentUser();
        if (principal == null || principal.getRole() != Role.SIGAC_ADMIN) {
            throw new ForbiddenException("Apenas SIGAC Admin pode criar condomínios");
        }
        Condominio c = new Condominio();
        c.setNome(dto.getNome());
        c.setEndereco(dto.getEndereco());
        c.setCnpj(dto.getCnpj());
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
        if (!acessoService.podeEditarCondominio(id)) throw new ForbiddenException("Sem permissão para editar");
        Condominio c = condominioRepository.findById(id).orElseThrow(() -> new NotFoundException("Condomínio não encontrado"));
        c.setNome(dto.getNome());
        c.setEndereco(dto.getEndereco());
        c.setCnpj(dto.getCnpj());
        return toDTO(condominioRepository.save(c));
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

    private CondominioDTO toDTO(Condominio c) {
        CondominioDTO dto = new CondominioDTO();
        dto.setId(c.getId());
        dto.setNome(c.getNome());
        dto.setEndereco(c.getEndereco());
        dto.setCnpj(c.getCnpj());
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
}
