package fr.lium
package model

import java.io.File

case class Transcription(
  file: AudioFile,
  status: Status = InProgress,
  system: Option[String] = None,
  transcription: Option[List[Word]] = None,
  filename: Option[File] = None)

