package com.tuurio.authsample;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.ModelAndView;

@ControllerAdvice
public class NotFoundAdvice {
  @Value("${TUURIO_ISSUER:https://test.id.tuurio.com}")
  private String authority;

  @ExceptionHandler(NoHandlerFoundException.class)
  public ModelAndView handleNotFound(NoHandlerFoundException ex) {
    ModelAndView mv = new ModelAndView("not-found");
    mv.addObject("authorityHost", authority.replaceFirst("^https?://", ""));
    return mv;
  }
}
