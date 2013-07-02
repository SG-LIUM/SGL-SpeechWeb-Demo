package fr.lium
package model

case class Word(
  show: String,
  start: Float,
  duration: Float,
  word: String,
  score: Option[Float] = None,
  speaker: Option[Speaker] = None)
