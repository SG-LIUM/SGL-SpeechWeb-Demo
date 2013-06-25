package fr.lium
package api

import java.io.File

import fr.lium.model.{AudioFile, Transcription, Finished}
import fr.lium.tables.Transcriptions

import scala.util.Try
import scala.slick.session.Database
import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

case class TranscriptionApi(
  wordApi: WordApi.type,
  database: Database) {

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

  def getTranscription(file: AudioFile): Try[Transcription] = {

    //TODO
    //We should for sure do something here
    database.withSession {
        val dbTranscription = Transcriptions.findByAudioFile(file)

      dbTranscription.map { d =>
        Transcription(file, Finished, None, d.filename.map { f => wordApi.getWordsFromFile(f) })
      }
    }

  }

}
