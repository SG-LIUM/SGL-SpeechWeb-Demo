package fr.lium
package util

import scala.util.Try

package object conversion {
  def parseIntOption(str: String): Option[Int] =
    Try(java.lang.Integer.parseInt(str)).toOption

  def parseFloatOption(str: String): Option[Float] =
    Try(java.lang.Float.parseFloat(str)).toOption
}
