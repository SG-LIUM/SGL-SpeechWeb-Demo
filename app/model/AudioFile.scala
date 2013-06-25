package fr.lium
package model

import java.io.File

//Input
case class AudioFile(
  id: Option[Int],
  fileName: String,
  status: Status = Uploaded)

//Output
case class AudioFileTranscriptions(
  audioFile: AudioFile,
  transcriptions: List[Transcription])

