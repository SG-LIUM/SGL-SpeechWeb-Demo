package fr.lium
package tables

import fr.lium.model._

import scala.util.{ Try, Success, Failure }

import java.io.File
import scala.slick.driver.SQLiteDriver.simple._

object Transcriptions extends Table[(Option[Int], String, Option[String], String, Int)]("transcriptions") {
  def id = column[Int]("ID", O.PrimaryKey, O.AutoInc) // This is the primary key column

  val autoInc = filename ~ system ~ status ~ audioFileId returning id

  def status = column[String]("STATUS")

  def filename = column[String]("FILENAME")

  def system = column[Option[String]]("SYSTEM", O.Nullable)

  def audioFileId = column[Int]("AUDIO_FILE_ID")


  // Every table needs a * projection with the same type as the table's type parameter
  def * = id.? ~ filename ~ system ~ status ~ audioFileId

  // A reified foreign key relation that can be navigated to create a join
  def audioFile = foreignKey("AUDIO_FILE_PK", audioFileId, AudioFiles)(_.id)

  def findById(id: Int)(implicit session: scala.slick.session.Session): Try[DbTranscription] = {

    val query = for {
      t <- Transcriptions if t.id === id
      a <- AudioFiles if a.id === t.audioFileId
    } yield (t, a)

    val maybeTranscription: Option[DbTranscription] =
      query.firstOption map {
        case ((id, filename, system, status, audioFileId), (aId, aName, aStatus)) => new DbTranscription(
          new AudioFile(aId, aName, AudioFile.status(aStatus)),
          system,
          DbTranscription.status(status))
      }

    maybeTranscription asTry badArg("Transcription not found.")
  }


  def findByAudioFile(audioFile: AudioFile)(implicit session: scala.slick.session.Session): List[DbTranscription] = {

    val query = for {
      t <- Transcriptions if t.audioFileId === audioFile.id
    } yield (t.filename, t.system, t.status)

    query.list map {
      case (filename, system, status) => new DbTranscription(audioFile, system, DbTranscription.status(status), filename = Some(new File(filename)))
    }

  }

}

