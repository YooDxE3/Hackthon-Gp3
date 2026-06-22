package hackthon.grupo3.spring.exception;

public class TokenRecuperacaoInvalidoException extends RuntimeException {

    public TokenRecuperacaoInvalidoException(String mensagem) {
        super(mensagem);
    }
}