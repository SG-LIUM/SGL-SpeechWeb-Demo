package fr.lium
package model

case class Segment(
  audioFile: AudioFile,
  start: Float,
  duration: Float,
  word: String,
  score: Float,
  speaker: Option[Speaker])
