package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

import fr.lium.api.WordApi
import fr.lium.model.{Male, Speaker, Word}

class WordApiSpec extends Specification {

  val wordApi = new WordApi

  val sampleLine = """BFMTV_BFMStory_2012-01-10_175800 1 2406.395 0.02 donc 1.00 M S S23"""
  val sampleLine2 = """BFMTV_BFMStory_2012-01-10_175800 1 2406.56 0.02 le 1.00 M S S23"""
  val sampleLineNa = """BFMTV_BFMStory_2012-01-10_175800 1 2406.88 0.02 gouvernement 1.00 M S S23"""

  val sampleLines = """BFMTV_BFMStory_2012-01-10_175800 1 2407.27 0.02 est 0.998 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2407.43 0.02 un 1.00 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2407.725 0.02 gouvernement 1.00 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2408.33 0.02 responsable 1.00 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2408.74 0.02 et 0.997 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2408.98 0.02 ministre 0.999 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2409.19 0.02 de 1.00 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2409.24 0.02 l' 1.00 M S S23"""

  "getWord" should {

    "return a Word" in {
      wordApi.getWordFromLine(sampleLine) must beSome(Word("BFMTV_BFMStory_2012-01-10_175800", 2406.395f, 0.02f, "donc", 1.00f,
        Some(Speaker("S23", "S", Male))))
    }

  }
}

