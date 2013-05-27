package fr.lium
package util

import scala.util.{ Try, Success, Failure }

import java.io.File
import java.nio.file.Files

object FileUtils {

  def getNextFileId(dirs: List[File]): Option[Int] = {
    val regexp = """\d+""".r
    val maybeLastFile: Option[File] = dirs.filter(f ⇒ f.isDirectory && regexp.findFirstIn(f.getName).isDefined).sorted.lastOption

    maybeLastFile flatMap { f ⇒ Try(f.getName.toInt).toOption.map(_ + 1) }
  }

  def getNextFileId(dirs: Array[File]): Option[Int] = getNextFileId(dirs.toList)

  def getNextFileId(dir: File): Option[Int] = Option(dir.listFiles) flatMap getNextFileId

  def moveFileToDir(fromFile: File, toDir: File): Try[File] = {
    val newFileName = toDir.getAbsolutePath + File.separator + fromFile.getName
    val result = Try(Files.move(fromFile.toPath, new File(newFileName).toPath))

    result match {
      case Success(v) ⇒ Success(new File(newFileName))
      case Failure(e) ⇒ Failure(e)
    }
  }

  def moveFileToFile(fromFile: File, toFile: File): Try[File] = {
    val newFileName = toFile.getAbsolutePath
    val result = Try(Files.move(fromFile.toPath, new File(newFileName).toPath))

    result match {
      case Success(v) ⇒ Success(new File(newFileName))
      case Failure(e) ⇒ Failure(e)
    }
  }

  def getFileExtension(fileName: String): Option[String] =
    if (fileName.contains('.'))
      Some(fileName.substring(fileName.lastIndexOf(".")))
    else None

}
