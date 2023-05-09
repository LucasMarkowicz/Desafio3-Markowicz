const button = document.getElementById("ticket-send");
let cartId = sessionStorage.getItem("cartId");

button.addEventListener("click", () => {
  fetch(`http://localhost:8080/api/carts/${cartId}/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({}) // Puedes agregar datos en el cuerpo de la solicitud POST si es necesario
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
});
  