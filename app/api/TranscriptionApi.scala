package fr.lium
package api

import java.io.File

import fr.lium.model.{AudioFile, TranscriptionFinished, TranscriptionInProgress}

case class TranscriptionApi(wordApi: WordApi.type, sampleFile: Option[File] = None) {

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

    sampleFile map { f =>
      TranscriptionFinished(file, None, wordApi.getWordsFromFile(f))
    }
  }

}
