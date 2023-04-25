document.addEventListener("DOMContentLoaded", async () => {
//  let cartId = sessionStorage.getItem("cartId");

    const cartCreation = await fetch("http://localhost:8080/api/carts", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    const responseJson = await cartCreation.json();
    console.log("soy responseJson", responseJson)
    cartId = responseJson.cartId;
    console.log("soy cartId", cartId);
    sessionStorage.setItem("cartId", cartId);
    //alert("Carrito creado");
  

  const buttons = document.querySelectorAll("button[id]");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const productId = button.id;
      const options = {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ cartId, productId }),
      };
      const response = await fetch(
        `http://localhost:8080/api/carts/${cartId.trim()}/products/${productId.trim()}`,
        options
      );
      if (response.ok) {
        alert("Producto agregado al carrito");
      } else {
        alert("Error al agregar producto al carrito");
      }
    });
  });
  let cartLink = document.getElementById("linkToCart");
  cartLink.setAttribute("href", `http://localhost:8080/api/carts/${cartId}`);
});

