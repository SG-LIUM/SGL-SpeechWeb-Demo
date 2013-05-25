package fr.lium
package api

import java.io.File
import scala.util.{Try, Success, Failure}
import scala.util.matching.Regex

import akka.actor.ActorSystem

case class AudioFileApi(
  actorSystem: ActorSystem) {

  def createAudioFile(tmpFile: File): Try[Int] = {
    Success(0)

  }
  def getNextFileId(dirs: List[File]): Option[Int] = {
    val regexp = """\d+""".r
    val maybeLastFile: Option[File] = dirs.filter(f => f.isDirectory && regexp.findFirstIn(f.getName).isDefined).sorted.lastOption

    maybeLastFile flatMap { f => Try(f.getName.toInt).toOption.map(_+1) }
  }

  def getNextFileId(dirs: Array[File]): Option[Int] = getNextFileId(dirs.toList)

  def getNextFileId(dir: File): Option[Int] = Option(dir.listFiles) flatMap getNextFileId

}
