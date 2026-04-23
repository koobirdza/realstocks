import { STORAGE_KEYS } from "./config.v51.js";

const FALLBACK = 'th';
const LABELS = {
  th: {
    title: 'RealStock', subtitle: 'ระบบสต๊อกสำหรับใช้งานบนมือถือ', checking: 'กำลังเช็กระบบ...',
    healthReady: 'พร้อมใช้งาน • คำนวณรอบ {hour}:00', healthProblem: 'มีปัญหา • {message}', healthFail: 'เชื่อมต่อไม่สำเร็จ',
    modeNotSelected: 'ยังไม่ได้เลือกโหมด', home: 'หน้าแรก', back: 'ย้อนกลับ', logout: 'ออกจากระบบ', install: 'ติดตั้งแอป',
    currentPath: 'หน้าแรก', destinationTitle: 'ปลายทางการเบิก', noCategory: 'ไม่พบหมวด', noItems: 'ไม่พบรายการในหมวดนี้',
    orderEmpty: 'รอบนี้ไม่มีรายการที่ต้องสั่ง', save: 'กำลังบันทึก...', clear: 'ล้างค่า', restore: 'กู้ข้อมูลค้าง',
    count: 'นับสต๊อก', issue: 'เบิกของ', receive: 'รับของ', order: 'สั่งของ',
    helperCount: 'บันทึกยอดนับอย่างเดียว ไม่คำนวณทันที', helperIssue: 'บันทึกรายการเบิกอย่างเดียว ไม่ตัด stock ทันที', helperReceive: 'ใช้กรอกของที่รับเข้าจริง ระบบจะอัปเดต view หลัง nightly 22:00', helperOrder: 'รายงานจำนวนที่ควรสั่ง • ไม่ต้องกรอก',
    queued: 'รับรายการแล้ว • ยังไม่คำนวณทันที', accepted: 'รับรายการแล้ว • คำนวณรอบ {hour}:00', loadModeFailed: 'โหลดโหมดไม่สำเร็จ',
    enterEmployee: 'กรุณากรอกชื่อพนักงาน', loginFailed: 'เข้าสู่ระบบไม่สำเร็จ', selectDestination: 'กรุณาเลือกปลายทางการเบิก', saveFailed: 'บันทึกไม่สำเร็จ',
    noDraft: 'ไม่พบข้อมูลค้าง', restored: 'กู้ข้อมูลค้างแล้ว', cleared: 'ล้างค่าแล้ว', warmOk: 'อุ่นแคชสำเร็จ', warmFail: 'อุ่นแคชไม่สำเร็จ', nightlyOk: 'คำนวณรอบกลางคืนสำเร็จ', nightlyFail: 'คำนวณรอบกลางคืนไม่สำเร็จ', preflightFail: 'ตรวจความพร้อมไม่สำเร็จ',
    destination_front: 'หน้าร้าน', destination_kitchen: 'ครัว', destination_bar: 'บาร์น้ำ', destination_veg: 'ของสด/ผัก',
    countZone: 'จุดนับ', snapshotLatest: 'ข้อมูลล่าสุด', issueFrom: 'ตัดจาก', useAt: 'ใช้ได้ที่', receiveTo: 'รับเข้า', flow: 'รูปแบบการไหล', snapshot: 'รอบข้อมูล', threshold: 'จุดสั่งขั้นต่ำ', target: 'เป้าหมาย', suggestedQty: 'จำนวนที่ควรสั่ง', useReceive: 'ใช้โหมดรับของเมื่อของมาถึง', preflightStatus: 'สถานะตรวจความพร้อม'
  },
  lo: {
    title: 'RealStock', subtitle: 'ລະບົບສະຕັອກສຳລັບມືຖື', checking: 'ກຳລັງກວດລະບົບ...',
    healthReady: 'ພ້ອມໃຊ້ງານ • ຄຳນວນຮອບ {hour}:00', healthProblem: 'ມີບັນຫາ • {message}', healthFail: 'ເຊື່ອມຕໍ່ບໍ່ສຳເລັດ',
    modeNotSelected: 'ຍັງບໍ່ໄດ້ເລືອກໂໝດ', home: 'ໜ້າຫຼັກ', back: 'ຍ້ອນກັບ', logout: 'ອອກຈາກລະບົບ', install: 'ຕິດຕັ້ງແອັບ',
    currentPath: 'ໜ້າຫຼັກ', destinationTitle: 'ປາຍທາງການເບີກ', noCategory: 'ບໍ່ພົບໝວດ', noItems: 'ບໍ່ພົບລາຍການໃນໝວດນີ້',
    orderEmpty: 'ຮອບນີ້ບໍ່ມີລາຍການທີ່ຕ້ອງສັ່ງ', save: 'กำลังบันทึก...', clear: 'ລ້າງຄ່າ', restore: 'ກູ້ຂໍ້ມູນຄ້າງ',
    count: 'ນັບສະຕັອກ', issue: 'ເບີກຂອງ', receive: 'ຮັບຂອງ', order: 'ສັ່ງຂອງ',
    helperCount: 'ບັນທຶກຍອດນັບຢ່າງດຽວ ບໍ່ຄຳນວນທັນທີ', helperIssue: 'ບັນທຶກການເບີກຢ່າງດຽວ ບໍ່ຕັດ stock ທັນທີ', helperReceive: 'ໃຊ້ກອກລາຍການຮັບເຂົ້າຈິງ ລະບົບຈະອັບເດດຫຼັງ nightly 22:00', helperOrder: 'ລາຍງານຈຳນວນທີ່ຄວນສັ່ງ • ບໍ່ຕ້ອງກອກ',
    queued: 'ຮັບລາຍການແລ້ວ • ຍັງບໍ່ຄຳນວນທັນທີ', accepted: 'ຮັບລາຍການແລ້ວ • ຄຳນວນຮອບ {hour}:00', loadModeFailed: 'ໂຫຼດໂໝດບໍ່ສຳເລັດ',
    enterEmployee: 'ກະລຸນາໃສ່ຊື່ພະນັກງານ', loginFailed: 'ເຂົ້າລະບົບບໍ່ສຳເລັດ', selectDestination: 'ກະລຸນາເລືອກປາຍທາງການເບີກ', saveFailed: 'ບັນທຶກບໍ່ສຳເລັດ',
    noDraft: 'ບໍ່ພົບຂໍ້ມູນຄ້າງ', restored: 'ກູ້ຂໍ້ມູນຄ້າງແລ້ວ', cleared: 'ລ້າງຄ່າແລ້ວ', warmOk: 'ອຸ່ນແຄດສຳເລັດ', warmFail: 'ອຸ່ນແຄດບໍ່ສຳເລັດ', nightlyOk: 'ຄຳນວນຮອບກາງຄືນສຳເລັດ', nightlyFail: 'ຄຳນວນຮອບກາງຄືນບໍ່ສຳເລັດ', preflightFail: 'ກວດຄວາມພ້ອມບໍ່ສຳເລັດ',
    destination_front: 'ໜ້າຮ້ານ', destination_kitchen: 'ຄົວ', destination_bar: 'ບານ້ຳ', destination_veg: 'ຂອງສົດ/ຜັກ',
    countZone: 'ຈຸດນັບ', snapshotLatest: 'ຂໍ້ມູນລ່າສຸດ', issueFrom: 'ຕັດຈາກ', useAt: 'ໃຊ້ທີ່', receiveTo: 'ຮັບເຂົ້າ', flow: 'ຮູບແບບການໄຫຼ', snapshot: 'ຮອບຂໍ້ມູນ', threshold: 'ຈຸດສັ່ງຂັ້ນຕ່ຳ', target: 'ເປົ້າໝາຍ', suggestedQty: 'ຈຳນວນທີ່ຄວນສັ່ງ', useReceive: 'ໃຊ້ໂໝດຮັບຂອງເມື່ອຂອງມາຮອດ', preflightStatus: 'ສະຖານະກວດຄວາມພ້ອມ'
  }
};

