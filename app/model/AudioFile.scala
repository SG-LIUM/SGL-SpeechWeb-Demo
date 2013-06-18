package fr.lium
package model

import java.io.File

sealed trait Status

case object Uploaded extends Status {
  override def toString = "uploaded"
}
case object Diarization extends Status
case object Transcribing extends Status

//Input
case class AudioFile(
  id: Option[Int],
  fileName: String,
  status: Status = Uploaded)

//Output
case class AudioFileTranscriptions(
  audioFile: AudioFile,
  transcriptions: List[TranscriptionFinished])

