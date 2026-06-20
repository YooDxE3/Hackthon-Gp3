package hackthon.grupo3.spring.dto;

import hackthon.grupo3.spring.model.Usuario;

public record UsuarioRankingResponse(
        Long id,
        String nome,
        String avatarUrl,
        int pontuacaoTotal,
        int placaresExatos
) {
    public static UsuarioRankingResponse de(Usuario u) {
        return new UsuarioRankingResponse(
                u.getId(),
                u.getNome(),
                u.getAvatarUrl(),
                u.getPontuacaoTotal(),
                u.getPlacaresExatos()
        );
    }
}
