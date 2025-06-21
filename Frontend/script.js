const api = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let currentPage = 1;
const postsPerPage = 5;

function updateAuthUI() {
  const isLoggedIn = !!token;

  document.getElementById('auth').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('userProfile').style.display = isLoggedIn ? 'block' : 'none';

  const postFormSection = document.getElementById('postFormSection');
  if (postFormSection) postFormSection.style.display = isLoggedIn ? 'block' : 'none';
}


window.onload = () => {
  token = localStorage.getItem('token');
  updateAuthUI();
  if (token) loadProfile();
  loadPosts();

  

};

function getUserInfo() {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return {};
  }
}

function getUserId() {
  return getUserInfo()?.id || null;
}

function loadProfile() {
  const user = getUserInfo();
  if (!user || !user.username) return;

  document.getElementById('auth').style.display = 'none';
  document.getElementById('userProfile').style.display = 'block';
  const profileBtn = document.getElementById('profileBtn');
if (user.username) {
  profileBtn.textContent = `Hello, ${user.username}`;
} else {
  profileBtn.textContent = 'Profile';
}

  const postFormSection = document.getElementById('postFormSection');
  if (postFormSection) postFormSection.style.display = 'block';
}

document.getElementById('logoutBtn').onclick = () => {
  localStorage.removeItem('token');
  token = null;
  updateAuthUI();
  document.getElementById('userProfile').style.display = 'none';
  document.getElementById('auth').style.display = 'block';
  const postFormSection = document.getElementById('postFormSection');
  if (postFormSection) postFormSection.style.display = 'none';
  loadPosts();
};

document.getElementById('profileBtn')?.addEventListener('click', () => {
  const postFormSection = document.getElementById('postFormSection');
  if (postFormSection) {
    postFormSection.style.display = 'block';
    postFormSection.scrollIntoView({ behavior: 'smooth' });
  }
});

async function loadPosts() {
  try {
    const res = await fetch(`${api}/posts?page=${currentPage}&limit=${postsPerPage}`);
    const { posts, totalPages } = await res.json();

    const postsDiv = document.getElementById('posts');
    const pagination = document.getElementById('pagination');
    postsDiv.innerHTML = '';
    pagination.innerHTML = '';

    posts.forEach(post => {
      const isLiked = post.likedBy?.includes(getUserId());
      const likeColor = isLiked ? 'blue' : 'gray';

      const div = document.createElement('div');
      div.className = 'post-card';

      div.innerHTML = `
        ${post.image ? `<img src="${post.image}" class="post-img" alt="Post image"/>` : ''}

        <div class="post-content">
          <h3>${post.title}</h3>
          <p class="post-meta"><small>By ${post.author?.username || 'Anonymous'}</small></p>
          <p class="post-content-text">
  ${post.content.length > 200
    ? `${post.content.slice(0, 200)}... <a href="post.html?id=${post._id}" class="read-more">Read More</a>`
    : post.content}
</p>

          <div class="post-actions">
            <span>
              <i class="fa-solid fa-thumbs-up fa-bounce"
                 onclick="likePost('${post._id}', this)"
                 style="color: ${likeColor}; cursor: pointer;"></i>
              <span id="like-count-${post._id}">${post.likes.length || 0}</span> Likes
            </span>

            ${token && post.author?._id === getUserId() ? `
              <button onclick="prepareEdit('${post._id}')">Edit</button>
              <button onclick="deletePost('${post._id}')">Delete</button>
            ` : ''}
          </div>

          <div class="comment-box">
            <input placeholder="Add comment..." id="comment-${post._id}" />
            <button onclick="addComment('${post._id}')">Comment</button>
            <div id="comments-${post._id}" class="comments"></div>
          </div>
        </div>
      `;

      postsDiv.appendChild(div);
      loadComments(post._id); 
    });


    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.onclick = () => {
        currentPage = i;
        loadPosts();
      };
      if (i === currentPage) btn.style.fontWeight = 'bold';
      pagination.appendChild(btn);
    }

  } catch (err) {
    console.error('Error loading posts:', err);
    alert('Failed to load posts.');
  }
}


