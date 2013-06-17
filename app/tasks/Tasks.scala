package tasks

import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

import fr.lium.tables.AudioFiles

import com.typesafe.config._
import scala.util.Try

trait Env {

  System.setProperty("config.file", "conf/application.conf")

  val conf = ConfigFactory.load()
  val env = new TaskEnv(conf)

}

class DropCreateSchema extends Runnable with Env {

  def run {
    env.database.withSession {
      Try((AudioFiles.ddl).drop)
      (AudioFiles.ddl).create
    }
  }
}

class LoadFixtures extends Runnable with Env {

  def run {
    env.database.withSession {
      AudioFiles.autoInc.insert("audio.wav")
    }
  }
}
