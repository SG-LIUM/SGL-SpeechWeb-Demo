package fr.lium
package model

import java.io.File

//Input
case class AudioFile(
  id: Int,
  file: File)

//Output
case class AudioFileTranscriptions(
  audioFile: AudioFile,
  transcriptions: List[Transcription])

