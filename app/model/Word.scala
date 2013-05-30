package fr.lium
package model

case class Word(
  audioFile: AudioFile,
  start: Float,
  duration: Float,
  word: String,
  score: Float,
  speaker: Option[Speaker])
