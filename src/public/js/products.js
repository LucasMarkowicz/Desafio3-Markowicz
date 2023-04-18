document.addEventListener("DOMContentLoaded", async () => {
  const cartCreation = await fetch("http://localhost:8080/api/carts", {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });

  const responseJson = await cartCreation.json();
  const cartId = await responseJson.cart;

  console.log("SOY CARTID", cartId);
  alert("Carrito creado");

  const options = {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  };
  fetch("http://localhost:8080/api/products", options)
    .then((res) => res.json())
    .then((response) => {
      const products = response.products;
      console.log(products);
      products.forEach((el) => {
        console.log(el.description);
        let cardTr = document.createElement("tr");
        cardTr.innerHTML = `
                <td>${el._id}</td>
                <td>${el.title}</td>
                <td>${el.description}</td>
                <td>${el.price}</td>
                <td><img
                    style="width: 40px;"
                    src=">${el.thumbnail}"
                    alt=">${el.title}"
                  ></td>
                <td>${el.code}</td>
                <td>${el.stock}</td>
                <td>${el.type}</td>
                <td><button id=${el._id} >Agregar carro</button></td>`;

        let myDiv = document.getElementById("tableProduct");
        myDiv.appendChild(cardTr);
        let buttonAdd = document.getElementById(`${el._id}`);
        
        buttonAdd.addEventListener("click", async () => {
            //agregar producto al carrito con fetch
            console.log('soy id de producto',el._id)
            let productAdded = await fetch(`http://localhost:8080/api/carts/${cartId.trim()}/products/${el._id.trim()}`, { method: "POST" });
            
            alert("Producto añadido al carrito")
            console.log(productAdded, 'soy productadded')
      });
    });
    let cartLink = document.getElementById("linkToCart");
    cartLink.setAttribute("href", `http://localhost:8080/api/carts/${cartId}`);
});
})
