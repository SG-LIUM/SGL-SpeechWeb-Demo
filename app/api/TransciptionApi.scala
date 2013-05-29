package fr.lium
package api

import fr.lium.model.{AudioFile, TranscriptionFinished, TranscriptionInProgress}

case object TranscriptionApi {

  def startTranscription(file: AudioFile): TranscriptionInProgress = {

    //TODO
    //We should for sure do something here, like starting the transcription ;)

    new TranscriptionInProgress(file)
  }

  def getTranscriptionProgress(file: AudioFile): TranscriptionInProgress = {

    //TODO
    //We should for sure do something here

    new TranscriptionInProgress(file, 20)
  }

  def getTranscription(file: AudioFile): Option[TranscriptionFinished] = {

    //TODO
    //We should for sure do something here

    None
  }

}