function displayPosts(posts) {
  const postsDiv = document.getElementById('posts');
  const pagination = document.getElementById('pagination');
  postsDiv.innerHTML = '';
  pagination.innerHTML = '';

  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post-card';

    const isLiked = post.likedBy?.includes(getUserId());
    const likeColor = isLiked ? '#2980b9' : '#ccc';

    div.innerHTML = `
      ${post.image ? `<img src="${post.image}" class="post-img" />` : ''}
      <h3>${post.title}</h3>
      <p class="post-content">${post.content}</p>
      <p class="post-meta">By ${post.author?.username || 'Anonymous'}</p>
      <div class="post-actions">
        <i class="fa-solid fa-thumbs-up fa-bounce" 
           onclick="likePost('${post._id}', this)"
           style="color: ${likeColor};"></i>
        <span id="like-count-${post._id}">${post.likes.length || 0}</span> Likes
        ${token && post.author?._id === getUserId() ? `
          <button onclick="prepareEdit('${post._id}')">Edit</button>
          <button onclick="deletePost('${post._id}')">Delete</button>
        ` : ''}
      </div>
      <div class="comment-box">
        <input placeholder="Add comment..." id="comment-${post._id}" />
        <button onclick="addComment('${post._id}')">Comment</button>
        <div id="comments-${post._id}" class="comments"></div>
      </div>
    `;
    postsDiv.appendChild(div);
    loadComments(post._id);
  });
}



document.getElementById('postForm').onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const id = document.getElementById('postId').value;

  try {
    const res = await fetch(`${api}/posts${id ? '/' + id : ''}`, {
      method: id ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) throw new Error('Post error');
    form.reset();
    document.getElementById('postId').value = '';
    loadPosts();
  } catch (err) {
    alert('Error creating/updating post.');
  }
};

async function prepareEdit(postId) {
  try {
    const res = await fetch(`${api}/posts/${postId}`);
    const post = await res.json();
    editPost(post._id, post.title, post.content);
  } catch (err) {
    console.error('Error fetching post for edit:', err);
    alert('Could not load post for editing.');
  }
}

function editPost(id, title, content) {
  document.getElementById('postId').value = id;
  document.getElementById('title').value = title;

  
  const textarea = document.getElementById('content');
  textarea.value = '';
  textarea.value = content;

  
  document.getElementById('postFormSection').scrollIntoView({ behavior: 'smooth' });
}
async function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  await fetch(`${api}/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  loadPosts();
}

async function likePost(id,iconEl) {
  if (!token) {
    alert("Please login to like posts.");
    document.getElementById('loginModal').style.display = 'flex';
    return;
  }

  try {
    const res = await fetch(`${api}/posts/${id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Like failed');
      return;
    }

    
    const countSpan = document.getElementById(`like-count-${id}`);
    if (countSpan) {
      countSpan.textContent = data.likes;
    }

    
    if (data.liked) {
      iconEl.style.color = 'blue';
    } else {
      iconEl.style.color = 'gray';
    }
  } catch (err) {
    console.error('Like error:', err);
  }
}

async function loadComments(postId) {
  try {
    const res = await fetch(`${api}/comments/post/${postId}`);
    const comments = await res.json();
    const container = document.getElementById(`comments-${postId}`);
    container.innerHTML = '';

    comments.forEach(comment => {
      const commentDiv = renderComment(comment, postId);
      container.appendChild(commentDiv);

      if (comment.replies && comment.replies.length > 0) {
        const repliesContainer = document.createElement('div');
        repliesContainer.style.marginLeft = '20px';
        repliesContainer.style.borderLeft = '2px solid #ccc';
        repliesContainer.style.paddingLeft = '10px';

        comment.replies.forEach(reply => {
          const replyDiv = renderComment(reply, postId, true);
          repliesContainer.appendChild(replyDiv);
        });

        commentDiv.appendChild(repliesContainer);
      }
    });
  } catch (err) {
    console.error('Load comments error:', err);
  }
}
function renderComment(comment, postId, isReply = false) {
  const div = document.createElement('div');
  div.className = 'comment';
  if (isReply) div.classList.add('reply-comment');

  const isAuthor = token && comment.author?._id === getUserId();
  const authorName = comment.author?.username || 'Anonymous';

  div.innerHTML = `
    <p contenteditable="false" id="text-${comment._id}">${comment.text}</p>
    <small>by ${authorName}</small>
    <button onclick="replyToComment('${postId}', '${comment._id}')">Reply</button>
    ${isAuthor ? `
      <button id="edit-btn-${comment._id}" onclick="toggleEditComment('${comment._id}', '${postId}')">Edit</button>
      <button onclick="deleteComment('${comment._id}', '${postId}')">Delete</button>
    ` : ''}
  `;

  return div;
}



