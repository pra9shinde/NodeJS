const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const productElementHTML = btn.closest('article');//get the html sextion which contains this product data

  //send the ajax request to a node function using js inbuilt fetch method
  fetch('/admin/delete-product/' + prodId,{
    method: 'POST',
  })
    .then(result => {
      return result.json();//promise which will return the response body(html)
    })
    .then(data => {
      console.log(data);
      productElementHTML.parentNode.removeChild(productElementHTML);//remove the product from html DOM
    })
    .catch(err => {
      console.log(err)
    });
};