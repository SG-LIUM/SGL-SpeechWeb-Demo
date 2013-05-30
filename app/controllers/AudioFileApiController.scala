package controllers

import play.api._
import play.api.mvc._

import fr.lium.Env
import fr.lium.json.ReadsWrites._

import com.wordnik.swagger.core._
import com.wordnik.swagger.annotations._
import javax.ws.rs.{ QueryParam, PathParam }

import java.io.File
import scala.concurrent.ExecutionContext.Implicits._

import scala.util.{ Try, Success, Failure }
import play.api.libs.json._

@Api(value = "/audiofiles", listingPath = "/api-docs.{format}/audiofiles", description = "Operations about audio files")
object AudioFileApiController extends BaseApiController {

  private lazy val env = Env.current

  def getOptions(path: String) = Action { implicit request ⇒ JsonResponse(Ok(Json.obj("message" -> "Ok"))) }

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
            case Success(audioFile) ⇒ JsonResponse(Ok(Json.toJson(audioFile)))
            case Failure(e) ⇒ JsonResponse(InternalServerError(Json.obj("message" -> ("Ooops! It seems we had a problem storing the file. Message: " +
              e.getMessage))))
          }

        }
      }
    }.getOrElse {
      JsonResponse(Status(405)(Json.obj("message" -> "Invalid input")))
    }
  }


  @ApiOperation(value = "Start a transcription", responseClass = "void", httpMethod = "POST")
  @ApiErrors(Array(
    new ApiError(code = 404, reason = "AudioFile not found")))
  def startTranscription(@ApiParam(value = "ID of the audiofile")@PathParam("id") id: Int) = Action { implicit request =>
    env.audioFileApi.getAudioFileById(id).map { audioFile =>
      val progress = env.transcriptionApi.startTranscription(audioFile)
      JsonResponse(Ok(Json.obj(
        "transcription" -> Json.toJson(progress),
        "urlStatus" -> routes.AudioFileApiController.getTranscriptionProgress(id).absoluteURL())))
    }.getOrElse {
      JsonResponse(NotFound(Json.obj("message" -> "AudioFile not found")))
    }
  }

  @ApiOperation(value = "Get the progress of a transcription", responseClass = "void", httpMethod = "GET")
  @ApiErrors(Array(
    new ApiError(code = 404, reason = "AudioFile not found")))
  def getTranscriptionProgress(@ApiParam(value = "ID of the audiofile")@PathParam("id") id: Int) = Action { implicit request =>
    env.audioFileApi.getAudioFileById(id).map { audioFile =>
      val progress = env.transcriptionApi.getTranscriptionProgress(audioFile)
      JsonResponse(Ok(Json.toJson(progress)))
    }.getOrElse {
      JsonResponse(NotFound(Json.obj("message" -> "AudioFile not found")))
    }
  }

  @ApiOperation(value = "Get the transcription", responseClass = "void", httpMethod = "GET")
  @ApiErrors(Array(
    new ApiError(code = 404, reason = "AudioFile not found")))
  def getTranscription(@ApiParam(value = "ID of the audiofile")@PathParam("id") id: Int) = Action { implicit request =>
    env.audioFileApi.getAudioFileById(id).map { audioFile =>
      val transcriptionFinished = env.transcriptionApi.getTranscription(audioFile)
      transcriptionFinished.map { t =>
        JsonResponse(Ok(Json.toJson(t)))
      }.getOrElse {
        JsonResponse(NotFound(Json.obj("message" -> ("Transcription not found. It may not be finished. Check " +
          routes.AudioFileApiController.getTranscriptionProgress(id).absoluteURL() + " to check the progress."))))
      }
    }.getOrElse {
      JsonResponse(NotFound(Json.obj("message" -> "AudioFile not found")))
    }
  }
}
