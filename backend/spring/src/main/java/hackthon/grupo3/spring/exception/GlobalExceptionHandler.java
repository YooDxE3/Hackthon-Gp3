package hackthon.grupo3.spring.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PalpiteBloqueadoException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public Map<String, String> bloqueio(PalpiteBloqueadoException e) {
        return Map.of("erro", e.getMessage());
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> naoEncontrado(
            RecursoNaoEncontradoException e
    ) {
        return Map.of("erro", e.getMessage());
    }

    @ExceptionHandler(TokenRecuperacaoInvalidoException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> tokenInvalido(
            TokenRecuperacaoInvalidoException e
    ) {
        return Map.of("erro", e.getMessage());
    }
}