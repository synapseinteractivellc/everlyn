// js/views/resourceView.js
export default class ResourceView {
  constructor() {
    this.currencyContainer = document.getElementById("currencies-container");
    this.statPoolsContainer = document.getElementById("stat-pools-container");

    if (!this.currencyContainer) {
      console.error("[Everlyn] Missing #currencies-container in DOM.");
      document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #currencies-container in DOM.</pre>`
      );
    }
    if (!this.statPoolsContainer) {
      console.error("[Everlyn] Missing #stat-pools-container in DOM.");
      document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #stat-pools-container in DOM.</pre>`
      );
    }
  }

  update(state, defs) {
    if (!state || !defs) return;

    const resources = state.resources ? Object.values(state.resources) : [];
    
    const unlocked = resources.filter((r) => r.unlocked === true);

    const currencies = unlocked.filter((r) => defs.resources[r.id].type === "currency");
 
    const statPools = unlocked.filter((r) => defs.resources[r.id].type === "stat");

    if (this.currencyContainer) {
      this.currencyContainer.innerHTML = `
        <ul>
          ${currencies
            .map(
              (r) =>
                `<li>${defs.resources?.[r.id]?.name ?? r.id}: ${r.amount}/${r.maximum}</li>`
            )
            .join("")}
        </ul>`;
    }

    if (this.statPoolsContainer) {
      this.statPoolsContainer.innerHTML = `
        <ul>
          ${statPools
            .map(
              (r) =>
                `<li>${defs.resources?.[r.id]?.name ?? r.id}: ${r.amount}/${r.maximum}</li>`
            )
            .join("")}
        </ul>`;
    }
  }
}