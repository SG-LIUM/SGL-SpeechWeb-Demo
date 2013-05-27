package fr.lium
package api

import fr.lium.actor.DirCreationActor
import fr.lium.util.FileUtils

import java.io.File

import scala.util.matching.Regex
import scala.util.{ Try, Success, Failure }
import scala.concurrent.Future

import scala.language.postfixOps
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits._

import akka.actor.{ ActorSystem, Props, ActorRef }
import akka.pattern.{ ask, pipe }
import akka.util.Timeout

case class AudioFileApi(
    baseDirectory: File,
    actorSystem: ActorSystem) {

  def createAudioFile(tmpFile: File): Future[Try[(Int, File)]] = {

    //Create the next directory using an Actor
    //It will avoid race conditions
    val dirCreationActor: ActorRef = actorSystem.actorOf(Props(new DirCreationActor(baseDirectory)), name = "dirCreationActor")
    val dirId: Future[Try[Int]] = ask(dirCreationActor, "create")(5 seconds).mapTo[Try[Int]]

    dirId.map { tryD ⇒
      for {
        d <- tryD
        newFile <- FileUtils.moveFileToDir(tmpFile, new File(baseDirectory + File.separator + d + File.separator))
      } yield (d, newFile)
    }

  }
}
