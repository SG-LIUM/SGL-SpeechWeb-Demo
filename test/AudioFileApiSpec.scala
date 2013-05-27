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
import org.apache.commons.io.{FileUtils => ApacheFileUtils}

class AudioFileApiSpec extends Specification
  with CreateSampleDirectories
  with SampleDirectories {


  "AudioFileApi createAudioFile" should {

    "create a new dir and move the tmp file to it" in new WithApplication {

      implicit val timeout = Timeout(DurationInt(5) seconds)

      val baseDir = new File("/tmp/testaudio/")
      ApacheFileUtils.deleteDirectory(baseDir)
      ApacheFileUtils.forceMkdir(baseDir)
      val api = new AudioFileApi(baseDir, play.api.libs.concurrent.Akka.system)

      val tmpFile = new File("/tmp/testaudio/toto")
      ApacheFileUtils.touch(tmpFile)
      val future: Future[Try[(Int, File)]] = api.createAudioFile(tmpFile, "toto.wav")
      val result = Await.result(future, timeout.duration).asInstanceOf[Try[(Int, File)]]

      result.get must beEqualTo((1, new File("/tmp/testaudio/1/audio.wav")))

      //Let's clean the mess
      ApacheFileUtils.deleteDirectory(baseDir)
    }

  }
}

