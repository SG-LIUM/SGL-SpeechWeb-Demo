package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._
import play.api.libs.Files

import java.io.File

import scala.util.Try

import fr.lium.api.AudioFileApi

class AudioFileApiSpec extends Specification
  with CreateSampleDirectories
  with SampleDirectories {

  "AudioFileApi " should {

    "should return the next available id" in {
      AudioFileApi.getNextFileId(dirs) should beSome(124)
    }

  }
}

trait SampleDirectories {

  lazy val dirs = List(
    new File("/tmp/012"),
    new File("/tmp/123"),
    new File("/tmp/zzz"),
    new File("/tmp/10"))

}

trait CreateSampleDirectories extends Before with SampleDirectories {
  def before = {
    dirs map (d => Try(d.delete))
    dirs map (d => Files.createDirectory(d))
  }
}

