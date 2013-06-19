package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._
import play.api.libs.Files

import java.io.File

import scala.util.Try
import scala.concurrent.{Await, Future}

import fr.lium.api.AudioFileApi
import fr.lium.util.FileUtils
import fr.lium.model.AudioFile

import akka.util.Timeout
import scala.concurrent.duration.DurationInt

import org.apache.commons.io.{FileUtils => ApacheFileUtils}

class AudioFileApiSpec extends Specification
  with CreateSampleDirectories
  with SampleDirectories {

  val env = Env.current
  implicit val timeout = Timeout(DurationInt(5) seconds)


  "AudioFileApi createAudioFile" should {

    "create a new dir and move the tmp file to it" in new WithApplication {

      env.database.withSession { env.dropCreateSchema.statements() }

      ApacheFileUtils.deleteDirectory(env.baseDir)
      ApacheFileUtils.forceMkdir(env.baseDir)

      val tmpFile = new File("/tmp/testaudio/toto")
      ApacheFileUtils.touch(tmpFile)
      val result: Try[AudioFile] = env.audioFileApi.createAudioFile(tmpFile, "toto.wav")

      result.get must beEqualTo(AudioFile(Some(1), env.basename + ".wav"))

      //Let's clean the mess
      ApacheFileUtils.deleteDirectory(env.baseDir)
    }

  }

  "AudioFileApi getAudioFileById" should {

    env.database.withSession { env.dropCreateSchema.statements() }

    "not return a non existing audiofile" in new WithApplication {
      env.audioFileApi.getAudioFileById(1).toOption must beNone

    }

    "return an already existing audiofile" in new WithApplication {
      ApacheFileUtils.deleteDirectory(env.baseDir)
      ApacheFileUtils.forceMkdir(env.baseDir)
      ApacheFileUtils.forceMkdir(new File(env.baseDir.getAbsolutePath() + File.separator + "1"))

      ApacheFileUtils.touch(new File("/tmp/testaudio/1/" + env.basename + ".wav"))

      //Load the fixtures to populate the DB
      env.database.withSession { env.loadFixtures.statements() }
      env.audioFileApi.getAudioFileById(1).pp.toOption must beSome
      //Let's clean the mess
      ApacheFileUtils.deleteDirectory(env.baseDir)
    }


  }

}

