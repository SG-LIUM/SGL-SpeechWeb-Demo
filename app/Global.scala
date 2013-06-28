import play.api._
import java.util.Locale

object Global extends GlobalSettings {
  override def onStart(app: Application) {
    Logger.info("Force locale to en_US")
    Locale.setDefault(new Locale ("en", "US"))
  }
}
