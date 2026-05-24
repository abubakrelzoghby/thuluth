/**
 * Thuluth Meeting — Multi-File PWA
 * UI, localization, prayer times API, night calculation, dynamic manifest, service worker.
 */

'use strict';

// ---------------------------------------------------------------------------
// Localization
// ---------------------------------------------------------------------------

const STRINGS = {
  ar: {
    appTitle: 'اجتماع الثلث',
    appSubtitle: 'حساب ثلث الليل ونصف الليل',
    locationTitle: 'اختر موقعك',
    countryLabel: 'الدولة',
    countryPlaceholder: '— اختر الدولة —',
    cityLabel: 'المدينة',
    citySearchPlaceholder: 'ابحث عن مدينتك...',
    cityHint: 'اختر مدينة من القائمة أدناه',
    selectedLocationLabel: 'الموقع المحدد',
    prayerTimesTitle: 'أوقات الصلاة',
    loadingPrayerTimes: 'جاري تحميل أوقات الصلاة...',
    retryButton: 'إعادة المحاولة',
    todayLabel: 'اليوم',
    tomorrowLabel: 'غداً',
    errorFetchFailed: 'تعذر تحميل أوقات الصلاة. تحقق من الاتصال وحاول مرة أخرى.',
    errorOffline: 'أنت غير متصل بالإنترنت. التطبيق يعمل دون اتصال — أعد المحاولة عند عودة الشبكة.',
    errorInvalidLocation: 'لم يتم العثور على أوقات الصلاة لهذا الموقع. جرّب مدينة أخرى.',
    refreshPrayerTimes: 'تحديث الأوقات',
    prayerFajr: 'الفجر',
    prayerDhuhr: 'الظهر',
    prayerAsr: 'العصر',
    prayerMaghrib: 'المغرب',
    prayerIsha: 'العشاء',
    nightCalcTitle: 'ثلث الليل',
    nightModeLabel: 'طريقة حساب الليل',
    nightModeMaghrib: 'من المغرب اليوم إلى الفجر غداً',
    nightModeIsha: 'من العشاء اليوم إلى الفجر غداً',
    nightModeHint: 'عطّل: المغرب → الفجر | فعّل: العشاء → الفجر',
    nightTotal: 'مدة الليل الكاملة',
    nightOneThird: 'ثلث الليل',
    nightHalf: 'نصف الليل (المدة)',
    nightTwoThirds: 'ثلثا الليل',
    islamicMidnight: 'نصف الليل الشرعي',
    lastThirdStart: 'بداية الثلث الأخير',
    islamicMidnightHint: 'وقت انتهاء النصف الأول من الليل',
    lastThirdStartHint: 'وقت بداية الثلث الأخير — للتهجد والقيام',
    footerText: 'تطبيق مجاني — يعمل بالكامل على جهازك',
    langToggleLabel: 'EN',
    pageTitle: 'اجتماع الثلث | Thuluth Meeting',
    noCitiesFound: 'لا توجد مدن مطابقة',
    selectCountryFirst: 'اختر الدولة أولاً',
  },
  en: {
    appTitle: 'Thuluth Meeting',
    appSubtitle: 'Islamic night thirds & midnight',
    locationTitle: 'Select your location',
    countryLabel: 'Country',
    countryPlaceholder: '— Select country —',
    cityLabel: 'City',
    citySearchPlaceholder: 'Search for your city...',
    cityHint: 'Choose a city from the list below',
    selectedLocationLabel: 'Selected location',
    prayerTimesTitle: 'Prayer Times',
    loadingPrayerTimes: 'Loading prayer times...',
    retryButton: 'Try again',
    todayLabel: 'Today',
    tomorrowLabel: 'Tomorrow',
    errorFetchFailed: 'Could not load prayer times. Check your connection and try again.',
    errorOffline: 'You are offline. The app shell works offline — retry when you are back online.',
    errorInvalidLocation: 'Prayer times not found for this location. Try another city.',
    refreshPrayerTimes: 'Refresh times',
    prayerFajr: 'Fajr',
    prayerDhuhr: 'Dhuhr',
    prayerAsr: 'Asr',
    prayerMaghrib: 'Maghrib',
    prayerIsha: 'Isha',
    nightCalcTitle: 'Night Thirds',
    nightModeLabel: 'Night calculation mode',
    nightModeMaghrib: 'From today\'s Maghrib to tomorrow\'s Fajr',
    nightModeIsha: 'From today\'s Isha to tomorrow\'s Fajr',
    nightModeHint: 'OFF: Maghrib → Fajr | ON: Isha → Fajr',
    nightTotal: 'Total night duration',
    nightOneThird: 'One third of the night',
    nightHalf: 'Half of the night (duration)',
    nightTwoThirds: 'Two thirds of the night',
    islamicMidnight: 'Islamic Midnight',
    lastThirdStart: 'Start of Last Third',
    islamicMidnightHint: 'When the first half of the night ends',
    lastThirdStartHint: 'Start of the final third — for Tahajjud/Qiyam',
    footerText: 'Free app — runs entirely on your device',
    langToggleLabel: 'عربي',
    pageTitle: 'Thuluth Meeting | اجتماع الثلث',
    noCitiesFound: 'No matching cities',
    selectCountryFirst: 'Select a country first',
  },
};

