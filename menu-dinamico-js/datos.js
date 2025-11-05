// Archivo de datos en formato JavaScript (sin CORS, sin fetch)
const datosMenu = {
  "menu": [
    {
      "id": 1,
      "nombre": "Inicio",
      "enlace": "#inicio"
    },
    {
      "id": 2,
      "nombre": "Sobre Nosotros",
      "enlace": "#sobre-nosotros"
    },
    {
      "id": 3,
      "nombre": "Servicios",
      "enlace": "#servicios",
      "submenus": [
        { "id": 31, "nombre": "Diseño Web", "enlace": "#diseno-web" },
        { "id": 32, "nombre": "Desarrollo de Software", "enlace": "#desarrollo" },
        { "id": 33, "nombre": "Soporte Técnico", "enlace": "#soporte" }
      ]
    },
    {
      "id": 4,
      "nombre": "Contacto",
      "enlace": "#contacto"
    }
  ]
};
