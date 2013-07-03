package controllers

import play.api._
import play.api.mvc._

object Application extends Controller {

  def about = Action {
    Ok(views.html.about())
  }

  def demo = Action {
    Ok(views.html.demo())
  }

  def docs = Action {
    Ok(views.html.docs())
  }

  def index = Action {
    Ok(views.html.index())
  }

  def results = Action {
    Ok(views.html.results())
  }

  def ash = Action {
    Ok(views.html.ash())
  }

}
