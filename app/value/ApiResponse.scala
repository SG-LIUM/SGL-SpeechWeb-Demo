package value

object ApiResponse {
  val ERROR = 1
  val WARNING = 2
  val INFO = 3
  val OK = 4
  val TOO_BUSY = 5
}

class ApiResponse(code: Int, message: String) {
  def getType(): String = code match {
    case ApiResponse.ERROR => "error"
    case ApiResponse.WARNING => "warning"
    case ApiResponse.INFO => "info"
    case ApiResponse.OK => "ok"
    case ApiResponse.TOO_BUSY => "too busy"
    case _ => "unknown"
  }
}
