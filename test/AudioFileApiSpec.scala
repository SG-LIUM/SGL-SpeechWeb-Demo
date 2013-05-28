package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._
import play.api.libs.Files

import java.io.File

import scala.util.Try
import scala.concurrent.{Await, Future}
import scala.concurrent.duration.DurationInt

import akka.util.Timeout

import fr.lium.api.AudioFileApi
import fr.lium.util.FileUtils
import fr.lium.model.AudioFile

import org.apache.commons.io.{FileUtils => ApacheFileUtils}

class AudioFileApiSpec extends Specification
  with CreateSampleDirectories
  with SampleDirectories {

  val baseDir = new File("/tmp/testaudio/")
  val basename = "audio"

  implicit val timeout = Timeout(DurationInt(5) seconds)

  "AudioFileApi createAudioFile" should {

    "create a new dir and move the tmp file to it" in new WithApplication {

      ApacheFileUtils.deleteDirectory(baseDir)
      ApacheFileUtils.forceMkdir(baseDir)
      val api = new AudioFileApi(baseDir, play.api.libs.concurrent.Akka.system, basename)

      val tmpFile = new File("/tmp/testaudio/toto")
      ApacheFileUtils.touch(tmpFile)
      val future: Future[Try[AudioFile]] = api.createAudioFile(tmpFile, "toto.wav")
      val result = Await.result(future, timeout.duration).asInstanceOf[Try[AudioFile]]

      result.get must beEqualTo(AudioFile(1, new File("/tmp/testaudio/1/" + basename + ".wav")))

      //Let's clean the mess
      ApacheFileUtils.deleteDirectory(baseDir)
    }

  }

  "AudioFileApi getAudioFileById" should {

    "return an already existing audiofile" in new WithApplication {

      ApacheFileUtils.deleteDirectory(baseDir)
      ApacheFileUtils.forceMkdir(baseDir)
      ApacheFileUtils.forceMkdir(new File(baseDir.getAbsolutePath() + File.separator + "1"))

      val api = new AudioFileApi(baseDir, play.api.libs.concurrent.Akka.system, basename)
      ApacheFileUtils.touch(new File("/tmp/testaudio/1/" + basename + ".wav"))

      api.getAudioFileById(1) must beSome

      //Let's clean the mess
      ApacheFileUtils.deleteDirectory(baseDir)
    }

  }

}

