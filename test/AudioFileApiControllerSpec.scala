package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

/**
 * Add your spec here.
 * You can mock out a whole application including requests, plugins etc.
 * For more information, consult the wiki.
 */
class AudioFileApiControllerSpec extends Specification {

  "AudioFile controller" should {

    "send 405 on bad input" in {
      running(FakeApplication()) {
        val result = controllers.AudioFileApiController.addAudioFile()(FakeRequest())
        status(result) must equalTo(405)
      }
    }

  }
}
