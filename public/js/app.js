const API_BASE = "/api";

async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    const data = await response.json();

    if (data.success) {
      document.getElementById("total-messages").textContent =
        data.stats.totalMessages;
      document.getElementById("total-users").textContent =
        data.stats.totalUsers;
      document.getElementById("active-jobs").textContent =
        data.stats.activeJobs;
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
}

async function fetchHistory(phone = "") {
  const listElement = document.getElementById("chat-list");
  if (!listElement) return;

  listElement.innerHTML = '<div class="loading">Carregando mensagens...</div>';

  try {
    const url = phone
      ? `${API_BASE}/history?phone=${encodeURIComponent(phone)}`
      : `${API_BASE}/history`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      renderMessages(data.history);
    } else {
      listElement.innerHTML =
        '<div class="loading">Erro ao carregar mensagens</div>';
    }
  } catch (error) {
    console.error("Error fetching history:", error);
    listElement.innerHTML = '<div class="loading">Erro de conexão</div>';
  }
}

function renderMessages(messages) {
  const listElement = document.getElementById("chat-list");
  listElement.innerHTML = "";

  if (messages.length === 0) {
    listElement.innerHTML =
      '<div class="loading">Nenhuma mensagem encontrada</div>';
    return;
  }

  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className = "message-item";

    const date = new Date(msg.timestamp).toLocaleString();

    div.innerHTML = `
            <div class="message-header">
                <span>${msg.phone_number}</span>
                <span>${date}</span>
            </div>
            <div style="margin-bottom: 0.5rem;">
                <span class="role-badge role-${msg.role}">${msg.role}</span>
            </div>
            <div class="message-content">${msg.content}</div>
        `;

    listElement.appendChild(div);
  });
}

// Inicialização baseada na página
document.addEventListener("DOMContentLoaded", () => {
  // Se existir elemento de stats, carrega stats
  if (document.getElementById("total-messages")) {
    fetchStats();
    // Atualiza a cada 30 segundos
    setInterval(fetchStats, 30000);
  }

  // Se existir lista de chat, carrega histórico
  if (document.getElementById("chat-list")) {
    fetchHistory();

    const filterForm = document.getElementById("filter-form");
    if (filterForm) {
      filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const phone = document.getElementById("phone-filter").value;
        fetchHistory(phone);
      });
    }
  }
});
