package fr.lium
package api

import fr.lium.model.Word
import java.io.File
import scala.io.Source

case class WordApi(test: String = "") {

  def getWordsFromFile(file: File): List[Word] =
    Source.fromFile(file).getLines.toList.flatMap(getWordFromLine)

  def getWordFromLine(line: String): Option[Word] = {
    val values = line.split(" ").toList

    if(values.length != 9) {
      println("bad format")
      None
    } else {
      //TODO
    }
    None
  }
}
