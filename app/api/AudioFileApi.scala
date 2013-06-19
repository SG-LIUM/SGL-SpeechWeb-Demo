package fr.lium
package api

import fr.lium.util.FileUtils
import fr.lium.model.{AudioFile, Uploaded, Status}
import fr.lium.model.Conversions._

import java.io.File

import scala.util.matching.Regex
import scala.util.{ Try, Success, Failure }

import scala.language.postfixOps

import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits._
import scala.concurrent.Future
import scala.slick.session.Database

import scala.slick.session.Database
import fr.lium.tables.AudioFiles
import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

import akka.actor.{ ActorSystem, Props, ActorRef }
import akka.pattern.{ ask, pipe }
import akka.util.Timeout

case class AudioFileApi(
    baseDirectory: File,
    actorSystem: ActorSystem,
    audioFileBasename: String,
    database: Database) {

  def createAudioFile(tmpFile: File, newFileName: String): Try[AudioFile] = {

    val fileName = audioFileBasename + FileUtils.getFileExtension(newFileName).getOrElse("")


    database.withSession {
      for {
        audioFile <- Try(AudioFiles.autoInc.insert((fileName, Uploaded)))
        id <- Try(audioFile.id.get)
        dir = new File(baseDirectory + File.separator + id).mkdir()
        moved <- FileUtils.moveFileToFile(tmpFile, new File(baseDirectory + File.separator + id + File.separator + fileName))
      } yield AudioFile(audioFile.id, fileName)

    }

  }

  def getAudioFileById(id: Int): Option[AudioFile] = {

    val dir = new File(baseDirectory + File.separator + id + File.separator)

    if (dir.exists && dir.isDirectory) {
      val maybeFile: Option[File] = dir.listFiles.toList.filter(f ⇒ f.getName startsWith audioFileBasename).headOption
      maybeFile map { f =>
        AudioFile(Some(id), f.getName())
      }
    } else {
      None
    }

  }
}
