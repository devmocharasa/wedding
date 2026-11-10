/**
 * Google Apps Script untuk ucapan & doa undangan.
 * Data disimpan di sheet "kuntet" dengan kolom: Waktu | Nama | Pesan
 *
 * Cara pasang:
 * 1. Buka Google Sheet kamu > Extensions > Apps Script (script harus terikat ke spreadsheet ini).
 * 2. Tempel seluruh kode ini, simpan.
 * 3. Deploy > New deployment > tipe "Web app"
 *      Execute as: Me
 *      Who has access: Anyone
 * 4. Salin URL /exec ke CONFIG.wishesUrl di script.js.
 *    Setiap mengubah kode ini, buat deployment baru (Manage deployments > Edit > New version).
 */

var SHEET_NAME = "kuntet";
var MAX_NAME = 60;
var MAX_MESSAGE = 500;
var MAX_ROWS = 200;

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Waktu", "Nama", "Pesan"]);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// Cegah formula injection di Google Sheets (=, +, -, @ di awal teks)
function safeCell_(text) {
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function clean_(value, limit) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().substring(0, limit);
}

// GET: kembalikan daftar ucapan, terbaru di atas
function doGet() {
  try {
    var sheet = getSheet_();
    var lastRow = sheet.getLastRow();
    var wishes = [];
    if (lastRow > 1) {
      var count = Math.min(lastRow - 1, MAX_ROWS);
      var rows = sheet.getRange(lastRow - count + 1, 1, count, 3).getValues();
      for (var i = rows.length - 1; i >= 0; i--) {
        var at = rows[i][0];
        wishes.push({
          at: at instanceof Date ? at.toISOString() : String(at),
          name: String(rows[i][1]),
          message: String(rows[i][2]),
        });
      }
    }
    return json_({ ok: true, wishes: wishes });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// POST: simpan ucapan baru. Body JSON (dikirim sebagai text/plain): {"name": "...", "message": "..."}
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var name = clean_(data.name, MAX_NAME);
    var message = clean_(data.message, MAX_MESSAGE);
    if (!name || !message) {
      return json_({ ok: false, error: "Nama dan pesan wajib diisi." });
    }
    getSheet_().appendRow([new Date(), safeCell_(name), safeCell_(message)]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
