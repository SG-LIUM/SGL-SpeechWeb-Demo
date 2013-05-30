package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

import fr.lium.api.WordApi
import fr.lium.model.Word

class WordApiSpec extends Specification {

  val wordApi = new WordApi
  val sampleLine = """BFMTV_BFMStory_2012-01-10_175800 1 2406.395 0.02 donc 1.00 M S S23"""

  "getWord" should {

    "return a Word" in {
      wordApi.getWordFromLine(sampleLine) must beSome
    }

  }
}

