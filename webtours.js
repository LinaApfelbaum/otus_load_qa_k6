import http from 'k6/http';
import { check, group } from 'k6';

const BASE_URL = 'http://webtours.load-test.ru:1080';

export function getMain() {
  const res = http.get(BASE_URL + "/webtours");
  check(res, {
    'status code is 200': (res) => res.status === 200,
  })
}

export function getUserSession() {
  const res = http.get(BASE_URL + "/cgi-bin/nav.pl?in=home");
  check(res, {
    'status code is 200': (res) => res.status === 200,
  });
  const userSession = res.html().find('input[name="userSession"]').attr('value');
  return userSession
}

export function login(userSession) {
  const formData = {
    userSession: userSession,
    username: 'unique',
    password: 'unique'
  };
  const res = http.post(
    BASE_URL + "/cgi-bin/login.pl",
    formData);
  check(res, {
    'verify successful login': (r) =>
      r.body.includes('User password was correct')
  })
}

export function openFlightsPage() {
  const res = http.get(BASE_URL + "/cgi-bin/welcome.pl?page=search")
  check(res, {
    'status code is 200': (res) => res.status === 200,
  });
}

export function getCities() {
  const res = http.get(BASE_URL + "/cgi-bin/reservations.pl?page=welcome")
  check(res, {
    'status code is 200': (res) => res.status === 200,
  });
  let citiesSet = new Set();
  res.html().find('option').each(function(key, el) {
    citiesSet.add(el.getAttribute('value'));
  });
  let cities = Array.from(citiesSet);
  let departCity = cities[Math.floor(Math.random() * cities.length)];
  let arriveCity = cities[Math.floor(Math.random() * cities.length)];
  while (departCity === arriveCity) {
  arriveCity = cities[Math.floor(Math.random() * cities.length)];
  };
  return [departCity, arriveCity]
}

export function selectFlight(departCity, arriveCity) {
  const formData = {
    depart: departCity,
    arrive: arriveCity,
    departDate: "06/06/2023",
    numPassengers: "1",
    "findFlights.x": "46"
  }
  const res = http.post(BASE_URL + "/cgi-bin/reservations.pl", formData)
  check(res, {
    'verify successful flights query': (r) =>
      r.body.includes('Flight departing from')
  });
  const outboundFlight = res.html().find('input[name="outboundFlight"]').attr('value');
  return outboundFlight
}

export function selectTicket(outboundFlight) {
  const formData = {
    outboundFlight: outboundFlight,
    "reserveFlights.x": 34
  }
  const res = http.post(BASE_URL + "/cgi-bin/reservations.pl", formData)
  check(res, {
    'verify successful ticket selection': (r) =>
      r.body.includes('Flight Reservation')
  })
}

export function buyTicket(outboundFlight) {
  const formData = {
    outboundFlight: outboundFlight,
    firstName: "unique",
    lastName: "unique",
    "buyFlights.x": 69
  }
  const res = http.post(BASE_URL + "/cgi-bin/reservations.pl", formData)
  check(res, {
    'verify successful ticket purchase': (r) =>
      r.body.includes('Reservation Made!')
  })
}

export function visitHome(){
  const res = http.get(BASE_URL + "/cgi-bin/login.pl?intro=true");
    check(res, {
      'verify successful redirect to home': (r) =>
        r.body.includes("Don't forget to sign off")
    })
}

export default function () {
  let userSession;
  let departCity;
  let arriveCity;
  let outboundFlight;

  group('getMain', () => { getMain(); });
  group('getUserSession', () => { userSession = getUserSession(); });
  group('login', () => { login(userSession); });
  group('openFlightsPage', () => { openFlightsPage(); });
  group('getCities', () => {
    const cities = getCities();
    departCity = cities[0];
    arriveCity = cities[1];
  });
  group('selectFlight', () => { outboundFlight = selectFlight(departCity, arriveCity); });
  group('selectTicket', () => { selectTicket(outboundFlight); });
  group('buyTicket', () => { buyTicket(outboundFlight); });
  group('visitHome', () => { visitHome(outboundFlight); });
}
