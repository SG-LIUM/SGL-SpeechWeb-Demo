package fr.lium
package model

import java.io.File

//Input
case class AudioFile(
  id: Option[Int],
  fileName: String,
  status: Status = Uploaded)

case object AudioFile {

  def status(status: String): Status =
    status match {
      case Uploaded.value     => Uploaded
      case Diarization.value  => Diarization
      case Transcribing.value => Transcribing
      case Finished.value     => Finished
      case _                  => Unknown
    }

}

//Output
case class AudioFileTranscriptions(
  audioFile: AudioFile,
  transcriptions: List[Transcription])

