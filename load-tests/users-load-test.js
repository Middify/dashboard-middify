import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración de la prueba de carga
export const options = {
  // Aumentamos la carga progresivamente para probar capacidad
  stages: [
    { duration: '30s', target: 50 },  // Subir a 50 usuarios (carga moderada)
    { duration: '1m', target: 50 },   // Mantener 50 usuarios
    { duration: '10s', target: 0 },   
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
    http_req_duration: ['p(95)<2000'], // 95% de las peticiones deben ser < 2s
  },
};

const BASE_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev";
const TOKEN = __ENV.TOKEN || "COLOCA_TU_TOKEN_AQUI"; 

export default function () {
  if (TOKEN === "COLOCA_TU_TOKEN_AQUI") {
    console.error("❌ ERROR: No se ha configurado un token válido. Ejecuta con: k6 run -e TOKEN=tu_token_aqui load-tests/users-load-test.js");
    return;
  }

  const params = {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(`${BASE_URL}/users/list?page=1&pageSize=20`, params);

  // LOG DE DEBUG: Si falla, imprimimos la respuesta para saber QUÉ pasa
  if (res.status !== 200) {
    console.error(`Error ${res.status}: ${res.body}`);
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
