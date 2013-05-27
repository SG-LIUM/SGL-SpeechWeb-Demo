package controllers

import play.api._
import play.api.mvc._

import fr.lium.Env

import com.wordnik.swagger.core._
import com.wordnik.swagger.annotations._

import java.io.File
import scala.concurrent.ExecutionContext.Implicits._

import scala.util.{ Try, Success, Failure }

@Api(value = "/audiofile", listingPath = "/api-docs.{format}/audiofile", description = "Operations about audio files")
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
            case Success(v) ⇒ JsonResponse(new Integer(v._1))
            case Failure(e) ⇒ JsonResponse("Ooops! It seems we had a problem storing the file. Message: " + e.getMessage, 500)
          }

        }
      }
    }.getOrElse {
      JsonResponse(new value.ApiResponse(405, "Invalid input"), 405)
    }
  }

}
