import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api, errMsg, METHODS, fmtNum } from "@/lib/api";
import { PageHeader, Card, Field, SimpleSelect, usePrograms, NA, Empty } from "@/components/common";
import { useAuth } from "@/context/AuthContext";

const ProgramDialog = ({ data, onClose, users, onSaved }) => {
  const [f, setF] = useState(data || {});
  useEffect(() => setF(data || {}), [data]);
  const save = async () => {
    try {
      const body = { name: f.name, code: f.code || "", description: f.description || "", pj_user_id: f.pj_user_id || null };
      if (f.id) await api.put(`/programs/${f.id}`, body); else await api.post("/programs", body);
      toast.success("Program disimpan"); onSaved(); onClose();
    } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <Dialog open={!!data} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{f.id ? "Ubah program" : "Tambah program"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Nama program"><Input data-testid="program-name-input" value={f.name || ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Kode"><Input data-testid="program-code-input" value={f.code || ""} onChange={(e) => setF({ ...f, code: e.target.value })} /></Field>
          <Field label="Penanggung jawab (PJ)">
            <SimpleSelect testid="program-pj-select" value={f.pj_user_id || undefined} placeholder="Pilih PJ" onChange={(v) => setF({ ...f, pj_user_id: v })} options={users.filter((u) => u.role === "pj").map((u) => ({ value: u.id, label: u.name }))} />
          </Field>
          <Field label="Deskripsi"><Textarea value={f.description || ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        </div>
        <DialogFooter><Button className="btn-primary" data-testid="save-program-button" disabled={!f.name} onClick={save}>Simpan</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const IndicatorDialog = ({ data, onClose, onSaved }) => {
  const [f, setF] = useState(data || {});
  useEffect(() => setF(data || {}), [data]);
  const n = (v) => (v === "" || v === undefined || v === null ? null : Number(v));
  const save = async () => {
    try {
      const body = { name: f.name, unit: f.unit || "", target: n(f.target), sasaran: n(f.sasaran), method: f.method || "kumulatif", definition: f.definition || "", order: f.order || 0 };
      if (f.id) await api.put(`/indicators/${f.id}`, body); else await api.post(`/programs/${f.program_id}/indicators`, body);
      toast.success("Indikator disimpan"); onSaved(); onClose();
    } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <Dialog open={!!data} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{f.id ? "Ubah indikator" : "Tambah indikator"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Nama indikator"><Input data-testid="indicator-name-input" value={f.name || ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Satuan"><Input data-testid="indicator-unit-input" value={f.unit || ""} onChange={(e) => setF({ ...f, unit: e.target.value })} /></Field>
            <Field label="Target (%)"><Input data-testid="indicator-target-input" type="number" value={f.target ?? ""} onChange={(e) => setF({ ...f, target: e.target.value })} /></Field>
            <Field label="Sasaran awal"><Input data-testid="indicator-sasaran-input" type="number" value={f.sasaran ?? ""} onChange={(e) => setF({ ...f, sasaran: e.target.value })} /></Field>
          </div>
          <Field label="Metode perhitungan rekap" hint={METHODS[f.method || "kumulatif"].hint}>
            <SimpleSelect testid="indicator-method-select" value={f.method || "kumulatif"} onChange={(v) => setF({ ...f, method: v })} options={Object.entries(METHODS).map(([k, m]) => ({ value: k, label: m.label }))} />
          </Field>
          <Field label="Definisi operasional / rumus"><Textarea data-testid="indicator-definition-input" value={f.definition || ""} onChange={(e) => setF({ ...f, definition: e.target.value })} placeholder="mis. Jumlah ibu hamil K6 / jumlah sasaran ibu hamil × 100%" /></Field>
        </div>
        <DialogFooter><Button className="btn-primary" data-testid="save-indicator-button" disabled={!f.name} onClick={save}>Simpan</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function Programs() {
  const { user } = useAuth();
  const admin = user.role === "admin";
  const [programs, reload] = usePrograms();
  const [users, setUsers] = useState([]);
  const [pd, setPd] = useState(null);
  const [idlg, setIdlg] = useState(null);
  useEffect(() => { api.get("/users").then((r) => setUsers(r.data)); }, []);
  const del = async (url, msg) => { if (!window.confirm(msg)) return; try { await api.delete(url); toast.success("Dihapus"); reload(); } catch (e) { toast.error(errMsg(e)); } };

  return (
    <div>
      <PageHeader eyebrow="Master data" title="Program & Indikator" subtitle="Kelola program, PJ, indikator, satuan, target, dan metode perhitungan. Target contoh dapat disesuaikan dengan ketentuan yang berlaku.">
        {admin && <Button className="btn-primary rounded-full" data-testid="add-program-button" onClick={() => setPd({})}><Plus className="mr-1 h-4 w-4" />Tambah program</Button>}
      </PageHeader>
      {programs.length === 0 && <Empty>Belum ada program.</Empty>}
      <div className="stagger space-y-5">
        {programs.map((p) => (
          <Card key={p.id} className="p-0" data-testid={`program-card-${p.id}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EEE8] px-5 py-4">
              <div>
                <div className="flex items-center gap-2"><span className="rounded-md bg-[#1A4D3A] px-2 py-0.5 font-mono text-[11px] text-white">{p.code || "—"}</span><span className="font-display text-lg font-semibold text-[#12372A]">{p.name}</span></div>
                <div className="mt-1 text-xs text-slate-500">PJ: {p.pj_name || "Belum ditetapkan"} {p.description && `· ${p.description}`}</div>
              </div>
              {admin && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="btn-soft" data-testid={`add-indicator-${p.id}`} onClick={() => setIdlg({ program_id: p.id, method: "kumulatif" })}><Plus className="mr-1 h-3.5 w-3.5" />Indikator</Button>
                  <Button size="icon" variant="ghost" data-testid={`edit-program-${p.id}`} onClick={() => setPd(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" data-testid={`delete-program-${p.id}`} onClick={() => del(`/programs/${p.id}`, `Hapus program ${p.name} beserta indikatornya?`)}><Trash2 className="h-4 w-4 text-rose-600" /></Button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-500"><th className="px-5 py-2">Indikator</th><th className="px-3">Satuan</th><th className="px-3">Target</th><th className="px-3">Metode</th>{admin && <th />}</tr></thead>
                <tbody>
                  {p.indicators.map((i) => (
                    <tr key={i.id} className="border-t border-[#EEF3EF]" data-testid={`indicator-row-${i.id}`}>
                      <td className="px-5 py-2.5"><div className="font-medium">{i.name}</div>{i.definition && <div className="text-xs text-slate-500">{i.definition}</div>}</td>
                      <td className="px-3">{i.unit || "-"}</td>
                      <td className="px-3">{fmtNum(i.target, true) ?? <NA />}</td>
                      <td className="px-3"><span className="rounded bg-[#EEF4EF] px-2 py-0.5 text-xs text-emerald-800">{METHODS[i.method]?.label}</span></td>
                      {admin && <td className="whitespace-nowrap px-3 text-right">
                        <Button size="icon" variant="ghost" data-testid={`edit-indicator-${i.id}`} onClick={() => setIdlg(i)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" data-testid={`delete-indicator-${i.id}`} onClick={() => del(`/indicators/${i.id}`, `Hapus indikator ${i.name}?`)}><Trash2 className="h-4 w-4 text-rose-600" /></Button>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
      <ProgramDialog data={pd} onClose={() => setPd(null)} users={users} onSaved={reload} />
      <IndicatorDialog data={idlg} onClose={() => setIdlg(null)} onSaved={reload} />
    </div>
  );
}