const STORAGE_KEYS = {
  language: 'iqraa_lang',
  country: 'iqraa_country',
  city: 'iqraa_city',
  nightModeIsha: 'iqraa_night_isha',
};

// Localized Web App Manifest files (app.js switches href on language change)
const MANIFEST_BY_LANG = {
  ar: 'manifest.ar.json',
  en: 'manifest.en.json',
};

const PWA_META = {
  ar: {
    appleTitle: 'ثلث الليل',
    description: 'حساب ثلث الليل ونصف الليل الشرعي من أوقات الصلاة',
  },
  en: {
    appleTitle: 'Night Calc',
    description: 'Islamic night thirds and midnight from prayer times',
  },
};

const API_BASE = 'https://api.aladhan.com/v1/timingsByCity';
const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Aladhan calculation methods — https://aladhan.com/calculation-methods
const COUNTRY_METHOD = {
  'Egypt': 5,                      // Egyptian General Authority of Survey
  'Saudi Arabia': 4,               // Umm Al-Qura
  'United Arab Emirates': 8,     // Gulf Region
  'Kuwait': 9,
  'Qatar': 10,
  'Bahrain': 8,
  'Oman': 8,
  'Singapore': 11,
  'France': 12,
  'Turkey': 13,
  'Russia': 14,
  'Pakistan': 1,                   // University of Islamic Sciences, Karachi
  'India': 1,
  'Bangladesh': 1,
  'Afghanistan': 1,
  'United States': 2,              // ISNA
  'Canada': 2,
  'Iran': 7,
};
const DEFAULT_METHOD = 3; // Muslim World League

const PRAYER_I18N_KEYS = {
  Fajr: 'prayerFajr',
  Dhuhr: 'prayerDhuhr',
  Asr: 'prayerAsr',
  Maghrib: 'prayerMaghrib',
  Isha: 'prayerIsha',
};

// ---------------------------------------------------------------------------
// Locations (Aladhan API: city + country parameters)
// ---------------------------------------------------------------------------

