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
import play.api.libs.json._

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
            case Success(audioFile) ⇒ JsonOk(Json.obj("id" -> audioFile.id))
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
    new ApiError(code = 404, reason = "AudioFile not found")))
  def startTranscription(@ApiParam(value = "ID of the audiofile")@PathParam("id") id: Int) = Action { implicit request =>
    env.audioFileApi.getAudioFileById(id).map { audioFile =>
      val progress = env.transcriptionApi.startTranscription(audioFile)
      JsonOk(Json.obj(
        "audioFile" -> Json.obj(
          "id"        -> progress.file.id),
        "urlStatus" -> routes.AudioFileApiController.getTranscriptionProgress(id).absoluteURL()))
    }.getOrElse {
      JsonResponse(new value.ApiResponse(404, "AudioFile not found"), 404)
    }
  }

  @ApiOperation(value = "Get the progress of a transcription", responseClass = "void", httpMethod = "GET")
  @ApiErrors(Array(
    new ApiError(code = 404, reason = "AudioFile not found")))
  def getTranscriptionProgress(@ApiParam(value = "ID of the audiofile")@PathParam("id") id: Int) = Action { implicit request =>
    env.audioFileApi.getAudioFileById(id).map { audioFile =>
      val progress = env.transcriptionApi.getTranscriptionProgress(audioFile)
      JsonOk(Json.obj(
        "audioFile" -> Json.obj(
          "id"        -> progress.file.id),
        "progress" -> progress.progress))
    }.getOrElse {
      JsonResponse(new value.ApiResponse(404, "AudioFile not found"), 404)
    }
  }

  @ApiOperation(value = "Get the transcription", responseClass = "void", httpMethod = "GET")
  @ApiErrors(Array(
    new ApiError(code = 404, reason = "AudioFile not found")))
  def getTranscription(@ApiParam(value = "ID of the audiofile")@PathParam("id") id: Int) = Action { implicit request =>
    env.audioFileApi.getAudioFileById(id).map { audioFile =>
      val progress = env.transcriptionApi.getTranscription(audioFile)
      progress.map { p =>
      JsonOk(Json.obj(
        "audioFile" -> Json.obj(
          "id"        -> p.file.id)))
      }.getOrElse {
        JsonResponse(new value.ApiResponse(404, "Transcription not found. It may not be finished. Check " +
          routes.AudioFileApiController.getTranscriptionProgress(id).absoluteURL() + " to check the progress."), 404)
      }
    }.getOrElse {
      JsonResponse(new value.ApiResponse(404, "AudioFile not found"), 404)
    }
  }
}
