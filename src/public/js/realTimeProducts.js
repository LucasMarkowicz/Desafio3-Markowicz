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
    stock: formData.get('stock'),
    category: formData.get('category')
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





/*const deleteForms = document.querySelectorAll('#delete-form');

deleteForms.forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const pid = form.getAttribute('data-id');
    fetch(`/api/products/${pid}`, {
      method: 'DELETE'
    }).then(response => {
      if (response.ok) {  
        location.reload();
        console.log('Producto eliminado exitosamente');
      } else {
        console.log('Hubo un error al eliminar el producto');
      }
      
    });
    
  });
});

*/