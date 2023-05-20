const clearCartBtn = document.getElementById("btn");
const cid = clearCartBtn.value
clearCartBtn.addEventListener('click', async () => {
  try {
    const response = await fetch(`http://localhost:8080/api/carts//${cid}`, { method: 'DELETE' });
    if (response.ok) {
      console.log('El carrito se borró exitosamente');
      location.reload();
    } else {
      throw new Error('No se pudo borrar el carrito');
    }
  } catch (error) {
    console.error(error);
    // Muestra un mensaje de error al usuario o haz cualquier otra acción necesaria
  }
});
