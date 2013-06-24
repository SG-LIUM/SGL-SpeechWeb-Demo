package tasks

import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

import fr.lium.tables.{AudioFiles, Transcriptions}
import fr.lium.model.{InProgress, Uploaded}
import fr.lium.model.Conversions._

import com.typesafe.config._
import scala.util.Try

trait Env {


  val config = ConfigFactory.load()
  val env = new TaskEnv(config)
}

class DropCreateSchema extends Runnable with Env {

  def run {
    System.setProperty("config.file", "conf/application.conf")
    env.database.withSession {
      statements()
    }
  }

  def statements() = {
      Try((AudioFiles.ddl).drop)
      Try((Transcriptions.ddl).drop)
      (AudioFiles.ddl).create
      (Transcriptions.ddl).create
  }
}

class LoadFixtures extends Runnable with Env {

  def run {
    System.setProperty("config.file", "conf/application.conf")
    env.database.withSession {
      statements()
    }
  }

  def statements() = {
      val audioFile = AudioFiles.autoInc.insert(("audio.wav", Uploaded))
      audioFile.id map { id => Transcriptions.autoInc.insert((config.getString("lium.sampleFile"), InProgress.toString, id)) }
  }
}
