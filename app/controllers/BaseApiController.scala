package controllers

import com.wordnik.swagger.core.util.{ JsonUtil, RestResourceUtil }

import play.api.mvc._

import java.io.StringWriter
import play.api.libs.json._

class BaseApiController extends Controller with RestResourceUtil {

  protected def JsonResponse(response: SimpleResult[JsValue]): PlainResult =
    response.as("application/json")
      .withHeaders(
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT"),
        ("Access-Control-Allow-Headers", "Content-Type, api_key, Authorization"))
}
