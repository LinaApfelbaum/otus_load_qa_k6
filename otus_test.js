import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    yandex: {
      exec: 'yandex',
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 60 },
        { duration: '10m', target: 60 },
        { duration: '5m', target: 72 },
        { duration: '10m', target: 72 },
      ],
      gracefulRampDown: '0s',
    },
    ruCenter: {
     exec: 'ruCenter',
     executor: 'ramping-vus',
     startVUs: 0,
     stages: [
       { duration: '5m', target: 120 },
       { duration: '10m', target: 120 },
       { duration: '5m', target: 144 },
       { duration: '10m', target: 144 },
     ],
     gracefulRampDown: '0s',
   },
  },
};

const YANDEX_URL = 'http://ya.ru';

const RU_CENTER_URL = 'http://www.ru';

export function getYandex() {
  const res = http.get(YANDEX_URL);
  check(res, {
    'status code is 200': (res) => res.status === 200,
  })
}

export function getRuCenter() {
  const res = http.get(RU_CENTER_URL);
  check(res, {
    'status code is 200': (res) => res.status === 200,
  })
}

export function yandex() {
  group('getYandex', () => { getYandex(); });
}

export function ruCenter() {
  group('getRuCenter', () => { getRuCenter(); });
}
