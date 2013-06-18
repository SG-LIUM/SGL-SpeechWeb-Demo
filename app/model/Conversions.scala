package fr.lium
package model

import scala.language.implicitConversions

object Conversions {
  implicit def status2string(d: Status): String = d.toString
}
