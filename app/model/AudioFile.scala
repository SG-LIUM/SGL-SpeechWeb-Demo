package fr.lium
package model

import java.io.File

//Input
case class AudioFile(
  id: Option[Int],
  file: File)

//Output
case class AudioFileTranscriptions(
  audioFile: AudioFile,
  transcriptions: List[TranscriptionFinished])

