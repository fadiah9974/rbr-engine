mkdir -p src/components/forms

cat << 'EOF' > src/components/forms/CaseForm.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Save, X } from 'lucide-react';

export const CaseForm = () => {
  return (
    <form className="max-w-4xl space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Input Asesmen Baru</h2>
        <p className="text-sm text-slate-500 mt-1">Lengkapi data di bawah ini untuk menjalankan rule engine dan mendapatkan rekomendasi.</p>
      </div>

      {/* Group 1: Informasi Subjek */}
      <Card>
        <CardHeader 
          title="1. Informasi Subjek Asesmen" 
          description="Data dasar identitas yang sedang diasesmen." 
        />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Nama Lengkap" placeholder="Masukkan nama lengkap..." required />
          <Input label="Nomor Identitas (KTP/NIK)" placeholder="Contoh: 3201..." required />
          <Input label="Organisasi / Instansi" placeholder="Pilih organisasi..." as="select" options={[
            { label: 'Pilih Organisasi', value: '' },
            { label: 'PT. Teknologi Nusantara', value: '1' },
            { label: 'Klinik Sehat Selalu', value: '2' },
          ]} />
          <Input label="Tanggal Asesmen" type="date" required />
        </CardContent>
      </Card>

      {/* Group 2: Variabel Indikator (Dinamis dari Rule) */}
      <Card>
        <CardHeader 
          title="2. Variabel Indikator" 
          description="Masukkan nilai untuk memicu aturan dinamis (Rules) yang telah ditetapkan." 
        />
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Skor Risiko (0-100)" 
              type="number" 
              placeholder="0" 
              helperText="Nilai metrik risiko berdasarkan observasi awal."
            />
            <Input 
              label="Kategori Dampak" 
              as="select" 
              options={[
                { label: 'Pilih Kategori', value: '' },
                { label: 'Rendah (Low)', value: 'LOW' },
                { label: 'Sedang (Medium)', value: 'MEDIUM' },
                { label: 'Tinggi (High)', value: 'HIGH' },
              ]} 
            />
          </div>
          <Input 
            label="Catatan Tambahan (Opsional)" 
            as="textarea" 
            placeholder="Tuliskan temuan atau catatan kualitatif di sini..." 
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Button variant="ghost" type="button">
          <X className="w-4 h-4 mr-2" />
          Batal
        </Button>
        <Button variant="primary" type="submit">
          <Save className="w-4 h-4 mr-2" />
          Jalankan Asesmen
        </Button>
      </div>
    </form>
  );
};
EOF

cat << 'EOF' > src/components/forms/RuleForm.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Save, ArrowRight } from 'lucide-react';

export const RuleForm = () => {
  return (
    <form className="max-w-5xl space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Buat Aturan Dinamis (Rule)</h2>
        <p className="text-sm text-slate-500 mt-1">Konfigurasi logika IF-THEN untuk otomatisasi hasil asesmen.</p>
      </div>

      {/* Group 1: Identitas Rule */}
      <Card>
        <CardHeader title="Informasi Aturan" />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Nama Aturan" placeholder="Misal: Risiko Tinggi Kredit" required />
          <Input label="Kategori" as="select" options={[
            { label: 'Pilih Kategori', value: '' },
            { label: 'Finansial', value: 'FIN' },
            { label: 'Kesehatan', value: 'MED' },
          ]} />
          <div className="md:col-span-2">
            <Input label="Deskripsi Aturan" as="textarea" placeholder="Jelaskan tujuan dari aturan ini..." />
          </div>
        </CardContent>
      </Card>

      {/* Group 2: Builder Kondisi (IF) */}
      <Card>
        <CardHeader 
          title="Kondisi (IF)" 
          description="Aturan akan terpicu jika semua kondisi di bawah ini terpenuhi (AND)."
          action={
            <Button variant="secondary" size="sm" type="button">
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Kondisi
            </Button>
          }
        />
        <CardContent className="space-y-4 bg-slate-50/50">
          {/* Mock Dynamic Row */}
          {[1, 2].map((idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-end gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Input 
                className="flex-1"
                label={idx === 1 ? "Variabel" : ""} 
                as="select" 
                options={[ { label: 'Skor Risiko', value: 'skor' } ]} 
              />
              <Input 
                className="w-full md:w-40"
                label={idx === 1 ? "Operator" : ""} 
                as="select" 
                options={[ 
                  { label: 'Lebih Besar (>)', value: '>' },
                  { label: 'Sama Dengan (==)', value: '==' }
                ]} 
              />
              <Input 
                className="flex-1"
                label={idx === 1 ? "Nilai (Value)" : ""} 
                placeholder="Masukkan nilai target..." 
              />
              <Button variant="ghost" className="mb-0.5 text-red-500 hover:text-red-700 hover:bg-red-50" title="Hapus Kondisi">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Group 3: Hasil (THEN) */}
      <Card className="border-teal-200 shadow-sm">
        <CardHeader 
          title="Hasil Keputusan (THEN)" 
          description="Output yang diberikan sistem jika kondisi terpenuhi." 
          className="bg-teal-50/30 border-teal-100"
        />
        <CardContent className="grid grid-cols-1 gap-6">
          <Input 
            label="Status Hasil" 
            as="select" 
            options={[
              { label: 'Ditolak', value: 'REJECT' },
              { label: 'Disetujui', value: 'APPROVE' },
              { label: 'Review Manual', value: 'REVIEW' },
            ]} 
          />
          <Input label="Pesan / Rekomendasi Sistem" as="textarea" placeholder="Masukkan pesan rekomendasi..." />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button variant="ghost" type="button">Batal</Button>
        <Button variant="primary" type="submit">
          <Save className="w-4 h-4 mr-2" />
          Simpan Aturan
        </Button>
      </div>
    </form>
  );
};
EOF

echo "✅ Selesai! File CaseForm.tsx dan RuleForm.tsx berhasil dibuat di folder src/components/forms/"