async function addComment(postId) {
  if (!token) {
    alert("Please login to comment.");
    document.getElementById('loginModal').style.display = 'flex';
    return;
  }

  const input = document.getElementById(`comment-${postId}`);
  const text = input.value.trim();
  
  if (!text) return;

  
  await fetch(`${api}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text, postId })
  });

  input.value = '';
  loadComments(postId);
}

async function replyToComment(postId, parentId) {
  if (!token) {
    alert("Please login to reply.");
    document.getElementById('loginModal').style.display = 'flex';
    return;
  }
  const reply = prompt("Enter your reply:");
  if (!reply) return;

  await fetch(`${api}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text: reply, postId, parentId })
  });

  loadComments(postId);
}

async function deleteComment(id, postId) {
  if (!confirm('Delete this comment?')) return;
  await fetch(`${api}/comments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  loadComments(postId);
}

async function toggleEditComment(id, postId) {
  const textEl = document.getElementById(`text-${id}`);
  const button = document.getElementById(`edit-btn-${id}`);

  if (button.innerText === 'Edit') {
    textEl.contentEditable = 'true';
    textEl.focus();
    button.innerText = 'Save';
  } else {
    const newText = textEl.innerText.trim();
    if (!newText) return;

    await fetch(`${api}/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text: newText })
    });

    textEl.contentEditable = 'false';
    button.innerText = 'Edit';
    loadComments(postId); // Optional: refresh to reflect changes
  }
}


document.getElementById('loginBtn').onclick = () => {
  document.getElementById('loginModal').style.display = 'flex';
};
document.getElementById('registerBtn').onclick = () => {
  document.getElementById('registerModal').style.display = 'flex';
};
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

document.getElementById('loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Login failed');
      return;
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      token = data.token;
      updateAuthUI();
      document.getElementById('loginForm').reset();
      closeModal('loginModal');
      
      loadProfile();
      loadPosts();
    }
  } catch (err) {
    alert('Login error');
  }
};

document.getElementById('registerForm').onsubmit = async (e) => {
  e.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const res = await fetch(`${api}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Registration failed');
      return;
    }

    // ✅ Show alert as soon as registration succeeds
    alert('Registration successful! You are now logged in.');

    if (data.token) {
      localStorage.setItem('token', data.token);
      token = data.token;
      updateAuthUI();
      loadProfile();
      loadPosts();
    }

    document.getElementById('registerForm').reset();
    closeModal('registerModal');

  } catch (err) {
    alert('Registration error');
    console.error(err);
  }
};



async function searchPosts() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return loadPosts();

  try {
    const res = await fetch(`${api}/posts/search?q=${encodeURIComponent(query)}`);
    const posts = await res.json();

    const postsDiv = document.getElementById('posts');
    const pagination = document.getElementById('pagination');
    postsDiv.innerHTML = '';
    pagination.innerHTML = '';

    if (posts.length === 0) {
      postsDiv.innerHTML = '<p>No posts found.</p>';
      return;
    }

    displayPosts(posts);
  } catch (err) {
    console.error('Search error:', err);
    alert('Failed to search posts.');
  }
}


let searchTimeout;
document.getElementById('searchInput').addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchPosts();
  }, 300);
});


document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
      const targetId = icon.getAttribute('data-target');
      const input = document.getElementById(targetId);

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
