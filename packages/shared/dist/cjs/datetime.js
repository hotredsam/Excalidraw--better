"use strict";
/** Date/time formatting helpers (pure; local time). */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTime = formatTime;
exports.formatDateTime = formatDateTime;
exports.startOfDay = startOfDay;
exports.daysBetween = daysBetween;
exports.isToday = isToday;
exports.isSameDay = isSameDay;
exports.formatDuration = formatDuration;
function p2(n) {
    return String(n).padStart(2, '0');
}
function formatTime(d) {
    const dt = typeof d === 'number' ? new Date(d) : d;
    return `${p2(dt.getHours())}:${p2(dt.getMinutes())}`;
}
function formatDateTime(d) {
    const dt = typeof d === 'number' ? new Date(d) : d;
    return `${dt.getFullYear()}-${p2(dt.getMonth() + 1)}-${p2(dt.getDate())} ${formatTime(dt)}`;
}
function startOfDay(d) {
    const dt = typeof d === 'number' ? new Date(d) : new Date(d.getTime());
    dt.setHours(0, 0, 0, 0);
    return dt;
}
function daysBetween(a, b) {
    const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
    return Math.round(ms / 86_400_000);
}
function isToday(d, now = Date.now()) {
    return daysBetween(d, now) === 0;
}
function isSameDay(a, b) {
    return daysBetween(a, b) === 0;
}
/** Human-friendly duration from milliseconds, e.g. "1h 5m" or "12s". */
function formatDuration(ms) {
    if (ms < 1000)
        return `${Math.max(0, Math.round(ms))}ms`;
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const parts = [];
    if (h)
        parts.push(`${h}h`);
    if (m)
        parts.push(`${m}m`);
    if (s || parts.length === 0)
        parts.push(`${s}s`);
    return parts.join(' ');
}
