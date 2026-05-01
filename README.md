# RealStock Frontend v53.9.0 Clean

Frontend สำหรับลง GitHub Pages เท่านั้น ไม่รวม Apps Script backend.

## ใช้งานกับ backend เวอร์ชันล่าสุด
ใช้กับ RealStock backend v53.9.0 ที่มี schema ใหม่:

- `Catalog_View`
- `Item_Location_Map`
- `Stock_By_Location_View`
- `Policy_Zone`
- `Policy_Item`
- ไม่มี `usage_zones`
- ไม่มี `target_category_label`, `*_label`, `abc_class`

## วิธีตั้งค่า Web App URL
เปิดหน้า GitHub Pages ครั้งแรกแบบนี้:

```text
https://<your-github-page>/RealStock/?api=<REALSTOCK_WEB_APP_URL>
```

ระบบจะบันทึก API URL ลง localStorage อัตโนมัติ

หรือแก้ไฟล์:

```text
src/config.v53.9.js
```

แล้วใส่ URL ใน `DEFAULT_GOOGLE_SCRIPT_URL`.

## หมวดไม่ขึ้น / ขึ้นไม่ระบุโซน
เวอร์ชันนี้อ่านหมวดจาก field ใหม่ตามลำดับ:

```text
mode_target_label / mode_target_th
stock_location_th / location_th
count_zone_th / receive_target_th / issue_source_th
mode_target / stock_location / location / count_zone / receive_target / issue_source
```

ดังนั้นถ้า `Catalog_View` ถูก rebuild แล้ว หมวดจะขึ้นตามภาษาไทยจาก `mode_target_label`.
