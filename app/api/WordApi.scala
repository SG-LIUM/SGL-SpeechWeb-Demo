package fr.lium
package api

import fr.lium.model.{Female, Male, Word}
import java.io.File
import scala.io.Source

case class WordApi(test: String = "") {

  def getWordsFromFile(file: File): List[Word] =
    Source.fromFile(file).getLines.toList.flatMap(getWordFromLine)

  def getWordFromLine(line: String): Option[Word] = {
    val v: List[String] = line.split(" ").toList

    if(v.length != 9) {
      println("bad format")
      None
    } else {
      Some(Word(v(0), v(2).toFloat, v(3).toFloat, v(4), v(5).toFloat, None))
    }
  }
}
