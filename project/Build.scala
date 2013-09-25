import sbt._
import Keys._
import play.Project._
import java.net.URLClassLoader

object ApplicationBuild extends Build {

  val appName = "liumsg"
  val appVersion = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    // Add your project dependencies here,
    jdbc,
    anorm,
    "commons-io" % "commons-io" % "2.4",
    "com.typesafe.play" %% "play-slick" % "0.5.0.2-SNAPSHOT",
    "org.xerial" % "sqlite-jdbc" % "3.7.2")

  val main = play.Project(appName, appVersion, appDependencies).settings(
    registerTask("drop-create-schema","tasks.DropCreateSchema", "Drop and create basic SQL schema" ),
    registerTask("load-fixtures","tasks.LoadFixtures", "Insert sample data" ),
    // Add your own project settings here
    scalacOptions ++= Seq("-unchecked", "-deprecation", "-feature"),
    resolvers := Seq(
      "Local Maven Repository" at "file://" + Path.userHome.absolutePath + "/.m2/repository",
      "sonatype-snapshots" at "https://oss.sonatype.org/content/repositories/snapshots",
      "sonatype-releases" at "https://oss.sonatype.org/content/repositories/releases",
      "java-net" at "http://download.java.net/maven/2",
      "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/"))

  //http://kailuowang.blogspot.fr/2013/05/define-arbitrary-tasks-in-play-21.html
  def registerTask(name: String, taskClass: String, description: String) = {
    val sbtTask = (dependencyClasspath in Runtime) map { (deps) =>
      val depURLs = deps.map(_.data.toURI.toURL).toArray
      val classLoader = new URLClassLoader(depURLs, null)
      val task = classLoader.
                  loadClass(taskClass).
                  newInstance().
                  asInstanceOf[Runnable]
      task.run()
    }
    TaskKey[Unit](name, description) <<= sbtTask.dependsOn(compile in Compile)
  }
}
