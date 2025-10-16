// js/views/resourceView.js
const resources = state.resources ? Object.values(state.resources) : [];
let unlockedResources = resources.filter(r => r.unlocked === true);
let stats = unlockedResources.filter(r => r.type === "stat");
let currency = unlockedResources.filter(r => r.type === "currency");

let statPoolContainer = null;
let currencyContainer = null;


statPoolContainer = document.getElementById("stat-pools-container");
currencyContainer = document.getElementById("currencies-container");

if (!statPoolContainer) {
    console.error(
        "[Everlyn] Missing #statPoolContainer. Is the deployed HTML the one you expect?"
    );
    // Show a friendly message so the page doesn't look dead.
    document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #statPoolContainer in DOM.</pre>`
    );
    return; // bail early; no container to render into
}
if (!currencyContainer) {
    console.error(
        "[Everlyn] Missing #currencyContainer. Is the deployed HTML the one you expect?"
    );
    // Show a friendly message so the page doesn't look dead.
    document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #currencyContainer in DOM.</pre>`
    );
    return; // bail early; no container to render into
}

statPoolContainer.innerHTML = `
    <ul>${stats
      .map((r) => `<li>${defs.resources?.[r.id]?.name ?? r.id}: ${r.amount}/${r.maximum}</li>`)
      .join("")}</ul>
`;
currencyContainer.innerHTML = `
    <ul>${currency
      .map((r) => `<li>${defs.resources?.[r.id]?.name ?? r.id}: ${r.amount}/${r.maximum}</li>`)
      .join("")}</ul>
`;
