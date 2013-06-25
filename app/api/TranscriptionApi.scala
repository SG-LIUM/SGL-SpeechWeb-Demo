package fr.lium
package api

import java.io.File

import fr.lium.model.{AudioFile, Transcription}

case class TranscriptionApi(wordApi: WordApi.type, sampleFile: Option[File] = None) {

  def startTranscription(file: AudioFile): Transcription = {

    //TODO
    //We should for sure do something here, like starting the transcription ;)

    new Transcription(file)
  }

  def getTranscriptionProgress(file: AudioFile): Transcription = {

    //TODO
    //We should for sure do something here

    new Transcription(file)
  }

  def getTranscription(file: AudioFile): Option[Transcription] = {

    //TODO
    //We should for sure do something here

    sampleFile map { f =>
      Transcription(file = file, transcription = (Some(wordApi.getWordsFromFile(f))))
    }
  }

}
