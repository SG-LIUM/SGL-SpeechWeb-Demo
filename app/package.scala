package fr
import scala.util.{ Try, Success, Failure }
import scala.language.implicitConversions

package object lium {

  //https://github.com/ornicar/scalex/blob/master/src/main/scala/package.scala
  implicit final class PimpOption[A](oa: Option[A]) {

    def asTry(error: ⇒ Exception): Try[A] =
      oa.fold[Try[A]](Failure(error))(Success(_))

  }

  /**
  * K combinator implementation
  * Provides oneliner side effects
  * See http://hacking-scala.posterous.com/side-effecting-without-braces
  */
  implicit def ornicarAddKcombinator[A](any: A) = new {
    def kCombinator(sideEffect: A ⇒ Unit): A = {
      sideEffect(any)
      any
    }
    def ~(sideEffect: A ⇒ Unit): A = kCombinator(sideEffect)
    def pp: A = kCombinator(println)
  }

  def badArg(msg: String) = new IllegalArgumentException(msg)
}
