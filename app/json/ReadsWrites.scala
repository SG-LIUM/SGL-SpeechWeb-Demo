package fr.lium
package json
import play.api.libs.json._

import fr.lium.model.{AudioFile, Diarization, Female, Gender, Male, Speaker, Status, Transcribing, Transcription, UnknownGender, Uploaded, Word}

object ReadsWrites {

  implicit val statusWrites = new Writes[Status] {
    def writes(s: Status): JsValue = {
      JsString(s.value)
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
        case UnknownGender => "u"
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


  implicit val transcriptionWrites = new Writes[Transcription] {
    def writes(t: Transcription): JsValue = {
      Json.obj(
        "system"    -> t.system,
        "audioFile" -> Json.toJson(t.file),
        "content"   -> Json.toJson(t.transcription)
      )
    }
  }
}
