package fr.lium
package model

import java.io.File


case class Transcription(
  file: AudioFile,
  status: Status = InProgress,
  system: Option[String] = None,
  transcription: Option[List[Word]] = None,
  filename: Option[File] = None)

case class DbTranscription(
  file: AudioFile,
  system: Option[String] = None,
  status: Status = InProgress,
  filename: Option[File] = None)

case object DbTranscription {

  def status(status: String): Status = status match {
    case InProgress.value ⇒ InProgress
    case Finished.value   ⇒ Finished
    case _                ⇒ Unknown
  }

}
