package fr.lium
package api

import java.io.File
import scala.util.{Try, Success, Failure}
import scala.util.matching.Regex

object AudioFileApi {

  def createAudioFile(tmpFile: File): Try[Int] = {
    Success(0)

  }
  def getNextFileId(dirs: List[File]): Option[Int] = {
    val regexp = """\d+""".r
    val maybeLastFile: Option[File] = dirs.filter(f => f.isDirectory && regexp.findFirstIn(f.getName).isDefined).sorted.lastOption

    maybeLastFile flatMap { f =>
        Try(f.getName.toInt) match {
          case Success(v) => Some(v + 1)
          case Failure(v) => None
        }
      }
  }

  def getNextFileId(dirs: Array[File]): Option[Int] = {
    getNextFileId(dirs.toList)

  }
  def getNextFileId(dir: File): Option[Int] = {
    for {
      files <- Option(dir.listFiles)
      id <- getNextFileId(files)
    } yield(id)
  }
}
