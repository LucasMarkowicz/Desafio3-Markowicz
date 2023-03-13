const socket = io();

const form = document.getElementById('add-product-form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const product = {
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    thumbnail: formData.get('thumbnail'),
    code: formData.get('code'),
    stock: formData.get('stock')
  };
  fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  })
  .then(() => {
    location.reload();
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

const form2 = document.getElementById('delete-product-form');
form2.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const pid = formData.get('pid');
  fetch(`/api/products/${pid}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) {
        console.log('Producto eliminado exitosamente');
        socket.emit('message', JSON.stringify({ type: 'deleteProduct', payload: pid }));
      } else {
        console.log('Error al eliminar producto');
      }
    })
    .catch(error => {
      console.error('Error al eliminar producto:', error);
    });
});

