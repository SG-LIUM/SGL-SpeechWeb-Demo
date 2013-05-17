package controllers

import play.api._
import play.api.mvc._

import com.wordnik.swagger.core._
import com.wordnik.swagger.annotations._

@Api(value = "/audiofile", listingPath = "/api-docs.{format}/audiofile", description = "Operations about audio files")
object AudioFileApiController extends BaseApiController {

  def getOptions(path: String) = Action { implicit request => JsonResponse(new value.ApiResponse(200, "Ok")) }

  @ApiOperation(value = "Add a new audio file", responseClass = "void")
  @ApiErrors(Array(
    new ApiError(code = 405, reason = "Invalid input")))
  @ApiParamsImplicit(Array(
    new ApiParamImplicit(value = "Audio file that needs to be stored", required = true, dataType = "AudioFile", paramType = "body")))
  def addAudioFile() = Action { implicit request =>
    request.body.asJson match {
      case Some(e) => {
        //TODO
        Ok
      }
      case None => JsonResponse(new value.ApiResponse(405, "Invalid input"), 405)
    }
  }
}
