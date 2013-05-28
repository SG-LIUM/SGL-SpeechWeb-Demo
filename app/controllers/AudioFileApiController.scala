package controllers

import play.api._
import play.api.mvc._

import fr.lium.Env

import com.wordnik.swagger.core._
import com.wordnik.swagger.annotations._
import javax.ws.rs.{ QueryParam, PathParam }

import java.io.File
import scala.concurrent.ExecutionContext.Implicits._

import scala.util.{ Try, Success, Failure }

@Api(value = "/audiofiles", listingPath = "/api-docs.{format}/audiofiles", description = "Operations about audio files")
object AudioFileApiController extends BaseApiController {

  private lazy val env = Env.current

  def getOptions(path: String) = Action { implicit request ⇒ JsonResponse(new value.ApiResponse(200, "Ok")) }

  @ApiOperation(value = "Add a new Audio File",
    responseClass = "void")
  @ApiErrors(Array(
    new ApiError(code = 400, reason = "Invalid file format"),
    new ApiError(code = 405, reason = "Invalid input")))
  @ApiParamsImplicit(Array(
    new ApiParamImplicit(value = "Audio file to attach", required = true, dataType = "file", paramType = "body")))
  def addAudioFile() = Action(parse.multipartFormData) { request ⇒
    request.body.file("file").map { audiofile ⇒
      Async {
        val f = env.audioFileApi.createAudioFile(audiofile.ref.file, audiofile.filename)
        f.map { result ⇒

          result match {
            case Success(audioFile) ⇒ JsonResponse(new Integer(audioFile.id))
            case Failure(e) ⇒ JsonResponse("Ooops! It seems we had a problem storing the file. Message: " + e.getMessage, 500)
          }

        }
      }
    }.getOrElse {
      JsonResponse(new value.ApiResponse(405, "Invalid input"), 405)
    }
  }


  @ApiOperation(value = "Start a transcription", responseClass = "void", httpMethod = "POST")
  @ApiErrors(Array(
    new ApiError(code = 400, reason = "Invalid input")))
  def transcription(@ApiParam(value = "ID of the audiofile")@PathParam("id") id: Long) = Action { implicit request =>
    request.body.asJson match {
      case Some(e) => {
        Ok
      }
      case None => JsonResponse(new value.ApiResponse(400, "Invalid input"), 400)
    }
  }
}
