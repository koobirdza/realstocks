# RealStock Frontend v53.10.0

Frontend สำหรับ GitHub Pages / PWA

## Performance behavior
- โหลด catalog ต่อ mode แล้ว cache ใน localStorage
- render item list แบบ progressive: แสดง 80 รายการแรกก่อน แล้วกด “แสดงเพิ่ม”
- preload mode อื่นแบบ idle หลังเข้า mode แรก เพื่อให้การสลับโหมดเร็วขึ้น

## Setup API URL
เปิดเว็บครั้งแรกพร้อม query:

```text
https://<github-pages-url>/?api=<REALSTOCK_WEB_APP_URL>
```

ระบบจะจำ API URL ใน localStorage
