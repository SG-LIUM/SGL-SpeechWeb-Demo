package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

import fr.lium.api.WordApi
import fr.lium.model.{Male, Speaker, Word}

class WordApiSpec extends Specification {

  val wordApi = WordApi

  val sampleLine = """BFMTV_BFMStory_2012-01-10_175800 1 2406.395 0.02 donc 1.00 M S S23"""
  val sampleLineNa = """BFMTV_BFMStory_2012-01-10_175800 1 2406.395 0.02 donc 1.00 N/A N/A N/A"""
  val badSampleLine = """BFMTV_BFMStory_2012-01-10_175800 2406.395 0.02 donc 1.00 M S S23"""

  val sampleLines = """BFMTV_BFMStory_2012-01-10_175800 1 2407.27 0.02 est 0.998 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2407.43 0.02 un 1.00 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2407.725 0.02 gouvernement 1.00 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2408.33 0.02 responsable 1.00 M S S23"""

  val badSampleLines = """BFMTV_BFMStory_2012-01-10_175800 1 2407.27 0.02 est 0.998 M S S23
BFMTV_BFMStory_2012-01-10_175800 2407.43 0.02 un 1.00 M S S23
BFMTV_BFMStory_2012-01-10_175800 1 2407.725 0.02 gouvernement 1.00 N/A N/A N/A
BFMTV_BFMStory_2012-01-10_175800 1 2408.33 0.02 responsable 1.00 M S S23"""

  "getWord" should {

    "return a Word on proper input" in {
      wordApi.getWordFromLine(sampleLine) must beSome(Word("BFMTV_BFMStory_2012-01-10_175800", 2406.395f, 0.02f, "donc", 1.00f,
        Some(Speaker("S23", "S", Male))))
    }

    "return a Word without a Speaker on N/A values" in {
      wordApi.getWordFromLine(sampleLineNa) must beSome(Word("BFMTV_BFMStory_2012-01-10_175800", 2406.395f, 0.02f, "donc", 1.00f,
        None))
    }

    "return None on missing field" in {
      wordApi.getWordFromLine(badSampleLine) must beNone
    }

  }

  "getWordsFromLines" should {
    "return a List of Word on proper input" in {
      wordApi.getWordsFromLines(sampleLines) must have size(4)
    }

    "return a List of Word on bad input" in {
      wordApi.getWordsFromLines(badSampleLines) must have size(3)
    }

  }
}

