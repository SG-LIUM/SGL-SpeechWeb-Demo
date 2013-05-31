package fr.lium
package api

import fr.lium.model.{Female, Male, Word}
import fr.lium.util.conversion.parseFloatOption

import java.io.File
import scala.io.Source


case class WordApi(test: String = "") {

  def getWordsFromFile(file: File): List[Word] =
    Source.fromFile(file).getLines.toList.flatMap(getWordFromLine)

  def getWordFromLine(line: String): Option[Word] = {
    val v: List[String] = line.split(" ").toList

    v match {
        case List(show, _, start, duration, word, score, _, _, _) => Some(
          Word(show,
            parseFloatOption(start) getOrElse(0),
            parseFloatOption(duration) getOrElse(0),
            word,
            parseFloatOption(score) getOrElse(0), None))
        case _ => {
            println("bad format")
            None
        }
    }
  }
}
