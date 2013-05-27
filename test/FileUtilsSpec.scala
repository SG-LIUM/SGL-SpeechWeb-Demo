package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._
import play.api.libs.Files

import java.io.File

import scala.util.Try

import fr.lium.api.AudioFileApi
import fr.lium.util.FileUtils

import org.apache.commons.io.{FileUtils => ApacheFileUtils}

class FileUtilsSpec extends Specification
  with CreateSampleDirectories
  with SampleDirectories {


  "FileUtils " should {

    "return the next available id" in {
      FileUtils.getNextFileId(dirs) mustEqual 124
    }

    "return 1 when there is no dir" in {
      FileUtils.getNextFileId(List()) mustEqual 1
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
    dirs map (d => Try(ApacheFileUtils.deleteDirectory(d)))
    dirs map (d => Try(Files.createDirectory(d)))
  }
}


