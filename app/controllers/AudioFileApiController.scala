package controllers

import play.api._
import play.api.mvc._

import com.wordnik.swagger.core._
import com.wordnik.swagger.annotations._

import java.io.File

@Api(value = "/audiofile", listingPath = "/api-docs.{format}/audiofile", description = "Operations about audio files")
object AudioFileApiController extends BaseApiController {

  def getOptions(path: String) = Action { implicit request => JsonResponse(new value.ApiResponse(200, "Ok")) }

  @ApiOperation(value = "Add a new Audio File",
    responseClass = "void")
  @ApiErrors(Array(
    new ApiError(code = 400, reason = "Invalid file format"),
    new ApiError(code = 405, reason = "Invalid input")))
  @ApiParamsImplicit(Array(
    new ApiParamImplicit(value = "Audio file to attach", required = true, dataType = "file", paramType = "body")))
  def addAudioFile () = Action(parse.multipartFormData) { request =>
    request.body.file("file").map { audiofile =>
      import java.io.File
      val filename = audiofile.filename
      val contentType = audiofile.contentType
      audiofile.ref.moveTo(new File("/tmp/audiofile"), true)
      JsonResponse("OK")
    }.getOrElse {
      JsonResponse(new value.ApiResponse(405, "Invalid input"), 405)
    }
  }


}
