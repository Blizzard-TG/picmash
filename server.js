<!DOCTYPE html>
<html lang="en">
<head>
  <metcemash
      color: #fff;
      text-align: center;
      padding: 2rem;
    }
    .container {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .card {
      background: #1e1e1e;
      border-radius: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      padding: 1rem;
      max-width: 300px;
      transition: 0.3s ease;
    }
    .card img {
      width: 100%;
      border-radius: 10px;
    }
    .btn {
      background: #03dac6;
      color: #000;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 5px;
      font-size: 1rem;
      margin: 1rem 0.3rem;
      cursor: pointer;
    }
    .btn:hover {
      background: #00bfa5;
    }
    input, input[type="file"] {
      margin: 0.5rem;
      padding: 0.5rem;
    }
    #leaderboard {
      margin-top: 2rem;
      background-color: #1f1f1f;
      padding: 1rem;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <h1>Facemash Clone</h1>

  <div id="loginSection">
    <h3>Admin Login</h3>
    <input id="email" placeholder="Email" type="email">
    <input id="password" placeholder="Password" type="password">
    <button class="btn" onclick="login()">Login</button>
  </div>

  <div id="adminPanel" style="display:none">
    <h3>Admin Panel</h3>
    <input type="file" accept="image/*" id="imageUpload">
    <button class="btn" onclick="uploadImage()">Upload Picture</button>
    <button class="btn" onclick="exportData()">Export Data</button>
    <input type="file" accept="application/json" id="importJson">
    <button class="btn" onclick="importData()">Import Data</button>
  </div>

  <div class="container">
    <div class="card">
      <img id="imgA" src="" alt="Picture A">
      <button class="btn" onclick="vote('A')">Vote A</button>
    </div>
    <div class="card">
      <img id="imgB" src="" alt="Picture B">
      <button class="btn" onclick="vote('B')">Vote B</button>
    </div>
  </div>

  <button class="btn" onclick="skip()">Skip</button>
  <button class="btn" onclick="showLeaderboard()">Leaderboard</button>

  <div id="leaderboard"></div>

  <script>
    const API = 'http://localhost:3000';
    let token = localStorage.getItem('token') || '';
    let images = [];
    let currentA, currentB;

    function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
        .then(res => res.json())
        .then(data => {
          token = data.token;
          localStorage.setItem('token', token);
          document.getElementById('loginSection').style.display = 'none';
          document.getElementById('adminPanel').style.display = 'block';
        })
        .catch(err => alert('Login failed'));
    }

    function loadImages() {
      fetch(`${API}/images`)
        .then(res => res.json())
        .then(data => {
          images = data;
          pickRandomPair();
        });
    }

    function pickRandomPair() {
      if (images.length < 2) return;
      let a = Math.floor(Math.random() * images.length);
      let b;
      do { b = Math.floor(Math.random() * images.length); } while (a === b);
      currentA = images[a];
      currentB = images[b];
      document.getElementById('imgA').src = currentA.src;
      document.getElementById('imgB').src = currentB.src;
    }

    function vote(winner) {
      const winnerId = winner === 'A' ? currentA.id : currentB.id;
      const loserId = winner === 'A' ? currentB.id : currentA.id;
      fetch(`${API}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, loserId })
      }).then(() => skip());
    }

    function uploadImage() {
      const file = document.getElementById('imageUpload').files[0];
      if (!file) return alert('Select an image');
      const reader = new FileReader();
      reader.onload = function(e) {
        fetch(`${API}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({ base64: e.target.result })
        })
        .then(res => res.json())
        .then(() => loadImages());
      };
      reader.readAsDataURL(file);
    }

    function exportData() {
      fetch(`${API}/export`, {
        method: 'POST',
        headers: { 'Authorization': token }
      })
      .then(() => alert('Exported to server-side file backup.json'));
    }

    function importData() {
      const file = document.getElementById('importJson').files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        fetch(`${API}/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({ json: e.target.result })
        })
        .then(() => loadImages());
      };
      reader.readAsText(file);
    }

    function skip() {
      document.getElementById('leaderboard').innerHTML = '';
      pickRandomPair();
    }

    function showLeaderboard() {
      fetch(`${API}/leaderboard`)
        .then(res => res.json())
        .then(sorted => {
          const board = sorted.map(img => `
            <li style='margin: 1rem 0;'>
              <img src="${img.src}" width="150"><br>
              Score: ${img.score} | Total Votes: ${img.votes}
            </li>
          `).join('');
          document.getElementById('leaderboard').innerHTML = `<h2>Leaderboard</h2><ul style='list-style:none;'>${board}</ul>`;
        });
    }

    loadImages();
  </script>
</body>
</html>
