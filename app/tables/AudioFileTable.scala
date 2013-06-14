package fr.lium
package tables

import scala.slick.driver.SQLiteDriver.simple._

object AudioFiles extends Table[(Int, String)]("audio_files") {
  def id = column[Int]("SUP_ID", O.PrimaryKey) // This is the primary key column
  def name = column[String]("SUP_NAME")
  // Every table needs a * projection with the same type as the table's type parameter
  def * = id ~ name
}
