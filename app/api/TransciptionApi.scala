package fr.lium
package api

import fr.lium.model.{AudioFile, TranscriptionInProgress}

case object TranscriptionApi {

  def startTranscription(file: AudioFile): TranscriptionInProgress = {

    //TODO
    //We should for sure do something here, like starting the transcription ;)

    new TranscriptionInProgress(file)
  }

}
