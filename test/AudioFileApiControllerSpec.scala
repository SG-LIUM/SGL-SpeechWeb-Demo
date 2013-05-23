package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

class AudioFileApiControllerSpec extends Specification {

  "AudioFile controller" should {

    "send 405 on bad input" in {
      running(FakeApplication()) {
        //TODO
      }
    }

  }
}
