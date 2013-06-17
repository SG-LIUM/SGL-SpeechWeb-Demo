package test

import scala.slick.driver.SQLiteDriver.simple._
import Database.threadLocalSession
import java.io.File

import play.api.test.FakeApplication

import fr.lium.api.AudioFileApi

final class TestEnv() {

  lazy val database: Database = Database.forURL(
    "jdbc:sqlite:liumtest.db",
    driver = "org.sqlite.JDBC")

  lazy val baseDir = new File("/tmp/testaudio/")
  lazy val basename = "audio"

  def audioFileApi()(implicit app: FakeApplication) = {
    new AudioFileApi(baseDir, play.api.libs.concurrent.Akka.system, basename, database)
  }

}

object Env {
  lazy val current = new TestEnv
}
