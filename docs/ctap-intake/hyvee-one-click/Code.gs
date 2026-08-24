/**
 * Kenzy one-tap: check SEND on the Config tab → Hy-Vee gets the liquor order.
 * Myke is not CC'd. Runs as communitypizza2026@gmail.com if that account
 * installed the onEdit trigger.
 *
 * One-time: Extensions → Apps Script → paste this file → authorize →
 * Triggers → Add trigger → onEditInstallable → From spreadsheet → On edit.
 */

var MIXER_STOP = /^(tonic|diet\s*7|ginger beer|bloody mary|squirt|simple syrup)/i;
var OPS_MAIL = "communitypizza2026@gmail.com";

function onOpen() {
  ensureConfig_();
  SpreadsheetApp.getUi()
    .createMenu("CTAP")
    .addItem("Email Hy-Vee liquor order", "sendHyveeLiquorOrder")
    .addToUi();
}

function onEditInstallable(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== "Config") return;
  if (e.range.getA1Notation() !== "B3") return;
  if (e.range.getValue() !== true) return;
  sendHyveeLiquorOrder();
  e.range.setValue(false);
}

function sendHyveeLiquorOrder() {
  ensureConfig_();
  var ss = SpreadsheetApp.getActive();
  var config = ss.getSheetByName("Config");
  var to = String(config.getRange("B1").getValue() || "").trim();
  if (!to || to.indexOf("@") < 0) {
    ss.toast("Put the Hy-Vee Wine email in Config!B1 once. Then tap SEND.");
    return;
  }
  var lines = buildLiquorLines_();
  if (!lines.length) {
    ss.toast("No liquor qty to order.");
    return;
  }
  var body = [
    "Community liquor order —",
    "",
    lines.map(function (line) {
      return "*" + line;
    }).join("\n"),
    "",
    "Thanks,",
    "Kenzy Thompson",
    "Bar FOH Manager",
    "Community Tap & Pizza",
    OPS_MAIL,
  ].join("\n");
  MailApp.sendEmail({
    to: to,
    subject: "Community Tap & Pizza — weekly liquor order",
    body: body,
    name: "Community Tap & Pizza",
    replyTo: OPS_MAIL,
  });
  config.getRange("B2").setValue(new Date());
  config.getRange("B4").setValue(lines.length + " lines sent to " + to);
  ss.toast("Sent " + lines.length + " lines to Hy-Vee. Myke is not on this email.");
}

function buildLiquorLines_() {
  var sheet = liquorSheet_();
  var values = sheet.getDataRange().getValues();
  var nameCol = 0;
  var qtyCol = 2;
  var header = values[0] || [];
  for (var c = 0; c < header.length; c++) {
    var h = String(header[c] || "").toLowerCase();
    if (h.indexOf("liquor") >= 0 || h.indexOf("wine") >= 0) nameCol = c;
    if (h.indexOf("quantity to order") >= 0 || h === "quantity to order") qtyCol = c;
  }
  var lines = [];
  for (var r = 1; r < values.length; r++) {
    var name = String(values[r][nameCol] || "").trim();
    if (!name) continue;
    if (/^total$/i.test(name) || /over\s*\/\s*under/i.test(name)) continue;
    if (MIXER_STOP.test(name)) break;
    var qty = Number(values[r][qtyCol]);
    if (!isFinite(qty) || qty <= 0) continue;
    lines.push(name + " - " + qty);
  }
  return lines;
}

function liquorSheet_() {
  var ss = SpreadsheetApp.getActive();
  var byName = ss.getSheetByName("Liquor");
  if (byName) return byName;
  return ss.getSheets()[0];
}

function ensureConfig_() {
  var ss = SpreadsheetApp.getActive();
  var config = ss.getSheetByName("Config");
  if (!config) {
    config = ss.insertSheet("Config");
  }
  config.getRange("A1").setValue("Hy-Vee Wine email (paste once)");
  config.getRange("A2").setValue("Last sent");
  config.getRange("A3").setValue("SEND liquor order (check this box)");
  config.getRange("A4").setValue("Last result");
  var box = config.getRange("B3");
  var rule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  box.setDataValidation(rule);
}
