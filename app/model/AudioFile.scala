package fr.lium
package model

import java.io.File

case class AudioFile(
  id: Long,
  file: File,
  transcriptions: List[Transcription])
