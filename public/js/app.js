let currentUser = null;
let currentCategory = "All";
let currentSearch = "";
let currentSort = "upcoming";
let selectedEventForReg = null;
let isAuthSignUp = false;

const eventsGrid = document.getElementById("eventsGrid");
const myTicketsGrid = document.getElementById("myTicketsGrid");
const organizerEventsGrid = document.getElementById("organizerEventsGrid");
const authNavContainer = document.getElementById("authNavContainer");

const viewBrowse = document.getElementById("viewBrowse");
const viewMyTickets = document.getElementById("viewMyTickets");
const viewOrganizer = document.getElementById("viewOrganizer");

const tabBrowse = document.getElementById("tabBrowse");
const tabMyTickets = document.getElementById("tabMyTickets");
const tabOrganizer = document.getElementById("tabOrganizer");

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openModal(id) {
  document.getElementById(id).classList.add("active");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}
document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () =>
    closeModal(btn.getAttribute("data-close")),
  );
});

async function checkAuth() {
  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.success && data.user) {
      currentUser = data.user;
      renderNavbar();
    }
  } catch (err) {
    currentUser = null;
  }
  renderNavbar();
}

function renderNavbar() {
  if (currentUser) {
    tabMyTickets.style.display = "inline-block";
    if (currentUser.role === "organizer" || currentUser.role === "admin") {
      tabOrganizer.style.display = "inline-block";
    }

    authNavContainer.innerHTML = `
      <div class="user-badge">
        <div class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
        <span style="font-size: 0.9rem; font-weight: 600;">${currentUser.name} (${currentUser.role})</span>
        <button class="btn btn-outline btn-sm" id="btnLogout" style="padding: 4px 10px;">Logout</button>
      </div>
    `;

    document.getElementById("btnLogout").addEventListener("click", logout);
  } else {
    tabMyTickets.style.display = "none";
    tabOrganizer.style.display = "none";
    authNavContainer.innerHTML = `
      <button class="btn btn-outline btn-sm" id="btnOpenLogin">Sign In</button>
      <button class="btn btn-primary btn-sm" id="btnOpenRegister">Sign Up</button>
    `;
    document
      .getElementById("btnOpenLogin")
      .addEventListener("click", () => openAuthModal(false));
    document
      .getElementById("btnOpenRegister")
      .addEventListener("click", () => openAuthModal(true));
  }
}

async function logout() {
  await fetch("/api/auth/logout");
  currentUser = null;
  renderNavbar();
  switchView("browse");
  showToast("You have been logged out", "info");
}

function switchView(view) {
  [viewBrowse, viewMyTickets, viewOrganizer].forEach(
    (v) => (v.style.display = "none"),
  );
  [tabBrowse, tabMyTickets, tabOrganizer].forEach((t) =>
    t.classList.remove("active"),
  );

  if (view === "browse") {
    viewBrowse.style.display = "block";
    tabBrowse.classList.add("active");
    loadEvents();
  } else if (view === "myTickets") {
    viewMyTickets.style.display = "block";
    tabMyTickets.classList.add("active");
    loadMyRegistrations();
  } else if (view === "organizer") {
    viewOrganizer.style.display = "block";
    tabOrganizer.classList.add("active");
    loadOrganizerEvents();
  }
}

tabBrowse.addEventListener("click", () => switchView("browse"));
tabMyTickets.addEventListener("click", () => switchView("myTickets"));
tabOrganizer.addEventListener("click", () => switchView("organizer"));

