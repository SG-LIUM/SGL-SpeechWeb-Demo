package fr.lium
package tables

import scala.util.{ Try, Success, Failure }

import java.io.File
import scala.slick.driver.SQLiteDriver.simple._

object Transcriptions extends Table[(Option[Int], String)]("transcriptions") {
  def id = column[Int]("SUP_ID", O.PrimaryKey, O.AutoInc) // This is the primary key column

  val autoInc = filename returning id

  def filename = column[String]("FILENAME")
  // Every table needs a * projection with the same type as the table's type parameter
  def * = id.? ~ filename

}

