package fr.lium
package model

import java.io.File

case class TranscriptionFinished(
  file: AudioFile,
  system: Option[String] = None,
  transcription: List[Word],
  filename: Option[File] = None)

case class TranscriptionInProgress(
  file: AudioFile,
  progress: Int = 0,
  system: Option[String] = None)
