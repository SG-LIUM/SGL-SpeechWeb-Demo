package tasks

import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

import fr.lium.tables.{AudioFiles, Transcriptions}
import fr.lium.model.{Finished, InProgress, Uploaded}
import fr.lium.model.Conversions._
import fr.lium.api.AudioFileApi
import fr.lium.util.FileUtils

import com.typesafe.config._
import scala.util.Try

import java.io.File

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
      statements(env.database)
    }
  }

  def statements(database: Database) = {
      val audioFile = AudioFiles.autoInc.insert(("audio.wav", Uploaded))
      audioFile.id map { id => Transcriptions.autoInc.insert((config.getString("lium.sampleFile"), InProgress.toString, id)) }

      //Insert some sample data for the ASH combination project
      val sampleAudioFile = new File("data/ASH/audio/BFMTV_BFMStory_2011-03-17_175900.wav")

      //If we have some sample data to play with, let's register it using the system API
      val id: Option[Int] = if (sampleAudioFile.exists) {

        val api = new AudioFileApi(new File(config.getString("lium.baseDir")), config.getString("lium.audioFileBasename"), database)

        val audioFileAsh = api.createAudioFile(sampleAudioFile, FileUtils.getFileExtension(sampleAudioFile))
        audioFileAsh.toOption.flatMap { _.id }
      } else {

        val audioFileAsh = AudioFiles.autoInc.insert(("BFMTV_BFMStory_2011-03-17_175900.wav", Uploaded))
        audioFileAsh.id
      }

      id map { id =>
        Transcriptions.autoInc.insert(("data/ASH/combination/BFMTV_BFMStory_2011:03:17_175900.ctm", Finished.toString, id))
        Transcriptions.autoInc.insert(("data/LIA/combination/BFMTV_BFMStory_2011:03:17_175900.ctm", Finished.toString, id))
        Transcriptions.autoInc.insert(("data/RASR/combination/BFMTV_BFMStory_2011:03:17_175900.ctm", Finished.toString, id))
        Transcriptions.autoInc.insert(("data/SPH/combination/BFMTV_BFMStory_2011:03:17_175900.ctm", Finished.toString, id))
      }
  }
}
