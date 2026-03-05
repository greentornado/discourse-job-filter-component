/**
 * UB Job Filter — Filter panel for tin-tuyen-dung category
 *
 * Adds two dropdown filters (Bank + Location) above the topic list
 * when viewing the tin-tuyen-dung category or tag intersection pages.
 * Uses Discourse Tag Groups populated via setup_forum_tags.py.
 */

import { apiInitializer } from "discourse/lib/api";

const CATEGORY_ID = 5;

const BANK_DISPLAY = {
  vietcombank: "Vietcombank",
  bidv: "BIDV",
  vietinbank: "VietinBank",
  agribank: "Agribank",
  techcombank: "Techcombank",
  mbbank: "MB Bank",
  vpbank: "VPBank",
  acb: "ACB",
  sacombank: "Sacombank",
  hdbank: "HDBank",
  tpbank: "TPBank",
  shb: "SHB",
  msb: "MSB",
  vib: "VIB",
  lpbank: "LPBank",
  ocb: "OCB",
  seabank: "SeABank",
  eximbank: "Eximbank",
  namabank: "Nam A Bank",
  baovietbank: "BaoViet Bank",
};

const LOCATION_DISPLAY = {
  "ha-noi": "H\u00e0 N\u1ed9i",
  "ho-chi-minh": "TP.HCM",
  "hai-phong": "H\u1ea3i Ph\u00f2ng",
  "da-nang": "\u0110\u00e0 N\u1eb5ng",
  hue: "Hu\u1ebf",
  "can-tho": "C\u1ea7n Th\u01a1",
  "lai-chau": "Lai Ch\u00e2u",
  "dien-bien": "\u0110i\u1ec7n Bi\u00ean",
  "son-la": "S\u01a1n La",
  "lang-son": "L\u1ea1ng S\u01a1n",
  "cao-bang": "Cao B\u1eb1ng",
  "tuyen-quang": "Tuy\u00ean Quang",
  "lao-cai": "L\u00e0o Cai",
  "thai-nguyen": "Th\u00e1i Nguy\u00ean",
  "phu-tho": "Ph\u00fa Th\u1ecd",
  "bac-ninh": "B\u1eafc Ninh",
  "hung-yen": "H\u01b0ng Y\u00ean",
  "ninh-binh": "Ninh B\u00ecnh",
  "quang-ninh": "Qu\u1ea3ng Ninh",
  "thanh-hoa": "Thanh H\u00f3a",
  "nghe-an": "Ngh\u1ec7 An",
  "ha-tinh": "H\u00e0 T\u0129nh",
  "quang-tri": "Qu\u1ea3ng Tr\u1ecb",
  "quang-ngai": "Qu\u1ea3ng Ng\u00e3i",
  "gia-lai": "Gia Lai",
  "khanh-hoa": "Kh\u00e1nh H\u00f2a",
  "lam-dong": "L\u00e2m \u0110\u1ed3ng",
  "dak-lak": "\u0110\u1eafk L\u1eafk",
  "dong-nai": "\u0110\u1ed3ng Nai",
  "tay-ninh": "T\u00e2y Ninh",
  "vinh-long": "V\u0129nh Long",
  "dong-thap": "\u0110\u1ed3ng Th\u00e1p",
  "ca-mau": "C\u00e0 Mau",
  "an-giang": "An Giang",
};

const CITIES = [
  "ha-noi",
  "ho-chi-minh",
  "hai-phong",
  "da-nang",
  "hue",
  "can-tho",
];

function buildFilterPanel() {
  const panel = document.createElement("div");
  panel.id = "ub-job-filter-panel";

  const container = document.createElement("div");
  container.className = "ub-job-filter-container";

  const row = document.createElement("div");
  row.className = "ub-job-filter-row";

  // Bank filter
  const bankField = document.createElement("div");
  bankField.className = "ub-job-filter-field";
  const bankLabel = document.createElement("label");
  bankLabel.setAttribute("for", "ub-filter-bank");
  bankLabel.textContent = "Ng\u00e2n h\u00e0ng";
  const bankSelect = document.createElement("select");
  bankSelect.id = "ub-filter-bank";
  const bankDefault = document.createElement("option");
  bankDefault.value = "";
  bankDefault.textContent = "— T\u1ea5t c\u1ea3 —";
  bankSelect.appendChild(bankDefault);
  bankField.appendChild(bankLabel);
  bankField.appendChild(bankSelect);

  // Location filter
  const locField = document.createElement("div");
  locField.className = "ub-job-filter-field";
  const locLabel = document.createElement("label");
  locLabel.setAttribute("for", "ub-filter-location");
  locLabel.textContent = "\u0110\u1ecba \u0111i\u1ec3m";
  const locSelect = document.createElement("select");
  locSelect.id = "ub-filter-location";
  const locDefault = document.createElement("option");
  locDefault.value = "";
  locDefault.textContent = "— T\u1ea5t c\u1ea3 —";
  locSelect.appendChild(locDefault);
  locField.appendChild(locLabel);
  locField.appendChild(locSelect);

  // Action buttons
  const actions = document.createElement("div");
  actions.className = "ub-job-filter-actions";
  const applyBtn = document.createElement("button");
  applyBtn.id = "ub-filter-apply";
  applyBtn.className = "btn btn-primary";
  applyBtn.textContent = "L\u1ecdc";
  const resetBtn = document.createElement("button");
  resetBtn.id = "ub-filter-reset";
  resetBtn.className = "btn btn-default";
  resetBtn.textContent = "B\u1ecf l\u1ecdc";
  actions.appendChild(applyBtn);
  actions.appendChild(resetBtn);

  row.appendChild(bankField);
  row.appendChild(locField);
  row.appendChild(actions);
  container.appendChild(row);

  // Status line
  const status = document.createElement("div");
  status.id = "ub-filter-status";
  status.className = "ub-job-filter-status";
  container.appendChild(status);

  panel.appendChild(container);
  return panel;
}