async function loadEvents() {
  eventsGrid.innerHTML =
    '<p style="color: var(--text-muted);">Loading events...</p>';
  try {
    let url = `/api/events?category=${currentCategory}&sort=${currentSort}`;
    if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;

    const res = await fetch(url);
    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      eventsGrid.innerHTML =
        '<p style="color: var(--text-muted); grid-column: 1/-1;">No events found matching your criteria.</p>';
      return;
    }

    eventsGrid.innerHTML = result.data
      .map((event) => {
        const isSoldOut = event.registeredCount >= event.capacity;
        const percentFull = Math.min(
          100,
          Math.round((event.registeredCount / event.capacity) * 100),
        );
        const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
        <div class="event-card">
          <div class="card-img-wrapper">
            <img src="${event.image}" class="card-img" alt="${event.title}">
            <span class="card-category-badge">${event.category}</span>
            <span class="card-price-badge">${event.price === 0 ? "FREE" : `$${event.price}`}</span>
          </div>
          <div class="card-content">
            <h3 class="card-title">${event.title}</h3>
            <div class="card-meta">
              <div class="meta-item">📅 ${formattedDate}</div>
              <div class="meta-item">📍 ${event.location}</div>
            </div>
            
            <div class="seats-bar-wrapper">
              <div class="seats-info">
                <span>${event.capacity - event.registeredCount} seats left</span>
                <span>${percentFull}% Booked</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${percentFull}%;"></div>
              </div>
            </div>

            <button class="btn ${isSoldOut ? "btn-outline" : "btn-primary"}" 
              onclick="openEventDetails('${event._id}')" 
              ${isSoldOut ? "disabled" : ""} style="width: 100%;">
              ${isSoldOut ? "Sold Out" : "View & Register"}
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  } catch (error) {
    eventsGrid.innerHTML = '<p style="color: red;">Failed to load events.</p>';
  }
}

window.openEventDetails = async function (eventId) {
  try {
    const res = await fetch(`/api/events/${eventId}`);
    const { data: event } = await res.json();

    selectedEventForReg = event;
    document.getElementById("modalEventTitle").innerText = event.title;
    document.getElementById("modalEventImg").src = event.image;
    document.getElementById("modalEventDesc").innerText = event.description;
    document.getElementById("modalEventDate").innerText = new Date(
      event.date,
    ).toLocaleString("en-US");
    document.getElementById("modalEventLoc").innerText = event.location;
    document.getElementById("modalEventPrice").innerText =
      event.price === 0 ? "Free" : `$${event.price}`;
    document.getElementById("modalEventSeats").innerText =
      `${event.capacity - event.registeredCount} / ${event.capacity}`;

    openModal("modalEventDetail");
  } catch (err) {
    showToast("Failed to load event details", "error");
  }
};

document
  .getElementById("btnConfirmRegister")
  .addEventListener("click", async () => {
    if (!currentUser) {
      closeModal("modalEventDetail");
      openAuthModal(false);
      showToast("Please sign in to register for events", "info");
      return;
    }

    const notes = document.getElementById("regNotesInput").value;

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventForReg._id, notes }),
      });

      const data = await res.json();
      if (data.success) {
        closeModal("modalEventDetail");
        showToast(
          `Registered successfully! Ticket code: ${data.data.ticketCode}`,
          "success",
        );
        loadEvents();
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Registration failed. Please try again.", "error");
    }
  });

async function loadMyRegistrations() {
  myTicketsGrid.innerHTML =
    '<p style="color: var(--text-muted);">Loading your tickets...</p>';
  try {
    const res = await fetch("/api/registrations/my");
    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      myTicketsGrid.innerHTML =
        '<p style="color: var(--text-muted); grid-column: 1/-1;">You have no registered events yet.</p>';
      return;
    }

    myTicketsGrid.innerHTML = result.data
      .map((reg) => {
        const isCancelled = reg.status === "cancelled";
        return `
        <div class="event-card" style="${isCancelled ? "opacity: 0.6;" : ""}">
          <div class="card-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span class="card-category-badge" style="position: static;">${reg.event.category}</span>
              <span style="font-weight: 800; font-size: 0.85rem; color: ${isCancelled ? "#ef4444" : "#10b981"};">
                ${reg.status.toUpperCase()}
              </span>
            </div>
            <h3 class="card-title">${reg.event.title}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
              📍 ${reg.event.location} | 📅 ${new Date(reg.event.date).toLocaleDateString()}
            </p>
            <p style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; margin-bottom: 15px;">
              🎟 Ticket: <strong>${reg.ticketCode}</strong>
            </p>
            ${
              !isCancelled
                ? `
              <button class="btn btn-danger btn-sm" onclick="cancelTicket('${reg._id}')" style="width: 100%;">
                Cancel Registration
              </button>
            `
                : ""
            }
          </div>
        </div>
      `;
      })
      .join("");
  } catch (err) {
    myTicketsGrid.innerHTML =
      '<p style="color: red;">Failed to load registrations.</p>';
  }
}

