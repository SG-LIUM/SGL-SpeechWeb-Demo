package controllers

import com.wordnik.swagger.core.util.{ JsonUtil, RestResourceUtil }

import play.api.mvc._

import java.io.StringWriter
import play.api.libs.json._

object BaseApiController {
  val mapper = JsonUtil.getJsonMapper
}

class BaseApiController extends Controller with RestResourceUtil {

  protected def JsonOk(jsonObject: JsObject) = Ok(jsonObject)
      .withHeaders(
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT"),
        ("Access-Control-Allow-Headers", "Content-Type, api_key, Authorization"))


  protected def JsonResponse(data: Object, code: Int = 200) = {
    val w = new StringWriter()

    BaseApiController.mapper.writeValue(w, data)

    val jsonValue: String = w.toString()
    new SimpleResult[String](header = ResponseHeader(code), body = play.api.libs.iteratee.Enumerator(jsonValue)).as("application/json")
      .withHeaders(
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT"),
        ("Access-Control-Allow-Headers", "Content-Type, api_key, Authorization"))
  }
}
