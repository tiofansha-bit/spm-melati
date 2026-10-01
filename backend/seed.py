import os
from core import db, new_id, now_iso, hash_password, verify_password, get_settings

DEMO_PASSWORD_PJ = "Pj@2026"
DEMO_PASSWORD_KEPALA = "Kepala@2026"

USERS = [
    ("kepala@puskesmas-melati.test", "Kepala Puskesmas Melati", "kepala", DEMO_PASSWORD_KEPALA),
    ("pj.kia@puskesmas-melati.test", "PJ Program KIA", "pj", DEMO_PASSWORD_PJ),
    ("pj.gizi@puskesmas-melati.test", "PJ Program Gizi", "pj", DEMO_PASSWORD_PJ),
    ("pj.imunisasi@puskesmas-melati.test", "PJ Program Imunisasi", "pj", DEMO_PASSWORD_PJ),
    ("pj.tb@puskesmas-melati.test", "PJ Program P2P TB", "pj", DEMO_PASSWORD_PJ),
]

PROGRAMS = [
    ("KIA", "Kesehatan Ibu dan Anak", "pj.kia@puskesmas-melati.test", [
        ("Pelayanan kesehatan ibu hamil sesuai standar", "ibu hamil", 100, "kumulatif"),
        ("Pelayanan kesehatan ibu bersalin sesuai standar", "ibu bersalin", 100, "kumulatif"),
        ("Pelayanan kesehatan bayi baru lahir sesuai standar", "bayi", 100, "kumulatif")]),
    ("GIZI", "Gizi Masyarakat", "pj.gizi@puskesmas-melati.test", [
        ("Balita ditimbang (D/S)", "balita", None, "rasio"),
        ("Remaja putri mendapat tablet tambah darah", "remaja putri", None, "kumulatif"),
        ("Balita gizi kurang (posisi bulan terakhir)", "balita", None, "terakhir")]),
    ("IMUN", "Imunisasi", "pj.imunisasi@puskesmas-melati.test", [
        ("Imunisasi dasar lengkap pada bayi", "bayi", None, "kumulatif")]),
    ("TB", "P2P Tuberkulosis", "pj.tb@puskesmas-melati.test", [
        ("Pelayanan kesehatan orang terduga TB sesuai standar", "orang", 100, "kumulatif")]),
]


async def seed_all():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    ex = await db.users.find_one({"email": admin_email})
    if not ex:
        await db.users.insert_one({"id": new_id(), "email": admin_email, "name": "Admin Melati", "role": "admin",
                                   "active": True, "password_hash": hash_password(admin_pw), "created_at": now_iso()})
    elif not verify_password(admin_pw, ex["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})
    await get_settings()
    if await db.meta.find_one({"key": "seeded"}):
        return
    ids = {}
    for email, name, role, pw in USERS:
        u = await db.users.find_one({"email": email})
        if not u:
            uid = new_id()
            await db.users.insert_one({"id": uid, "email": email, "name": name, "role": role, "active": True,
                                       "password_hash": hash_password(pw), "created_at": now_iso()})
        ids[email] = u["id"] if u else uid
    for code, name, pj, inds in PROGRAMS:
        pid = new_id()
        await db.programs.insert_one({"id": pid, "code": code, "name": name, "description": "",
                                      "pj_user_id": ids.get(pj), "created_at": now_iso()})
        for k, (iname, unit, target, method) in enumerate(inds):
            await db.indicators.insert_one({"id": new_id(), "program_id": pid, "name": iname, "unit": unit,
                                            "target": target, "sasaran": None, "method": method,
                                            "definition": "", "order": k, "created_at": now_iso()})
    await db.meta.insert_one({"key": "seeded", "at": now_iso()})
