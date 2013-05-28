package fr.lium

import akka.actor.ActorSystem
import com.typesafe.config.Config
import play.api.{ Application, Play }
import java.io.File

import fr.lium.api.{AudioFileApi, TranscriptionApi}

final class Env(
    config: Config,
    actorSystem: ActorSystem) {

  lazy val audioFileApi = new AudioFileApi(
    baseDirectory = new File(config.getString("lium.baseDir")),
    actorSystem = actorSystem,
    audioFileBasename = config.getString("lium.audioFileBasename"))

  lazy val transcriptionApi = TranscriptionApi
}

object Env {

  lazy val current = new Env(
    config = appConfig,
    actorSystem = appSystem)

  private def appConfig: Config = withApp(_.configuration.underlying)

  private def appSystem = withApp { implicit app ⇒
    play.api.libs.concurrent.Akka.system
  }
  private def withApp[A](op: Application ⇒ A): A =
    Play.maybeApplication.map(op).get
}
