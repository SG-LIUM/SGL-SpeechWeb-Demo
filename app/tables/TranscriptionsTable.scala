package fr.lium
package tables

import fr.lium.model._

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

  def findById(id: Int)(implicit session: scala.slick.session.Session): Try[DbTranscription] = {

    val query = for {
      t <- Transcriptions if t.id === id
      a <- AudioFiles if a.id === t.audioFileId
    } yield (t, a)

    val maybeTranscription: Option[DbTranscription] =
      query.firstOption map {
        case ((d, e, f, g), (a, b, c)) => new DbTranscription(
          new AudioFile(a, b, AudioFile.status(c)),
          DbTranscription.status(f))
      }

    maybeTranscription asTry badArg("Transcription not found.")
  }


  def findByAudioFile(audioFile: AudioFile)(implicit session: scala.slick.session.Session): Try[DbTranscription] = {
    val query = for {
      t <- Transcriptions if t.audioFileId === audioFile.id
    } yield (t.filename, t.status)

    val maybeTranscription = query.firstOption map {
      case (filename, status) => new DbTranscription(audioFile, DbTranscription.status(status), filename = Some(new File(filename)))
    }

    maybeTranscription asTry badArg("Transcription not found.")

  }

}

