package fr.lium
package json
import play.api.libs.json._

import fr.lium.model.{AudioFile, Female, Gender, Male, Speaker, TranscriptionFinished, TranscriptionInProgress, Word}

object ReadsWrites {

  implicit val audioFileWrites = new Writes[AudioFile] {
    def writes(a: AudioFile): JsValue = {
      Json.obj("id" -> a.id)
    }
  }

  implicit val genderWrites = new Writes[Gender] {
    def writes(g: Gender): JsValue = {
      JsString(g match {
        case Male => "m"
        case Female => "f"
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

  implicit val wordWrites = new Writes[Word] {
    def writes(w: Word): JsValue = {
      Json.obj(
        "start"     -> "%.2f".format(w.start),
        "word"      -> w.word,
        "spk"       -> w.speaker
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
