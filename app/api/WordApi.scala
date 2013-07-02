package fr.lium
package api

import fr.lium.model.{Female, Male, Speaker, UnknownGender, Word}
import fr.lium.util.conversion.parseFloatOption

import java.io.File
import scala.io.Source
import scala.util.{Failure, Success, Try}

import play.api.Logger


case class WordApi(encoding: String = "ISO-8859-1") {

  def getWordsFromFile(file: File): List[Word] =
    Try(getWordsFromLines(Source.fromFile(file, encoding).getLines.toList)) match {
      case Success(w) => w
      case Failure(e) => {
        Logger.error("Problem with file '" + file + "' : " + e.getMessage())
        Nil
      }
    }

  def getWordsFromLines(lines: String): List[Word] =
    getWordsFromLines(lines.split("\n").toList)

  def getWordsFromLines(lines: List[String]): List[Word] =
    lines.flatMap(getWordFromLine)

  def getWordFromLine(line: String): Option[Word] = {
    val v: List[String] = line.split(" ").toList

    v match {
        case List(show, _, start, duration, word, score, gender, channel, spkId) => Some(
          Word(show,
            parseFloatOption(start) getOrElse(0),
            parseFloatOption(duration) getOrElse(0),
            word,
            parseFloatOption(score) getOrElse(0),
            (gender, channel, spkId) match {
              case ("N/A","N/A","N/A") => None
              case (gender, channel, spkId)=> Some(Speaker(spkId, channel, gender match {
                case "M" => Male
                case "F" => Female
                case _ => UnknownGender
              }))
            }))
        case _ => None
    }
  }
}
