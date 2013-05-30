package fr.lium
package json
import play.api.libs.json._

import fr.lium.model.{AudioFile, Female, Gender, Male, Segment, Speaker, TranscriptionFinished, TranscriptionInProgress}

object ReadsWrites {

  implicit val audioFileWrites = new Writes[AudioFile] {
    def writes(a: AudioFile): JsValue = {
      Json.obj("id" -> a.id)
    }
  }

  implicit val genderWrites = new Writes[Gender] {
    def writes(g: Gender): JsValue = {
      JsString(g match {
        case Male => "male"
        case Female => "female"
      })
    }
  }

  implicit val speakerWrites = new Writes[Speaker] {
    def writes(s: Speaker): JsValue = {
      Json.obj(
        "id"     -> s.id,
        "gender" -> s.gender
      )
    }
  }

  implicit val segmentWrites = new Writes[Segment] {
    def writes(s: Segment): JsValue = {
      Json.obj(
        "audioFile" -> s.audioFile,
        "start"     -> s.start,
        "duration"  -> s.duration,
        "word"      -> s.word,
        "score"     -> s.score,
        "speaker"   -> s.speaker
      )
    }
  }

  implicit val transcriptionInProgressWrites = new Writes[TranscriptionInProgress] {
    def writes(t: TranscriptionInProgress): JsValue = {
      Json.obj(
        "audioFile" -> Json.toJson(t.file),
        "system"    -> t.system,
        "progress"  -> t.progress)
    }
  }

  implicit val transcriptionFinishedWrites = new Writes[TranscriptionFinished] {
    def writes(t: TranscriptionFinished): JsValue = {
      Json.obj(
        "system"    -> t.system,
        "audioFile" -> Json.toJson(t.file),
        "content"   -> Json.toJson(t.transcription)
      )
    }
  }
}
