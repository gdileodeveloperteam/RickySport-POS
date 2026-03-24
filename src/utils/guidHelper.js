const crypto = require('crypto');

function newGuid() {
  return crypto.randomBytes(8).toString('hex');
}

function lookupGuid(value) {
  if (!value || typeof value !== 'string') return null;
  return value.trim();
}

function tsNow() {
  return Date.now() / 1000;
}

function dateToInt(d) {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) {
    const parts = d.slice(0, 10).split('-');
    return parseInt(parts.join(''), 10);
  }
  const dt = d ? new Date(d) : nowAR();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return parseInt(`${y}${m}${day}`, 10);
}

function timeToInt() {
  const dt = nowAR();
  const h = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  const s = String(dt.getSeconds()).padStart(2, '0');
  return parseInt(`${h}${min}${s}`, 10);
}

const CLARION_BASE = new Date(1800, 11, 28).getTime();
const MS_PER_DAY = 86400000;

function dateToClarion(d) {
  let dt;
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) {
    const [y, m, day] = d.slice(0, 10).split('-').map(Number);
    dt = new Date(y, m - 1, day);
  } else {
    dt = d ? new Date(d) : nowAR();
  }
  dt.setHours(0, 0, 0, 0);
  return Math.floor((dt.getTime() - CLARION_BASE) / MS_PER_DAY);
}

// Devuelve un Date ajustado a hora Argentina (UTC-3)
function nowAR() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc - 3 * 3600000);
}

// Devuelve solo la fecha (sin hora) en Argentina como Date
function todayAR() {
  const ar = nowAR();
  return new Date(ar.getFullYear(), ar.getMonth(), ar.getDate());
}

module.exports = { newGuid, lookupGuid, tsNow, dateToInt, timeToInt, dateToClarion, nowAR, todayAR };
