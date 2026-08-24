# Kenzy one-tap Hy-Vee — Myke out

Sheet: https://docs.google.com/spreadsheets/d/1_gAesi5ufLOHsQ_uan3PEfzcOaVg4gxP8P7F_YHMHbU/edit

Kenzy fills qty on the liquor tab. She checks **SEND** on the Config tab. Hy-Vee gets the email from `communitypizza2026@gmail.com`. Myke is not CC’d. No text. No Excel export.

Add **Licor 43 Crème Brûlée** as a row on the liquor tab so the sheet matches what she actually orders.

## One-time install (communitypizza Google account, 4 minutes)

Do this once on the Mac while logged into `communitypizza2026@gmail.com`. After this, Kenzy never needs Myke.

1. Open the sheet above.
2. Extensions → Apps Script. Delete any stub code. Paste `Code.gs`. Save.
3. Run `sendHyveeLiquorOrder` once → Allow permissions (Gmail + Sheets).
4. Clock (Triggers) → Add trigger:
   - Function: `onEditInstallable`
   - Event: From spreadsheet → On edit
5. Config tab → **B1** = the Hy-Vee Wine email you already used this morning. Once.
6. Share the sheet with Kenzy as **Editor**.

## Every Sunday night / Monday morning (Kenzy)

1. Put qty in **Quantity to Order**.
2. Open **Config**.
3. Check the SEND box.

Phone works. The checkbox trigger is why — custom menus often hide in the Sheets app.
