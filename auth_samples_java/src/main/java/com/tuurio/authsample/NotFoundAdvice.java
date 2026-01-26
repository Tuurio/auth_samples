package com.tuurio.authsample;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.ModelAndView;

@ControllerAdvice
public class NotFoundAdvice {
  @ExceptionHandler(NoHandlerFoundException.class)
  public ModelAndView handleNotFound(NoHandlerFoundException ex) {
    return new ModelAndView("not-found");
  }
}
