import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

  val appName = "liumsg"
  val appVersion = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    // Add your project dependencies here,
    jdbc,
    anorm,
    "com.wordnik" %% "swagger-play2-utils" % "1.2.4",
    "commons-io" % "commons-io" % "2.4",
    "com.typesafe.slick" %% "slick" % "1.0.1",
    "org.xerial" % "sqlite-jdbc" % "3.7.2")

  val main = play.Project(appName, appVersion, appDependencies).settings(
    // Add your own project settings here
    scalacOptions ++= Seq("-unchecked", "-deprecation", "-feature"),
    resolvers := Seq(
      "Local Maven Repository" at "file://" + Path.userHome.absolutePath + "/.m2/repository",
      "sonatype-snapshots" at "https://oss.sonatype.org/content/repositories/snapshots",
      "sonatype-releases" at "https://oss.sonatype.org/content/repositories/releases",
      "java-net" at "http://download.java.net/maven/2",
      "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/"))

  val bar = Project(id = "cli",
    base = file("cli")).dependsOn(main)
}
