package controllers

import play.api._
import play.api.mvc._

import fr.lium.Env
import fr.lium.json.ReadsWrites._
import fr.lium.util.FileUtils

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
      val f = env.audioFileApi.createAudioFile(audiofile.ref.file, FileUtils.getFileExtension(audiofile.filename))
      f match {
        case Success(audioFile) => JsonResponse(Ok(Json.toJson(audioFile)))
        case Failure(e) => JsonResponse(InternalServerError(
          Json.obj("message" -> ("Ooops! It seems we had a problem storing the file." + e.getMessage()))
        ))
      }

    }.getOrElse {
      JsonResponse(Status(405)(Json.obj("message" -> "Invalid input")))
    }
  }


  @ApiOperation(value = "Start the transcriptions", responseClass = "void", httpMethod = "POST")
  @ApiErrors(Array(
    new ApiError(code = 404, reason = "AudioFile not found")))
  def startTranscriptions(@ApiParam(value = "ID of the audiofile")@PathParam("id") id: Int) = Action { implicit request =>
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

  @ApiOperation(value = "Get the transcriptions", responseClass = "void", httpMethod = "GET")
  @ApiErrors(Array(
    new ApiError(code = 404, reason = "AudioFile not found")))
  def getTranscriptions(@ApiParam(value = "ID of the audiofile")@PathParam("id") id: Int) = Action { implicit request =>

    env.audioFileApi.getAudioFileById(id) match {
      case Success(audioFile) => {
        val transcriptions = env.transcriptionApi.getTranscriptions(audioFile)
        JsonResponse(Ok(Json.toJson(transcriptions)))
      }
      case Failure(e) => JsonResponse(NotFound(Json.obj("message" -> ("AudioFile not found. " + e.getMessage()))))
    }
  }
}