window.cancelTicket = async function (regId) {
  if (
    !confirm(
      "Are you sure you want to cancel this ticket? Your seat will be freed.",
    )
  )
    return;

  try {
    const res = await fetch(`/api/registrations/${regId}/cancel`, {
      method: "PUT",
    });
    const data = await res.json();
    if (data.success) {
      showToast("Registration cancelled", "info");
      loadMyRegistrations();
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    showToast("Failed to cancel ticket", "error");
  }
};

async function loadOrganizerEvents() {
  organizerEventsGrid.innerHTML =
    '<p style="color: var(--text-muted);">Loading your events...</p>';
  try {
    const res = await fetch("/api/events/my/created");
    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      organizerEventsGrid.innerHTML =
        '<p style="color: var(--text-muted); grid-column: 1/-1;">You haven\'t created any events yet.</p>';
      return;
    }

    organizerEventsGrid.innerHTML = result.data
      .map(
        (event) => `
      <div class="event-card">
        <div class="card-content">
          <h3 class="card-title">${event.title}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">
            📅 ${new Date(event.date).toLocaleDateString()} | 👥 ${event.registeredCount} / ${event.capacity} Registered
          </p>
          <div style="display: flex; gap: 8px; margin-top: auto;">
            <button class="btn btn-danger btn-sm" onclick="deleteMyEvent('${event._id}')" style="flex: 1;">Delete</button>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    organizerEventsGrid.innerHTML =
      '<p style="color: red;">Failed to load events.</p>';
  }
}

window.deleteMyEvent = async function (eventId) {
  if (
    !confirm(
      "Are you sure? This will delete the event and cancel all attendee registrations.",
    )
  )
    return;
  try {
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast("Event deleted successfully", "info");
      loadOrganizerEvents();
    }
  } catch (err) {
    showToast("Failed to delete event", "error");
  }
};

document
  .getElementById("btnCreateEventModal")
  .addEventListener("click", () => openModal("modalCreateEvent"));

document
  .getElementById("createEventForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById("createTitle").value,
      category: document.getElementById("createCategory").value,
      date: document.getElementById("createDate").value,
      location: document.getElementById("createLocation").value,
      capacity: Number(document.getElementById("createCapacity").value),
      price: Number(document.getElementById("createPrice").value),
      image: document.getElementById("createImage").value || undefined,
      description: document.getElementById("createDescription").value,
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        closeModal("modalCreateEvent");
        document.getElementById("createEventForm").reset();
        showToast("Event published successfully!", "success");
        loadOrganizerEvents();
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("Failed to publish event", "error");
    }
  });

function openAuthModal(isSignUp = false) {
  isAuthSignUp = isSignUp;
  document.getElementById("groupName").style.display = isSignUp
    ? "block"
    : "none";
  document.getElementById("groupRole").style.display = isSignUp
    ? "block"
    : "none";
  document.getElementById("authModalTitle").innerText = isSignUp
    ? "Create an Account"
    : "Sign In to EventPulse";
  document.getElementById("btnAuthSubmit").innerText = isSignUp
    ? "Create Account"
    : "Sign In";
  document.getElementById("authToggleText").innerText = isSignUp
    ? "Already have an account?"
    : "Don't have an account?";
  document.getElementById("authToggleLink").innerText = isSignUp
    ? "Sign In"
    : "Sign Up";
  openModal("modalAuth");
}

document
  .getElementById("authToggleLink")
  .addEventListener("click", () => openAuthModal(!isAuthSignUp));

document.getElementById("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPassword").value;
  const endpoint = isAuthSignUp ? "/api/auth/register" : "/api/auth/login";

  const body = { email, password };
  if (isAuthSignUp) {
    body.name = document.getElementById("authName").value;
    body.role = document.getElementById("authRole").value;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      currentUser = data.user;
      renderNavbar();
      closeModal("modalAuth");
      document.getElementById("authForm").reset();
      showToast(`Welcome, ${currentUser.name}!`, "success");
      loadEvents();
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    showToast("Authentication failed", "error");
  }
});

document.getElementById("searchInput").addEventListener("input", (e) => {
  currentSearch = e.target.value;
  loadEvents();
});

document.getElementById("sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  loadEvents();
});

document.querySelectorAll(".category-pills .pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    document
      .querySelectorAll(".category-pills .pill")
      .forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    currentCategory = pill.getAttribute("data-cat");
    loadEvents();
  });
});

checkAuth();
loadEvents();
