package fr.lium
package api

import fr.lium.actor.DirCreationActor
import fr.lium.util.FileUtils
import fr.lium.model.AudioFile

import java.io.File

import scala.util.matching.Regex
import scala.util.{ Try, Success, Failure }

import scala.language.postfixOps

import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits._
import scala.concurrent.Future
import scala.slick.session.Database

import scala.slick.session.Database
import fr.lium.tables.AudioFiles
import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession

import akka.actor.{ ActorSystem, Props, ActorRef }
import akka.pattern.{ ask, pipe }
import akka.util.Timeout

case class AudioFileApi(
    baseDirectory: File,
    actorSystem: ActorSystem,
    audioFileBasename: String,
    database: Database) {

  def createAudioFile(tmpFile: File, newFileName: String): Future[Try[AudioFile]] = {

    database.withSession {
      //(AudioFiles.ddl).create
      //AudioFiles.insert(101, "test")
    }

    //Create the next directory using an Actor
    //It will avoid race conditions
    val dirCreationActor: ActorRef = actorSystem.actorOf(Props(new DirCreationActor(baseDirectory)), name = "dirCreationActor")
    val dirId: Future[Try[Int]] = ask(dirCreationActor, "create")(5 seconds).mapTo[Try[Int]]

    dirId.map { tryD ⇒
      for {
        d <- tryD
        newFile <- FileUtils.moveFileToFile(tmpFile, new File(baseDirectory + File.separator + d + File.separator + audioFileBasename +
          FileUtils.getFileExtension(newFileName).getOrElse("")))
      } yield AudioFile(Some(d), newFile)
    }

  }

  def getAudioFileById(id: Int): Option[AudioFile] = {

    val dir = new File(baseDirectory + File.separator + id + File.separator)

    if (dir.exists && dir.isDirectory) {
      val maybeFile: Option[File] = dir.listFiles.toList.filter(f ⇒ f.getName startsWith audioFileBasename).headOption
      maybeFile map { f =>
        AudioFile(Some(id), f)
      }
    } else {
      None
    }

  }
}
