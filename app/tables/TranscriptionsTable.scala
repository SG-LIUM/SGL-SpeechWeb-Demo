package fr.lium
package tables

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
}

