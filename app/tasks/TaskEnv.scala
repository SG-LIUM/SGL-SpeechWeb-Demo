package tasks
import com.typesafe.config.Config
import scala.slick.session.Database

final class TaskEnv(config: Config) {

  lazy val databaseName = config.getString("lium.databaseName")

  lazy val database: Database = Database.forURL(
    config.getString("lium.databaseUrl") format databaseName,
    driver = config.getString("lium.databaseDriver"))

}
