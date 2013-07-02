package fr.lium
package api

import fr.lium.util.FileUtils
import fr.lium.model.{AudioFile, Uploaded, Status}
import fr.lium.model.Conversions._
import fr.lium.tables.AudioFiles
import org.apache.commons.io.{FileUtils => ApacheFileUtils}

import java.io.File

import scala.util.{ Try, Success, Failure }

import scala.slick.session.Database
import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

case class AudioFileApi(
    baseDirectory: File,
    audioFileBasename: String,
    database: Database) {

  /** Take care of registering a new audiofile into the system
    *
    * @param sourceFile The source file to register into the system
    * @param newFileName Rename the source file using this extension
    * @param move If the sourceFile should be moved or only copied
    */
  def createAudioFile(sourceFile: File, fileExtension: Option[String], move: Boolean = true): Try[AudioFile] = {

    val fileName = audioFileBasename + fileExtension.getOrElse("")

    def registerFile(sourceFile: File, toFile: File, move: Boolean): Try[File] = {
      if(move) {
        FileUtils.moveFileToFile(sourceFile, toFile)
      } else {
        Try{
          ApacheFileUtils.copyFile(sourceFile, toFile)
          toFile
        }
      }
    }

    database.withSession {
      for {
        audioFile <- Try(AudioFiles.autoInc.insert((fileName, Uploaded)))
        id <- audioFile.id asTry badArg("Fail to get autoinc id from DB")
        dir = new File(baseDirectory + File.separator + id).mkdir();
        moved <- registerFile(sourceFile, new File(baseDirectory + File.separator + id + File.separator + fileName), move)
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
