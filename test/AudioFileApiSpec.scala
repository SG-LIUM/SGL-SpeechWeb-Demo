package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._
import play.api.libs.Files

import java.io.File

import scala.util.Try

import fr.lium.api.AudioFileApi
import fr.lium.util.FileUtils

class AudioFileApiSpec extends Specification
  with CreateSampleDirectories
  with SampleDirectories {


  "AudioFileApi " should {

    "should return the next available id" in {
      //TODO
    }

  }
}

