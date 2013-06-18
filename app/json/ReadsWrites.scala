package fr.lium
package json
import play.api.libs.json._

import fr.lium.model.{AudioFile, Diarization, Female, Gender, Male, Speaker, Status, Transcribing, TranscriptionFinished,
TranscriptionInProgress, Unknown, Uploaded, Word}

object ReadsWrites {

  implicit val statusWrites = new Writes[Status] {
    def writes(s: Status): JsValue = {
      JsString(s match {
        case Uploaded => "uploaded"
        case Diarization => "diarization"
        case Transcribing => "transcribing"
      })
    }
  }

  implicit val audioFileWrites = new Writes[AudioFile] {
    def writes(a: AudioFile): JsValue = {
      Json.obj(
        "id" -> a.id,
        "status" -> a.status
      )
    }
  }

  implicit val genderWrites = new Writes[Gender] {
    def writes(g: Gender): JsValue = {
      JsString(g match {
        case Male => "m"
        case Female => "f"
        case Unknown => "u"
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