const LABEL_TRANSLATIONS = {
  lo: {
    'ห้องสต๊อก':'ຫ້ອງສະຕັອກ','สต๊อกบาร์น้ำ':'ສະຕັອກບານ້ຳ','สต๊อกของสด/ผัก':'ສະຕັອກຂອງສົດ/ຜັກ','ของสด/ผัก':'ຂອງສົດ/ຜັກ','หน้าร้าน':'ໜ້າຮ້ານ','ครัว':'ຄົວ','อื่น ๆ':'ອື່ນໆ',
    'กะทิ / นม':'ກະທິ / ນົມ','ซอส / เครื่องปรุง':'ຊອດ / ເຄື່ອງປຸງ','น้ำจิ้ม (แพ็กถุง)':'ນ້ຳຈິ້ມ (ແພັກຖົງ)','ของแห้ง':'ຂອງແຫ້ງ','บรรจุภัณฑ์':'ບັນຈຸພັນ','ลูกชิ้น / ของแปรรูป / ของทอด':'ລູກຊີ້ນ / ແປຮູບ / ຂອງທອດ','เส้น / ข้าว':'ເສັ້ນ / ເຂົ້າ','อาหารเจ':'ອາຫານເຈ','อุปกรณ์ครัว':'ອຸປະກອນຄົວ','อุปกรณ์ทำความสะอาด':'ອຸປະກອນທຳຄວາມສະອາດ','เครื่องดื่ม':'ເຄື່ອງດື່ມ','วัตถุดิบชงชา':'ວັດຖຸດິບຊົງຊາ','flow':'รูปแบบการไหล','snapshot':'รอบข้อมูล','threshold':'จุดสั่งขั้นต่ำ','target':'เป้าหมาย','central':'ศูนย์กลาง','stock':'สต๊อก',
    'daily':'รายวัน','weekly':'รายสัปดาห์','purchase':'หน่วยซื้อ','base':'หน่วยฐาน'
  }
};

export function getLang() { return localStorage.getItem(STORAGE_KEYS.lang) || FALLBACK; }
export function setLang(lang) { localStorage.setItem(STORAGE_KEYS.lang, lang); }
export function t(key, vars = {}, lang = getLang()) { const dict = LABELS[lang] || LABELS[FALLBACK]; let out = dict[key] || LABELS[FALLBACK][key] || key; Object.entries(vars).forEach(([k,v]) => out = out.replace(`{${k}}`, String(v))); return out; }
export function translateLabel(label, lang = getLang()) { const fixed = String(label || '').trim(); return LABEL_TRANSLATIONS[lang]?.[fixed] || fixed; }
