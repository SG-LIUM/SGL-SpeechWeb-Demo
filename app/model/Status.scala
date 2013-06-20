package fr.lium
package model

sealed trait Status {
  val value: String

  override def toString = value
}

case object Uploaded extends Status {
  val value = "uploaded"
}
case object Diarization extends Status {
  val value = "diarization"
}

case object Transcribing extends Status {
  val value = "transcribing"
}

case object Finished extends Status {
  val value =  "finished"
}

case object InProgress extends Status {
  val value = "inprogress"
}
