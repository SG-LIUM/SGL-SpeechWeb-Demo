package fr.lium
package model

case class Transcription(
  id: Long,
  file: AudioFile,
  system: String,
  transcription: List[Segment])