const LOCATIONS = [
  { country: 'Saudi Arabia', cities: ['Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam', 'Tabuk', 'Abha', 'Buraidah'] },
  { country: 'United Arab Emirates', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain'] },
  { country: 'Qatar', cities: ['Doha', 'Al Wakrah', 'Al Khor'] },
  { country: 'Kuwait', cities: ['Kuwait City', 'Hawalli', 'Salmiya'] },
  { country: 'Bahrain', cities: ['Manama', 'Muharraq', 'Riffa'] },
  { country: 'Oman', cities: ['Muscat', 'Salalah', 'Sohar', 'Nizwa'] },
  { country: 'Yemen', cities: ['Sanaa', 'Aden', 'Taiz', 'Hodeidah'] },
  { country: 'Iraq', cities: ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Najaf', 'Karbala'] },
  { country: 'Syria', cities: ['Damascus', 'Aleppo', 'Homs', 'Latakia'] },
  { country: 'Jordan', cities: ['Amman', 'Zarqa', 'Irbid', 'Aqaba'] },
  { country: 'Lebanon', cities: ['Beirut', 'Tripoli', 'Sidon', 'Tyre'] },
  { country: 'Palestine', cities: ['Jerusalem', 'Gaza', 'Ramallah', 'Nablus', 'Hebron'] },
  { country: 'Egypt', cities: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Tanta', 'Mansoura'] },
  { country: 'Libya', cities: ['Tripoli', 'Benghazi', 'Misrata'] },
  { country: 'Tunisia', cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan'] },
  { country: 'Algeria', cities: ['Algiers', 'Oran', 'Constantine', 'Annaba'] },
  { country: 'Morocco', cities: ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir'] },
  { country: 'Sudan', cities: ['Khartoum', 'Omdurman', 'Port Sudan'] },
  { country: 'Somalia', cities: ['Mogadishu', 'Hargeisa', 'Kismayo'] },
  { country: 'Turkey', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Konya'] },
  { country: 'Iran', cities: ['Tehran', 'Mashhad', 'Isfahan', 'Shiraz', 'Tabriz'] },
  { country: 'Pakistan', cities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Quetta'] },
  { country: 'India', cities: ['Mumbai', 'Delhi', 'Hyderabad', 'Lucknow', 'Bhopal', 'Srinagar', 'Ahmedabad'] },
  { country: 'Bangladesh', cities: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'] },
  { country: 'Afghanistan', cities: ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif'] },
  { country: 'Malaysia', cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Kota Kinabalu'] },
  { country: 'Indonesia', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Makassar', 'Aceh'] },
  { country: 'Brunei', cities: ['Bandar Seri Begawan'] },
  { country: 'Singapore', cities: ['Singapore'] },
  { country: 'Thailand', cities: ['Bangkok', 'Pattani', 'Yala'] },
  { country: 'Philippines', cities: ['Manila', 'Marawi', 'Cotabato'] },
  { country: 'Nigeria', cities: ['Lagos', 'Kano', 'Abuja', 'Ibadan', 'Kaduna'] },
  { country: 'Senegal', cities: ['Dakar', 'Touba', 'Thies'] },
  { country: 'Mali', cities: ['Bamako', 'Timbuktu', 'Gao'] },
  { country: 'United Kingdom', cities: ['London', 'Birmingham', 'Manchester', 'Bradford', 'Leicester', 'Glasgow'] },
  { country: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Dearborn', 'Dallas', 'Washington'] },
  { country: 'Canada', cities: ['Toronto', 'Montreal', 'Vancouver', 'Ottawa', 'Calgary', 'Edmonton'] },
  { country: 'France', cities: ['Paris', 'Marseille', 'Lyon', 'Lille'] },
  { country: 'Germany', cities: ['Berlin', 'Munich', 'Frankfurt', 'Cologne', 'Hamburg'] },
  { country: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'] },
  { country: 'Belgium', cities: ['Brussels', 'Antwerp', 'Ghent'] },
  { country: 'Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmo'] },
  { country: 'Norway', cities: ['Oslo', 'Bergen', 'Trondheim'] },
  { country: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  { country: 'New Zealand', cities: ['Auckland', 'Wellington', 'Christchurch'] },
  { country: 'South Africa', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'] },
  { country: 'Kenya', cities: ['Nairobi', 'Mombasa', 'Kisumu'] },
  { country: 'Tanzania', cities: ['Dar es Salaam', 'Zanzibar City', 'Dodoma'] },
  { country: 'Albania', cities: ['Tirana', 'Durres', 'Shkoder'] },
  { country: 'Bosnia and Herzegovina', cities: ['Sarajevo', 'Mostar', 'Tuzla'] },
  { country: 'Kosovo', cities: ['Pristina', 'Prizren', 'Peja'] },
  { country: 'Russia', cities: ['Moscow', 'Kazan', 'Ufa', 'Makhachkala'] },
  { country: 'China', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Urumqi', 'Xian'] },
  { country: 'Japan', cities: ['Tokyo', 'Osaka', 'Yokohama'] },
  { country: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon'] },
];

// Remove duplicate Morocco entry (empty cities array was a mistake)
const LOCATIONS_CLEAN = LOCATIONS.filter(
  (entry, index, arr) =>
    entry.cities.length > 0 &&
    arr.findIndex((e) => e.country === entry.country) === index
);

// Sort countries alphabetically
const SORTED_LOCATIONS = [...LOCATIONS_CLEAN].sort((a, b) =>
  a.country.localeCompare(b.country)
);

// ---------------------------------------------------------------------------
// App State
// ---------------------------------------------------------------------------

const state = {
  lang: 'ar',
  country: '',
  city: '',
  prayerTimes: {
    loading: false,
    errorKey: null,
    today: null,
    tomorrow: null,
  },
  nightModeIsha: false,
  nightCalc: null,
};

let fetchAbortController = null;

// ---------------------------------------------------------------------------
// DOM References
// ---------------------------------------------------------------------------

const dom = {};

function cacheDom() {
  dom.html = document.documentElement;
  dom.langToggle = document.getElementById('langToggle');
  dom.langToggleLabel = document.getElementById('langToggleLabel');
  dom.countrySelect = document.getElementById('countrySelect');
  dom.citySearch = document.getElementById('citySearch');
  dom.citySelect = document.getElementById('citySelect');
  dom.cityHint = document.getElementById('cityHint');
  dom.selectedLocation = document.getElementById('selectedLocation');
  dom.selectedLocationText = document.getElementById('selectedLocationText');
  dom.prayerTimesSection = document.getElementById('prayerTimesSection');
  dom.prayerLoading = document.getElementById('prayerLoading');
  dom.prayerError = document.getElementById('prayerError');
  dom.prayerErrorMessage = document.getElementById('prayerErrorMessage');
  dom.prayerRetryBtn = document.getElementById('prayerRetryBtn');
  dom.prayerRefreshBtn = document.getElementById('prayerRefreshBtn');
  dom.prayerData = document.getElementById('prayerData');
  dom.todayPrayers = document.getElementById('todayPrayers');
  dom.tomorrowPrayers = document.getElementById('tomorrowPrayers');
  dom.nightCalcSection = document.getElementById('nightCalcSection');
  dom.nightModeToggle = document.getElementById('nightModeToggle');
  dom.nightModeDescription = document.getElementById('nightModeDescription');
  dom.nightKeyResults = document.getElementById('nightKeyResults');
  dom.nightDurationGrid = document.getElementById('nightDurationGrid');
}

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------

function t(key) {
  return STRINGS[state.lang][key] ?? STRINGS.en[key] ?? key;
}

function getPrayerErrorMessage(errorKey) {
  if (errorKey === 'invalid') return t('errorInvalidLocation');
  if (errorKey === 'offline') return t('errorOffline');
  return t('errorFetchFailed');
}

// ---------------------------------------------------------------------------
// PWA — dynamic manifest, service worker (native install prompt; no custom UI)
// ---------------------------------------------------------------------------

function getManifestHref(lang) {
  const file = MANIFEST_BY_LANG[lang] || MANIFEST_BY_LANG.ar;
  // Query param documents active locale for debugging and optional server routing
  return `${file}?lang=${lang}`;
}

function updateWebManifest(lang) {
  const href = getManifestHref(lang);
  let link = document.getElementById('pwaManifest');

  if (!link) {
    link = document.createElement('link');
    link.id = 'pwaManifest';
    link.rel = 'manifest';
    document.head.appendChild(link);
  }

  if (link.getAttribute('href') !== href) {
    link.setAttribute('href', href);
  }

  const meta = PWA_META[lang] || PWA_META.ar;

  const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appleTitle) {
    appleTitle.setAttribute('content', meta.appleTitle);
  }

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', meta.description);
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || window.location.protocol === 'file:') {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
  });
}

function applyLanguage(lang) {
  state.lang = lang;
  const isRtl = lang === 'ar';

  dom.html.lang = lang;
  dom.html.dir = isRtl ? 'rtl' : 'ltr';
  document.body.setAttribute('dir', dom.html.dir);
  document.body.style.fontFamily = isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif";
  document.title = t('pageTitle');
  dom.langToggleLabel.textContent = t('langToggleLabel');
  dom.langToggle.setAttribute('aria-label', isRtl ? 'Switch to English' : 'التبديل إلى العربية');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (STRINGS[lang][key]) {
      el.textContent = STRINGS[lang][key];
    }
  });

  if (dom.citySearch) {
    dom.citySearch.placeholder = t('citySearchPlaceholder');
  }

  rebuildCountryOptions();
  if (state.country) {
    populateCities(state.country);
  }

  updateSelectedLocationDisplay();

  if (state.prayerTimes.today) {
    renderPrayerTimes();
    renderNightCalc();
  } else if (state.prayerTimes.errorKey && dom.prayerErrorMessage) {
    dom.prayerErrorMessage.textContent = getPrayerErrorMessage(state.prayerTimes.errorKey);
  }

  if (dom.prayerRefreshBtn) {
    dom.prayerRefreshBtn.setAttribute('aria-label', t('refreshPrayerTimes'));
  }

  updateNightModeUI();
  updateWebManifest(lang);

  localStorage.setItem(STORAGE_KEYS.language, lang);
}

function toggleLanguage() {
  applyLanguage(state.lang === 'ar' ? 'en' : 'ar');
}

// ---------------------------------------------------------------------------
// Location UI
// ---------------------------------------------------------------------------

function rebuildCountryOptions() {
  const select = dom.countrySelect;
  const current = state.country;
  const placeholder = t('countryPlaceholder');

  select.innerHTML = '';
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = placeholder;
  select.appendChild(defaultOpt);

  SORTED_LOCATIONS.forEach(({ country }) => {
    const opt = document.createElement('option');
    opt.value = country;
    opt.textContent = country;
    select.appendChild(opt);
  });

  if (current && SORTED_LOCATIONS.some((l) => l.country === current)) {
    select.value = current;
  }
}

function getCitiesForCountry(country) {
  const entry = SORTED_LOCATIONS.find((l) => l.country === country);
  return entry ? [...entry.cities].sort((a, b) => a.localeCompare(b)) : [];
}

function populateCities(country, filter = '') {
  const cities = getCitiesForCountry(country);
  const query = filter.trim().toLowerCase();
  const filtered = query
    ? cities.filter((c) => c.toLowerCase().includes(query))
    : cities;

  dom.citySelect.innerHTML = '';

  if (filtered.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = query ? t('noCitiesFound') : t('selectCountryFirst');
    opt.disabled = true;
    dom.citySelect.appendChild(opt);
    dom.citySelect.disabled = true;
    return;
  }

  filtered.forEach((city) => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    dom.citySelect.appendChild(opt);
  });

  dom.citySelect.disabled = false;

  if (state.city && filtered.includes(state.city)) {
    dom.citySelect.value = state.city;
  } else if (filtered.length === 1) {
    selectCity(filtered[0]);
  }
}

function showCityControls(show) {
  dom.citySearch.disabled = !show;
  dom.citySelect.classList.toggle('hidden', !show);
  dom.cityHint.classList.toggle('hidden', !show);

  if (show) {
    dom.citySelect.classList.remove('hidden');
    dom.cityHint.classList.remove('hidden');
  }
}

function onCountryChange() {
  const country = dom.countrySelect.value;
  state.country = country;
  state.city = '';

  dom.citySearch.value = '';
  dom.selectedLocation.classList.add('hidden');

  if (!country) {
    showCityControls(false);
    dom.citySelect.innerHTML = '';
    dom.citySelect.disabled = true;
    clearPrayerTimes();
    localStorage.removeItem(STORAGE_KEYS.country);
    localStorage.removeItem(STORAGE_KEYS.city);
    return;
  }

  clearPrayerTimes();

  showCityControls(true);
  populateCities(country);
  localStorage.setItem(STORAGE_KEYS.country, country);
  localStorage.removeItem(STORAGE_KEYS.city);
}

function onCitySearchInput() {
  if (!state.country) return;
  populateCities(state.country, dom.citySearch.value);
  dom.citySelect.classList.remove('hidden');
}

function selectCity(city) {
  if (!city || !state.country) return;

  state.city = city;
  dom.citySelect.value = city;
  dom.citySearch.value = city;

  localStorage.setItem(STORAGE_KEYS.city, city);
  updateSelectedLocationDisplay();
  fetchPrayerTimes();
}

function onCitySelectChange() {
  const city = dom.citySelect.value;
  if (city) selectCity(city);
}

function updateSelectedLocationDisplay() {
  if (!state.country || !state.city) {
    dom.selectedLocation.classList.add('hidden');
    return;
  }

  const separator = state.lang === 'ar' ? '، ' : ', ';
  dom.selectedLocationText.textContent = `${state.city}${separator}${state.country}`;
  dom.selectedLocation.classList.remove('hidden');
}

function restoreSavedLocation() {
  const savedCountry = localStorage.getItem(STORAGE_KEYS.country);
  const savedCity = localStorage.getItem(STORAGE_KEYS.city);

  if (savedCountry && SORTED_LOCATIONS.some((l) => l.country === savedCountry)) {
    dom.countrySelect.value = savedCountry;
    state.country = savedCountry;
    showCityControls(true);
    populateCities(savedCountry);

    if (savedCity && getCitiesForCountry(savedCountry).includes(savedCity)) {
      selectCity(savedCity);
    }
  }
}

// ---------------------------------------------------------------------------
// Prayer Times API (Phase 2)
// ---------------------------------------------------------------------------

function formatApiDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

function parseGregorianDate(dateStr) {
  const [d, m, y] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addOneDayGregorian(dateStr) {
  const date = parseGregorianDate(dateStr);
  date.setDate(date.getDate() + 1);
  return formatApiDate(date);
}

function getCalculationMethod(country) {
  return COUNTRY_METHOD[country] ?? DEFAULT_METHOD;
}

function cleanTime(timeStr) {
  if (!timeStr) return '—';
  return String(timeStr).split(' ')[0].trim();
}

function buildTimingsUrl(city, country, dateStr = null) {
  const params = new URLSearchParams({
    city,
    country,
    method: String(getCalculationMethod(country)),
  });
  // Aladhan expects DD-MM-YYYY in the URL path, not as a query parameter
  const base = dateStr ? `${API_BASE}/${dateStr}` : API_BASE;
  return `${base}?${params.toString()}`;
}

function parseDayPayload(json) {
  if (!json || json.code !== 200 || !json.data?.timings) {
    return null;
  }

  const { timings, date } = json.data;
  const prayers = {};

  PRAYER_KEYS.forEach((key) => {
    prayers[key] = cleanTime(timings[key]);
  });

  const hijri = date.hijri;
  const hijriLabel = hijri
    ? state.lang === 'ar'
      ? `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`
      : `${hijri.day} ${hijri.month.en} ${hijri.year} AH`
    : '';

  return {
    prayers,
    readableDate: date.readable,
    gregorian: date.gregorian?.date ?? '',
    hijri: hijriLabel,
  };
}

async function fetchTimingsForDate(city, country, dateStr, signal) {
  const url = buildTimingsUrl(city, country, dateStr);
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json = await response.json();
  const parsed = parseDayPayload(json);

  if (!parsed) {
    throw new Error('INVALID_RESPONSE');
  }

  return parsed;
}

function showPrayerSection() {
  dom.prayerTimesSection.classList.remove('hidden');
  dom.prayerTimesSection.removeAttribute('aria-hidden');
}

function hidePrayerSection() {
  dom.prayerTimesSection.classList.add('hidden');
  dom.prayerTimesSection.setAttribute('aria-hidden', 'true');
}

function setPrayerView(view) {
  dom.prayerLoading.classList.toggle('hidden', view !== 'loading');
  dom.prayerLoading.classList.toggle('flex', view === 'loading');
  dom.prayerError.classList.toggle('hidden', view !== 'error');
  dom.prayerData.classList.toggle('hidden', view !== 'data');
  dom.prayerRefreshBtn.classList.toggle('hidden', view !== 'data');
  dom.prayerRefreshBtn.classList.toggle('flex', view === 'data');
}

function clearPrayerTimes() {
  if (fetchAbortController) {
    fetchAbortController.abort();
    fetchAbortController = null;
  }

  state.prayerTimes = {
    loading: false,
    errorKey: null,
    today: null,
    tomorrow: null,
  };

  hidePrayerSection();
  setPrayerView('loading');
  dom.todayPrayers.innerHTML = '';
  dom.tomorrowPrayers.innerHTML = '';
  clearNightCalc();
}

function renderPrayerDayCard(dayKey, dayData) {
  const label = dayKey === 'today' ? t('todayLabel') : t('tomorrowLabel');
  const rows = PRAYER_KEYS.map((key) => {
    const name = t(PRAYER_I18N_KEYS[key]);
    const time = dayData.prayers[key];
    return `
      <div class="flex items-center justify-between gap-2 border-b border-slate-100 py-2.5 last:border-0">
        <span class="text-sm font-medium text-slate-600">${name}</span>
        <span class="font-mono text-sm font-bold tabular-nums text-brand-800">${time}</span>
      </div>
    `;
  }).join('');

  const dateLine = [dayData.readableDate, dayData.hijri].filter(Boolean).join(' · ');

  return `
    <article class="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <div class="mb-3 flex items-start justify-between gap-2">
        <h3 class="text-sm font-bold text-brand-900">${label}</h3>
        <span class="rounded-lg bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">${dayData.gregorian}</span>
      </div>
      <p class="mb-3 text-xs text-slate-500">${dateLine}</p>
      <div>${rows}</div>
    </article>
  `;
}

function renderPrayerTimes() {
  const { today, tomorrow } = state.prayerTimes;
  if (!today || !tomorrow) return;

  dom.todayPrayers.innerHTML = renderPrayerDayCard('today', today);
  dom.tomorrowPrayers.innerHTML = renderPrayerDayCard('tomorrow', tomorrow);
  setPrayerView('data');
}

async function fetchPrayerTimes() {
  const { country, city } = state;
  if (!country || !city) return;

  if (fetchAbortController) {
    fetchAbortController.abort();
  }

  fetchAbortController = new AbortController();
  const { signal } = fetchAbortController;

  state.prayerTimes.loading = true;
  state.prayerTimes.errorKey = null;
  showPrayerSection();
  setPrayerView('loading');

  if (!navigator.onLine) {
    state.prayerTimes.loading = false;
    state.prayerTimes.errorKey = 'offline';
    dom.prayerErrorMessage.textContent = getPrayerErrorMessage('offline');
    setPrayerView('error');
    fetchAbortController = null;
    return;
  }

  try {
    // Fetch today first (no date = city's local today). Tomorrow is derived from API date.
    const todayData = await fetchTimingsForDate(city, country, null, signal);
    if (signal.aborted) return;

    const tomorrowDateStr = addOneDayGregorian(todayData.gregorian);
    const tomorrowData = await fetchTimingsForDate(city, country, tomorrowDateStr, signal);
    if (signal.aborted) return;

    state.prayerTimes.today = todayData;
    state.prayerTimes.tomorrow = tomorrowData;
    state.prayerTimes.loading = false;
    state.prayerTimes.errorKey = null;

    renderPrayerTimes();
    calculateAndRenderNight();
  } catch (err) {
    if (err.name === 'AbortError') return;

    state.prayerTimes.loading = false;
    const isOffline = !navigator.onLine || err.message === 'Failed to fetch';
    state.prayerTimes.errorKey = isOffline
      ? 'offline'
      : (err.message === 'INVALID_RESPONSE' ? 'invalid' : 'fetch');

    dom.prayerErrorMessage.textContent = getPrayerErrorMessage(state.prayerTimes.errorKey);
    setPrayerView('error');
  } finally {
    if (!signal.aborted) {
      fetchAbortController = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Night Calculation (Phase 3)
// ---------------------------------------------------------------------------

function parseTimeOnDate(gregorianDateStr, timeStr) {
  const [day, month, year] = gregorianDateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function formatClockTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (state.lang === 'ar') {
    return `${hours} س ${minutes} د`;
  }
  return `${hours}h ${minutes}m`;
}

function addMsToDate(date, ms) {
  return new Date(date.getTime() + ms);
}

function calculateNightTimes(today, tomorrow, useIsha) {
  const startKey = useIsha ? 'Isha' : 'Maghrib';
  const nightStart = parseTimeOnDate(today.gregorian, today.prayers[startKey]);
  const nightEnd = parseTimeOnDate(tomorrow.gregorian, tomorrow.prayers.Fajr);

  let totalMs = nightEnd.getTime() - nightStart.getTime();
  if (totalMs <= 0) {
    totalMs += 24 * 60 * 60 * 1000;
  }

  const oneThirdMs = totalMs / 3;
  const halfMs = totalMs / 2;
  const twoThirdsMs = (2 * totalMs) / 3;

  const islamicMidnight = addMsToDate(nightStart, halfMs);
  const lastThirdStart = addMsToDate(nightStart, twoThirdsMs);

  return {
    mode: useIsha ? 'isha' : 'maghrib',
    nightStart: formatClockTime(nightStart),
    nightEnd: formatClockTime(nightEnd),
    startKey,
    totalMs,
    oneThirdMs,
    halfMs,
    twoThirdsMs,
    islamicMidnight: formatClockTime(islamicMidnight),
    lastThirdStart: formatClockTime(lastThirdStart),
  };
}

function updateNightModeUI() {
  if (!dom.nightModeToggle) return;

  const isOn = state.nightModeIsha;
  dom.nightModeToggle.setAttribute('aria-checked', String(isOn));
  dom.nightModeToggle.dataset.on = String(isOn);

  if (dom.nightModeDescription) {
    dom.nightModeDescription.textContent = t(isOn ? 'nightModeIsha' : 'nightModeMaghrib');
  }

  dom.nightModeToggle.setAttribute(
    'aria-label',
    state.lang === 'ar'
      ? (isOn ? 'الوضع: العشاء إلى الفجر' : 'الوضع: المغرب إلى الفجر')
      : (isOn ? 'Mode: Isha to Fajr' : 'Mode: Maghrib to Fajr')
  );
}

function toggleNightMode() {
  state.nightModeIsha = !state.nightModeIsha;
  localStorage.setItem(STORAGE_KEYS.nightModeIsha, state.nightModeIsha ? '1' : '0');
  updateNightModeUI();
  calculateAndRenderNight();
}

function showNightCalcSection() {
  dom.nightCalcSection.classList.remove('hidden');
  dom.nightCalcSection.removeAttribute('aria-hidden');
}

function hideNightCalcSection() {
  dom.nightCalcSection.classList.add('hidden');
  dom.nightCalcSection.setAttribute('aria-hidden', 'true');
}

function clearNightCalc() {
  state.nightCalc = null;
  hideNightCalcSection();
  if (dom.nightKeyResults) dom.nightKeyResults.innerHTML = '';
  if (dom.nightDurationGrid) dom.nightDurationGrid.innerHTML = '';
}

function renderKeyResultCard(title, hint, time, highlight = false) {
  const bg = highlight
    ? 'border-brand-300 bg-gradient-to-br from-brand-700 to-brand-800 text-white'
    : 'border-brand-200 bg-brand-50 text-brand-900';
  const labelClass = highlight ? 'text-brand-100' : 'text-brand-600';
  const hintClass = highlight ? 'text-brand-200' : 'text-slate-500';
  const timeClass = highlight ? 'text-white' : 'text-brand-800';

  return `
    <article class="rounded-xl border p-4 shadow-soft ${bg}">
      <p class="text-xs font-semibold ${labelClass}">${title}</p>
      <p class="mt-2 font-mono text-3xl font-bold tabular-nums ${timeClass}">${time}</p>
      <p class="mt-1.5 text-[11px] leading-relaxed ${hintClass}">${hint}</p>
    </article>
  `;
}

function renderDurationTile(label, duration) {
  return `
    <div class="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
      <p class="text-[11px] font-medium text-slate-500">${label}</p>
      <p class="mt-1 font-mono text-sm font-bold tabular-nums text-brand-800">${duration}</p>
    </div>
  `;
}

function renderNightCalc() {
  const calc = state.nightCalc;
  if (!calc) return;

  dom.nightKeyResults.innerHTML = [
    renderKeyResultCard(t('islamicMidnight'), t('islamicMidnightHint'), calc.islamicMidnight, true),
    renderKeyResultCard(t('lastThirdStart'), t('lastThirdStartHint'), calc.lastThirdStart, true),
  ].join('');

  dom.nightDurationGrid.innerHTML = [
    renderDurationTile(t('nightTotal'), formatDuration(calc.totalMs)),
    renderDurationTile(t('nightOneThird'), formatDuration(calc.oneThirdMs)),
    renderDurationTile(t('nightHalf'), formatDuration(calc.halfMs)),
    renderDurationTile(t('nightTwoThirds'), formatDuration(calc.twoThirdsMs)),
  ].join('');

  showNightCalcSection();
}

function calculateAndRenderNight() {
  const { today, tomorrow } = state.prayerTimes;
  if (!today || !tomorrow) {
    clearNightCalc();
    return;
  }

  state.nightCalc = calculateNightTimes(today, tomorrow, state.nightModeIsha);
  renderNightCalc();
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function bindEvents() {
  dom.langToggle.addEventListener('click', toggleLanguage);
  dom.countrySelect.addEventListener('change', onCountryChange);
  dom.citySearch.addEventListener('input', onCitySearchInput);
  dom.citySearch.addEventListener('focus', () => {
    if (state.country) dom.citySelect.classList.remove('hidden');
  });
  dom.citySelect.addEventListener('change', onCitySelectChange);
  dom.citySelect.addEventListener('click', (e) => {
    if (e.target.tagName === 'OPTION' && e.target.value) {
      selectCity(e.target.value);
    }
  });

  dom.prayerRetryBtn.addEventListener('click', fetchPrayerTimes);
  dom.prayerRefreshBtn.addEventListener('click', fetchPrayerTimes);
  dom.nightModeToggle.addEventListener('click', toggleNightMode);
}

function init() {
  cacheDom();

  const savedLang = localStorage.getItem(STORAGE_KEYS.language);
  const initialLang = savedLang === 'en' ? 'en' : 'ar';
  state.nightModeIsha = localStorage.getItem(STORAGE_KEYS.nightModeIsha) === '1';

  registerServiceWorker();
  bindEvents();
  applyLanguage(initialLang);
  updateNightModeUI();
  restoreSavedLocation();

  window.addEventListener('online', () => {
    if (state.prayerTimes.errorKey === 'offline' && state.country && state.city) {
      fetchPrayerTimes();
    }
  });

  window.ThuluthMeeting = {
    getLocation: () => ({
      country: state.country,
      city: state.city,
      lang: state.lang,
    }),
    getPrayerTimes: () => ({
      today: state.prayerTimes.today,
      tomorrow: state.prayerTimes.tomorrow,
    }),
    getNightCalc: () => state.nightCalc,
    getState: () => ({ ...state }),
    fetchPrayerTimes,
    calculateAndRenderNight,
    updateWebManifest,
    version: '2.0.0-pwa',
  };

  // Backward-compatible debug alias
  window.IqraaThuluth = window.ThuluthMeeting;
}

document.addEventListener('DOMContentLoaded', init);
