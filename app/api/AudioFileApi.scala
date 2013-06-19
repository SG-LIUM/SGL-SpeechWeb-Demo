package fr.lium
package api

import fr.lium.util.FileUtils
import fr.lium.model.{AudioFile, Uploaded, Status}
import fr.lium.model.Conversions._
import fr.lium.tables.AudioFiles

import java.io.File

import scala.util.{ Try, Success, Failure }

import scala.slick.session.Database
import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

case class AudioFileApi(
    baseDirectory: File,
    audioFileBasename: String,
    database: Database) {

  def createAudioFile(tmpFile: File, newFileName: String): Try[AudioFile] = {

    val fileName = audioFileBasename + FileUtils.getFileExtension(newFileName).getOrElse("")


    database.withSession {
      for {
        audioFile <- Try(AudioFiles.autoInc.insert((fileName, Uploaded)))
        id <- audioFile.id asTry badArg("Fail to get autoinc id from DB")
        dir = new File(baseDirectory + File.separator + id).mkdir()
        moved <- FileUtils.moveFileToFile(tmpFile, new File(baseDirectory + File.separator + id + File.separator + fileName))
      } yield AudioFile(audioFile.id, fileName)

    }

  }
  def getAudioFileById(id: Int): Try[AudioFile] = {
    database.withSession {

      val dir = new File(baseDirectory + File.separator + id + File.separator)

      if (dir.exists && dir.isDirectory) {
        AudioFiles.findById(id)
      } else {
        Failure(new Exception("AudioFile directory doesn't exist"))
      }
    }

  }
}
