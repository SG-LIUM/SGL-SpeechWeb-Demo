package tasks

import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

import fr.lium.tables.AudioFiles
import fr.lium.Env

import com.typesafe.config._
import scala.util.Try

class DropCreateSchema extends Runnable {

  System.setProperty("config.file", "conf/application.conf")

  val conf = ConfigFactory.load()
  val env = new TaskEnv(conf)

  def run {
    env.database.withSession {
      Try((AudioFiles.ddl).drop)
      (AudioFiles.ddl).create
    }
  }
}
