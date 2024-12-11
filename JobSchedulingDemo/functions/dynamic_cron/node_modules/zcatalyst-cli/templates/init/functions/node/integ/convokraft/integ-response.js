export default class IntegResponse {
  response;
  constructor(res) {
    this.response = res;
  }
  buildResponse() {
    return {
      status: 200,
      contentType: 'application/json',
      responseBody: JSON.stringify(this.response)
    };
  }
}
