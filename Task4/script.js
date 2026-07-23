const quote = document.getElementById("quote");
const author = document.getElementById("author");
const history = document.getElementById("history");

document.getElementById("generate").addEventListener("click", generateQuote);

async function generateQuote() {
  const response = await fetch("/quote");
  const data = await response.json();
  quote.innerHTML = data.content;
  author.innerHTML = "- " + data.author;
  loadHistory();
}

async function loadHistory() {
  const response = await fetch("/history");
  const data = await response.json();
  history.innerHTML = "";
  data.forEach((item) => {
    history.innerHTML += `
      <li>
        "${item.content}"
        <br>
        <b>- ${item.author}</b>
      </li>
    `;
  });
}

loadHistory();
