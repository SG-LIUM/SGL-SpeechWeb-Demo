package fr.lium
package model

sealed trait Gender

case object Male extends Gender
case object Female extends Gender
case object UnknownGender extends Gender
