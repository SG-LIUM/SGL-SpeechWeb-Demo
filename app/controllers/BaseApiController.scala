package controllers

import play.api.mvc._

import java.io.StringWriter
import play.api.libs.json._

class BaseApiController extends Controller {

  protected def JsonResponse(response: SimpleResult): SimpleResult =
    response.as("application/json")
      .withHeaders(
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT"),
        ("Access-Control-Allow-Headers", "Content-Type, api_key, Authorization"))
}
