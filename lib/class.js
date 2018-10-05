import got from 'got'

export class HttpClient {
  constructor ({
    baseUrl
  }) {
    this.got = got.extend({ baseUrl })
  }

  get (url) { return this.got.get(url) }
}
