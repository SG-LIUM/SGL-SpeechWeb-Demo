package tasks

import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

import fr.lium.tables.AudioFiles
import fr.lium.Env

import com.typesafe.config._

class CreateSchema extends Runnable {

  val conf = ConfigFactory.load()

  def run {
    println(conf.root.render())
  }
}
