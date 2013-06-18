package fr.lium
package tables

import fr.lium.model.{AudioFile, Diarization, Transcribing, Uploaded}

import java.io.File
import scala.slick.driver.SQLiteDriver.simple._

object AudioFiles extends Table[(Option[Int], String, String)]("audio_files") {
  def id = column[Int]("SUP_ID", O.PrimaryKey, O.AutoInc) // This is the primary key column

  val autoInc = name ~ status returning id into { case ((name, status), id) => AudioFile(Some(id), name, status match {
    case "uploaded" => Uploaded
    case "diarization" => Diarization
    case "transribing" => Transcribing
  }) }

  def name = column[String]("NAME")
  def status = column[String]("STATUS")
  // Every table needs a * projection with the same type as the table's type parameter
  def * = id.? ~ name ~ status
}
