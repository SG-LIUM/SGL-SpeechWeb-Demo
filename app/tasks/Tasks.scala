package tasks

import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

import fr.lium.tables.AudioFiles
import fr.lium.model.Uploaded
import fr.lium.model.Conversions._

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
      statements()
    }
  }

  def statements() = {
      Try((AudioFiles.ddl).drop)
      (AudioFiles.ddl).create
  }
}

class LoadFixtures extends Runnable with Env {

  def run {
    env.database.withSession {
      AudioFiles.autoInc.insert(("audio.wav", Uploaded))
    }
  }
}
