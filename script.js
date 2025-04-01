
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
const APPS_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE";

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
  return JSON.parse(jsonPayload);
}

function drawTable(data) {
  if (!data || data.length <= 1) {
    document.getElementById("output").innerHTML = "<p>No data available for this email.</p>";
    return;
  }

  let html = "<table><tr>";
  data[0].forEach(header => html += `<th>${header}</th>`);
  html += "</tr>";

  for (let i = 1; i < data.length; i++) {
    html += "<tr>";
    data[i].forEach(cell => html += `<td>${cell}</td>`);
    html += "</tr>";
  }

  html += "</table>";
  document.getElementById("output").innerHTML = html;
}

function fetchData(email) {
  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `email=${encodeURIComponent(email)}`
  })
    .then(response => response.json())
    .then(data => drawTable(data))
    .catch(error => {
      document.getElementById("output").innerHTML = "<p>Error fetching data.</p>";
      console.error("Fetch error:", error);
    });
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (token) => {
      const payload = parseJwt(token.credential);
      const email = payload.email;
      document.getElementById("signinDiv").innerHTML = `<p>Signed in as <strong>${email}</strong></p>`;
      fetchData(email);
    }
  });

  google.accounts.id.renderButton(
    document.getElementById("signinDiv"),
    { theme: "outline", size: "large" }
  );
};
