class ReturnApi {
  #defaultMessage = "Có lỗi xảy ra, vui lòng thử lại sau!";
  constructor() {
    this.success = false;
    this.message = this.#defaultMessage;
    this.data = null;
  }
  toObject() {
    if (this.success == true && this.message == this.#defaultMessage)
      return {
        success: true,
        data: this.data,
      };
    else if (this.success == true && this.message != this.#defaultMessage)
      return {
        success: true,
        message: this.message,
        data: this.data,
      };
    else
      return {
        success: false,
        message: this.message,
        data: this.data,
      };
  }
}

module.exports = ReturnApi;
