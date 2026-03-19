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
  const dt = d ? new Date(d) : new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return parseInt(`${y}${m}${day}`, 10);
}

function timeToInt() {
  const dt = new Date();
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
    dt = d ? new Date(d) : new Date();
  }
  dt.setHours(0, 0, 0, 0);
  return Math.floor((dt.getTime() - CLARION_BASE) / MS_PER_DAY);
}

module.exports = { newGuid, lookupGuid, tsNow, dateToInt, timeToInt, dateToClarion };
