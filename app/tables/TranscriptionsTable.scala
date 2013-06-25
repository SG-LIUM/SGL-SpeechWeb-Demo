package fr.lium
package tables

import fr.lium.model.{ AudioFile, InProgress, Finished, TranscriptionInProgress }

import scala.util.{ Try, Success, Failure }

import java.io.File
import scala.slick.driver.SQLiteDriver.simple._

object Transcriptions extends Table[(Option[Int], String, String, Int)]("transcriptions") {
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc) // This is the primary key column

  val autoInc = filename ~ status ~ audioFileId returning id

  def status = column[String]("STATUS")

  def filename = column[String]("FILENAME")

  def audioFileId = column[Int]("AUDIO_FILE_ID")


  // Every table needs a * projection with the same type as the table's type parameter
  def * = id.? ~ filename ~ status ~ audioFileId

  // A reified foreign key relation that can be navigated to create a join
  def audioFile = foreignKey("AUDIO_FILE_PK", audioFileId, AudioFiles)(_.id)

  def findById(id: Int)(implicit session: scala.slick.session.Session): Try[TranscriptionInProgress] = {

    val query = for {
      t <- Transcriptions if t.id === id
      a <- AudioFiles if a.id === t.audioFileId
    } yield (t, a)

    val maybeTranscription: Option[TranscriptionInProgress] =
      query.firstOption map {
        case (_, (a, b, c)) => new TranscriptionInProgress(
          new AudioFile(a, b, c match {
            case InProgress.value => InProgress
            case Finished.value   => Finished
            case _                => Unknown
          })
        )
      }

    maybeTranscription asTry badArg("Transcription not found.")
  }
}

