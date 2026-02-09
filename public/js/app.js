const API_BASE = "/api";

async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    const data = await response.json();

    if (data.success) {
      if (document.getElementById("total-messages"))
        document.getElementById("total-messages").textContent =
          data.stats.totalMessages;
      if (document.getElementById("total-users"))
        document.getElementById("total-users").textContent =
          data.stats.totalUsers;
      if (document.getElementById("active-jobs"))
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

async function fetchLogs() {
  const listElement = document.getElementById("logs-list");
  if (!listElement) return;

  try {
    const response = await fetch(`${API_BASE}/logs`);
    const data = await response.json();

    if (data.success) {
      if (data.logs.length === 0) {
        listElement.innerHTML =
          '<div class="loading">Nenhum log encontrado</div>';
        return;
      }

      listElement.innerHTML = "";
      data.logs.forEach((log) => {
        const div = document.createElement("div");
        div.className = "message-item log-item";
        const date = new Date(log.timestamp).toLocaleString();

        div.innerHTML = `
                    <div class="message-header">
                        <span class="level-${log.level}" style="font-weight:bold;">${log.level}</span>
                        <span>${date}</span>
                    </div>
                    <div>${log.message}</div>
                    ${log.details ? `<div class="log-details">${log.details}</div>` : ""}
                `;
        listElement.appendChild(div);
      });
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
    listElement.innerHTML = '<div class="loading">Erro ao carregar logs</div>';
  }
}

async function fetchJobs() {
  const listElement = document.getElementById("cron-list");
  if (!listElement) return;

  try {
    const response = await fetch(`${API_BASE}/stats`);
    const data = await response.json();

    if (data.success && data.jobs) {
      listElement.innerHTML = "";

      // Handle structure depending on how api.ts returns it (direct array or inside crons)
      let cronsToRender = [];
      if (Array.isArray(data.jobs)) {
        cronsToRender = data.jobs;
      } else if (data.jobs.crons && Array.isArray(data.jobs.crons)) {
        cronsToRender = data.jobs.crons;
      }

      if (cronsToRender.length > 0) {
        cronsToRender.forEach((cron) => {
          const div = document.createElement("div");
          div.className = "message-item";

          const nextDate = cron.next
            ? new Date(cron.next).toLocaleString()
            : "N/A";

          div.innerHTML = `
                        <div class="message-header">
                            <span style="font-weight:bold;">${cron.key || cron.name || "Job"}</span>
                            <span class="role-badge role-model">Ativo</span>
                        </div>
                        <div><strong>Padrão:</strong> ${cron.pattern || "N/A"}</div>
                        <div><strong>Próxima execução:</strong> ${nextDate}</div>
                    `;
          listElement.appendChild(div);
        });
      } else {
        listElement.innerHTML =
          '<div class="loading">Nenhum job agendado</div>';
      }
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    listElement.innerHTML = '<div class="loading">Erro ao carregar jobs</div>';
  }
}

async function initSendForm() {
  const form = document.getElementById("send-form");
  if (!form) return;

  // Tenta pegar o telefone da URL (para vir do link do chat)
  const urlParams = new URLSearchParams(window.location.search);
  const phoneParam = urlParams.get("phone");
  if (phoneParam) {
    document.getElementById("phone").value = phoneParam;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("send-btn");
    const successMsg = document.getElementById("success-msg");
    const errorMsg = document.getElementById("error-msg");

    const phone = document.getElementById("phone").value;
    const message = document.getElementById("message").value;

    // Reset UI
    btn.disabled = true;
    btn.textContent = "Enviando...";
    successMsg.style.display = "none";
    errorMsg.style.display = "none";

    try {
      const response = await fetch(`${API_BASE}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message }),
      });

      const data = await response.json();

      if (data.success) {
        successMsg.style.display = "block";
        document.getElementById("message").value = ""; // Limpa mensagem, mantém telefone
      } else {
        errorMsg.textContent = data.error || "Erro ao enviar mensagem";
        errorMsg.style.display = "block";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      errorMsg.textContent = "Erro de conexão";
      errorMsg.style.display = "block";
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar Mensagem";
    }
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

  // Logs view
  if (document.getElementById("logs-list")) {
    fetchLogs();
  }

  // Jobs view
  if (document.getElementById("cron-list")) {
    fetchJobs();
  }

  // Send view
  if (document.getElementById("send-form")) {
    initSendForm();
  }
});
