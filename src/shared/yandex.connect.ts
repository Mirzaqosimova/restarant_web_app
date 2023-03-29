import { YANDEX_TOKEN, YANDEX_URL } from './const';

const ATTENDANCE_STUDENT = (geocode: string) => {
  const url = `?apikey=${YANDEX_TOKEN}&geocode=${geocode}&format=json&sco=latlong&kind=house&z=17`;
  return url;
};

export class YandexService {
  private static instance = new YandexService();

  public static getInstance() {
    return this.instance;
  }

  getAddress(long: number, lat: number) {
    const endpoint = YANDEX_URL + ATTENDANCE_STUDENT(lat + ',' + long);
    return this.baseFetch(endpoint);
  }

  private baseFetch(endpoint: string) {
    return fetch(endpoint)
      .then((res) => res.json())
      .catch(() => {
        throw new Error('Something went wrong');
      });
  }
}