function populateDropdowns() {
  const bankSelect = document.getElementById("ub-filter-bank");
  const locationSelect = document.getElementById("ub-filter-location");
  if (!bankSelect || !locationSelect) return;

  Object.entries(BANK_DISPLAY)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach(([slug, name]) => {
      const opt = document.createElement("option");
      opt.value = slug;
      opt.textContent = name;
      bankSelect.appendChild(opt);
    });

  const cityGroup = document.createElement("optgroup");
  cityGroup.label = "Th\u00e0nh ph\u1ed1 tr\u1ef1c thu\u1ed9c TW";
  CITIES.forEach((slug) => {
    const opt = document.createElement("option");
    opt.value = slug;
    opt.textContent = LOCATION_DISPLAY[slug];
    cityGroup.appendChild(opt);
  });
  locationSelect.appendChild(cityGroup);

  const provinces = Object.keys(LOCATION_DISPLAY).filter(
    (k) => !CITIES.includes(k)
  );
  provinces.sort((a, b) =>
    LOCATION_DISPLAY[a].localeCompare(LOCATION_DISPLAY[b])
  );
  const provGroup = document.createElement("optgroup");
  provGroup.label = "T\u1ec9nh";
  provinces.forEach((slug) => {
    const opt = document.createElement("option");
    opt.value = slug;
    opt.textContent = LOCATION_DISPLAY[slug];
    provGroup.appendChild(opt);
  });
  locationSelect.appendChild(provGroup);

  const tagMatch = window.location.pathname.match(
    /\/tags\/intersection\/(.+)/
  );
  if (tagMatch) {
    const tags = tagMatch[1].split("/");
    tags.forEach((tag) => {
      if (BANK_DISPLAY[tag]) bankSelect.value = tag;
      if (LOCATION_DISPLAY[tag]) locationSelect.value = tag;
    });
  }
}

function applyFilter() {
  const bank = document.getElementById("ub-filter-bank")?.value;
  const location = document.getElementById("ub-filter-location")?.value;

  const tags = [];
  if (bank) tags.push(bank);
  if (location) tags.push(location);

  if (tags.length === 0) {
    window.location.href = "/c/tin-tuyen-dung/" + CATEGORY_ID;
  } else {
    window.location.href = "/tags/intersection/" + tags.join("/");
  }
}

function resetFilter() {
  window.location.href = "/c/tin-tuyen-dung/" + CATEGORY_ID;
}

export default apiInitializer("1.0", (api) => {
  api.onPageChange((url) => {
    const existing = document.getElementById("ub-job-filter-panel");
    if (existing) existing.remove();

    const isCategoryPage = url.includes("/c/tin-tuyen-dung/");
    const isTagIntersection = url.includes("/tags/intersection/");

    if (!isCategoryPage && !isTagIntersection) return;

    setTimeout(() => {
      const target =
        document.querySelector(".list-controls") ||
        document.querySelector("#list-area") ||
        document.querySelector(".contents");
      if (!target) return;

      const panel = buildFilterPanel();
      target.parentNode.insertBefore(panel, target);
      populateDropdowns();

      document
        .getElementById("ub-filter-apply")
        ?.addEventListener("click", applyFilter);
      document
        .getElementById("ub-filter-reset")
        ?.addEventListener("click", resetFilter);

      ["ub-filter-bank", "ub-filter-location"].forEach((id) => {
        document.getElementById(id)?.addEventListener("keydown", (e) => {
          if (e.key === "Enter") applyFilter();
        });
      });

      const statusEl = document.getElementById("ub-filter-status");
      if (isTagIntersection && statusEl) {
        const tagMatch = url.match(/\/tags\/intersection\/(.+)/);
        if (tagMatch) {
          const parts = tagMatch[1].split("/");
          const labels = parts.map(
            (t) => BANK_DISPLAY[t] || LOCATION_DISPLAY[t] || t
          );
          statusEl.textContent = "\u0110ang l\u1ecdc: " + labels.join(" + ");
        }
      }
    }, 500);
  });
});
