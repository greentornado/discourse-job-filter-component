/**
 * UB Job Filter — Filter panel for tin-tuyen-dung category
 *
 * Adds two dropdown filters (Bank + Location) above the topic list
 * when viewing the tin-tuyen-dung category or tag pages.
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

const ALL_TAGS = Object.assign({}, BANK_DISPLAY, LOCATION_DISPLAY);

const CITIES = [
  "ha-noi",
  "ho-chi-minh",
  "hai-phong",
  "da-nang",
  "hue",
  "can-tho",
];

function injectStyles() {
  if (document.getElementById("ub-job-filter-style")) return;
  const style = document.createElement("style");
  style.id = "ub-job-filter-style";
  style.textContent = [
    "#ub-job-filter-panel { margin-bottom:15px; padding:12px 15px; background:var(--secondary); border:1px solid var(--primary-low); border-radius:6px; }",
    ".ub-job-filter-desc { font-size:0.9em; color:var(--primary-medium); margin-bottom:10px; }",
    ".ub-job-filter-row { display:flex !important; flex-direction:row !important; flex-wrap:nowrap !important; gap:12px; align-items:center; }",
    ".ub-job-filter-field { display:inline-flex !important; align-items:center; gap:6px; flex:1; }",
    ".ub-job-filter-field label { font-size:0.85em; font-weight:600; color:var(--primary-medium); white-space:nowrap; margin:0; }",
    ".ub-job-filter-field select { flex:1; min-width:0; padding:6px 10px; border:1px solid var(--primary-low); border-radius:4px; background:var(--secondary); color:var(--primary); font-size:0.9em; cursor:pointer; }",
    ".ub-job-filter-field select:focus { border-color:var(--tertiary); outline:none; }",
    ".ub-job-filter-actions { display:inline-flex !important; gap:6px; align-items:center; flex-shrink:0; }",
    ".ub-job-filter-actions .btn { min-width:70px; }",
    ".ub-job-filter-status { margin-top:8px; font-size:0.85em; color:var(--tertiary); font-weight:500; }",
    ".ub-job-filter-status:empty { display:none; }",
    "@media(max-width:600px) { .ub-job-filter-row { flex-direction:column !important; flex-wrap:wrap !important; gap:8px; } .ub-job-filter-field { width:100%; } .ub-job-filter-actions { width:100%; } .ub-job-filter-actions .btn { flex:1; } }",
  ].join("\n");
  document.head.appendChild(style);
}

function buildFilterPanel() {
  const panel = document.createElement("div");
  panel.id = "ub-job-filter-panel";

  const container = document.createElement("div");
  container.className = "ub-job-filter-container";

  // Description line
  const desc = document.createElement("div");
  desc.className = "ub-job-filter-desc";
  desc.textContent =
    "B\u1ea1n c\u00f3 th\u1ec3 l\u1ecdc tin tuy\u1ec3n d\u1ee5ng theo ng\u00e2n h\u00e0ng v\u00e0 \u0111\u1ecba \u0111i\u1ec3m";
  container.appendChild(desc);

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
  bankDefault.textContent = "\u2014 T\u1ea5t c\u1ea3 \u2014";
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
  locDefault.textContent = "\u2014 T\u1ea5t c\u1ea3 \u2014";
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

  // Restore selection from URL — handle both /tag/ and /tags/intersection/
  const path = window.location.pathname;
  let activeTags = [];

  const intersectionMatch = path.match(/\/tags\/intersection\/(.+)/);
  if (intersectionMatch) {
    activeTags = intersectionMatch[1].split("/");
  } else {
    const singleMatch = path.match(/\/tag\/([^/]+)/);
    if (singleMatch) {
      activeTags = [singleMatch[1]];
    }
  }

  activeTags.forEach((tag) => {
    if (BANK_DISPLAY[tag]) bankSelect.value = tag;
    if (LOCATION_DISPLAY[tag]) locationSelect.value = tag;
  });
}

function applyFilter() {
  const bank = document.getElementById("ub-filter-bank")?.value;
  const location = document.getElementById("ub-filter-location")?.value;

  const tags = [];
  if (bank) tags.push(bank);
  if (location) tags.push(location);

  if (tags.length === 0) {
    window.location.href = "/c/tin-tuyen-dung/" + CATEGORY_ID;
  } else if (tags.length === 1) {
    window.location.href = "/tag/" + tags[0];
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
    const isSingleTag = /\/tag\/([^/]+)/.test(url);

    // Only show on relevant pages
    if (!isCategoryPage && !isTagIntersection && !isSingleTag) return;

    // For single tag pages, only show if the tag is one of ours
    if (isSingleTag && !isTagIntersection && !isCategoryPage) {
      const tagMatch = url.match(/\/tag\/([^/]+)/);
      if (tagMatch && !ALL_TAGS[tagMatch[1]]) return;
    }

    setTimeout(() => {
      const target =
        document.querySelector(".list-controls") ||
        document.querySelector("#list-area") ||
        document.querySelector(".contents");
      if (!target) return;

      injectStyles();
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

      // Show active filter status
      const statusEl = document.getElementById("ub-filter-status");
      if ((isTagIntersection || isSingleTag) && statusEl) {
        let activeTags = [];
        const intMatch = url.match(/\/tags\/intersection\/(.+)/);
        if (intMatch) {
          activeTags = intMatch[1].split("/");
        } else {
          const singleMatch = url.match(/\/tag\/([^/]+)/);
          if (singleMatch) activeTags = [singleMatch[1]];
        }
        if (activeTags.length > 0) {
          const labels = activeTags.map(
            (t) => BANK_DISPLAY[t] || LOCATION_DISPLAY[t] || t
          );
          statusEl.textContent =
            "\u0110ang l\u1ecdc: " + labels.join(" + ");
        }
      }
    }, 500);
  });
});
