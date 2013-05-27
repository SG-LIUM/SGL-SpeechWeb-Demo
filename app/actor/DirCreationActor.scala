package fr.lium
package actor

import fr.lium.util.FileUtils

import scala.util.{ Try, Success, Failure }

import akka.actor.Actor
import akka.actor.Props
import akka.event.Logging

import java.io.File

class DirCreationActor(baseDir: File)
    extends Actor {

  val log = Logging(context.system, this)
  def receive = {

    case "create" ⇒ {
      log.info("received create")
      try {
        sender ! createDir
      } catch {
        case e: Exception ⇒
          sender ! akka.actor.Status.Failure(e)
          throw e
      }
    }
    case _ ⇒ log.info("received unknown message")
  }

  private def createDir: Try[Int] = {
    Try {
      val nextId = FileUtils.getNextFileId(baseDir).get
      new File(baseDir + File.separator + nextId).mkdir()
      nextId
    }
  }
}

