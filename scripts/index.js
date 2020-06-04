const url = 'http://localhost:3000/posts';

// I like to create this function so I can write less code
// Otherwise I have to keep on writing the same .then()s and catch()s over and over
function genericFetch(url, options={}) {
  return fetch(url, options)
    .then(res => res.json())
    .catch(console.log);
}

// I like to use a function to generate the options for me
// That way, I don't have to retype the same code
// These options are needed for PATCH and POST requests
function makeOptions(method, bodyObject) {
  return {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyObject)
  };
}

// We want to attach a form to each Post div to edit the comment
// When the form submits, it'll send a PATCH request and upon success
// will update the correct post div with the edited comment
function makeEditForm(id, comment) {
  const form = document.createElement('form');
  const input = document.createElement('input');
  const submitBtn = document.createElement('input');

  input.type = 'text';
  input.value = comment;
  submitBtn.type = 'submit';
  submitBtn.value = 'Edit Post';
  form.append(input, submitBtn);
  form.classList.add('edit-form'); // style the form

  form.addEventListener('submit', e => {
    e.preventDefault();

    const comment = input.value;

    genericFetch(`${url}/${id}`, makeOptions('PATCH', { comment: comment }))
      .then(json => {
        // Update the paragraph in the post div after successful PATCH request
        // We can get the correct div by looking for the HTML attribute: data-post-id=id
        const postDivP = document.querySelector(`[data-post-id="${json.id}"] p`);
        postDivP.textContent = json.comment;
      });
  });

  return form;
}

// This button deletes the post from the database and updates the DOM
function makeDeleteBtn(id) {
  const btn = document.createElement('button');
  const deleteOptions = { method: 'DELETE' };

  btn.textContent = 'Delete';
  btn.addEventListener('click', () => {
    genericFetch(`${url}/${id}`, deleteOptions)
      .then(() => {
        const div = document.querySelector(`[data-post-id="${id}"]`);
        div.remove();
      });
  });

  return btn;
}

// Create a post and add it to the DOM
function createPost(gifUrl, comment, id) {
  // make post div
  const div = document.createElement('div');
  const img = document.createElement('img');
  const p = document.createElement('p');

  img.setAttribute('src', gifUrl);
  p.textContent = comment;
  div.append(img, p, makeDeleteBtn(id), makeEditForm(id, comment));
  // Adding the HTML attribute data-post-id=id to each post div will make
  // them easy to find when we want to edit or delete a post
  div.dataset.postId = id;

  const posts = document.querySelector('.posts');
  posts.append(div);
}

// Get all posts and render them to the DOM
genericFetch(url)
  .then(json => {
    for (const post of json) {
      createPost(post.url, post.comment, post.id);
    }
  });

// Create a post in the "database" and render to DOM pessimistically
// Pessimistic means we render to the DOM after getting a response
// to confirm that our POST request was successful
const form = document.querySelector('form');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const gifUrl = document.querySelector('#gif-url').value;
  const comment = document.querySelector('#comment').value;
  const requestBody = {
    url: gifUrl,
    comment: comment
  };

  genericFetch(url, makeOptions('POST', requestBody))
    .then(post => {
      createPost(post.url, post.comment, post.id);
      form.reset(); // clear the inputs in the form
    });

  // This is optimistic rendering. It doesn't wait for a successful response
  // to our POST request. How will we supply the id of the new post entry 
  // to createPost()?
  // genericFetch(url, makeOptions('POST', requestBody));
  // createPost(gifUrl, comment);
});
