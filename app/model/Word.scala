package fr.lium
package model

case class Word(
  show: String,
  start: Float,
  duration: Float,
  word: String,
  score: Float,
  speaker: Option[Speaker])
