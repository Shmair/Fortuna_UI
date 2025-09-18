import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { FileText } from 'lucide-react';

export default function ClaimStep({ results = [], onBack, onSubmit }) {
  // Form state
  const [form, setForm] = useState({
    name: '',
    id: '',
    bank: '',
    branch: '',
    account: '',
    phone: '',
    extra: '',
  });
  const [files, setFiles] = useState([]);

  // Calculate total refund
  const totalRefund = results.reduce((sum, r) => sum + (typeof r.amount === 'number' ? r.amount : 0), 0);

  // Handlers
  const handleInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleFiles = e => setFiles(Array.from(e.target.files));
  const handleSubmit = e => {
    e.preventDefault();
    if (onSubmit) onSubmit({ ...form, files });
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-2 text-blue-500"><FileText size={64} /></div>
        <h2 className="text-2xl font-bold mb-1">העלאת מסמכים וטופס תביעה</h2>
        <div className="text-gray-600">העלו את המסמכים הנדרשים ומלאו את הפרטים לצורך הגשת התביעה</div>
      </div>

      {/* מסמכים נדרשים */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>מסמכים נדרשים</CardTitle>
          <CardDescription>העלו את המסמכים הבאים כדי להמשיך בתהליך התביעה</CardDescription>
        </CardHeader>
        <CardContent>
          <input type="file" multiple className="mb-2" onChange={handleFiles} />
          <div className="text-xs text-gray-500">לא צוין</div>
        </CardContent>
      </Card>

      {/* פרטי תביעה */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>פרטי התביעה</CardTitle>
          <CardDescription>מלאו את הפרטים הבאים לצורך הגשת התביעה</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold mb-1">שם מלא *</label>
              <input name="name" value={form.name} onChange={handleInput} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">תעודת זהות *</label>
              <input name="id" value={form.id} onChange={handleInput} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">מספר חשבון בנק</label>
              <input name="account" value={form.account} onChange={handleInput} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">טלפון</label>
              <input name="phone" value={form.phone} onChange={handleInput} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">קוד בנק *</label>
              <input name="bank" value={form.bank} onChange={handleInput} className="w-full border rounded px-3 py-2" required placeholder="12" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">קוד סניף *</label>
              <input name="branch" value={form.branch} onChange={handleInput} className="w-full border rounded px-3 py-2" required placeholder="345" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">מידע נוסף</label>
              <textarea name="extra" value={form.extra} onChange={handleInput} className="w-full border rounded px-3 py-2" rows={2} placeholder="מידע נוסף שחשוב לציין לצורך התביעה..." />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* סיכום */}
      <div className="bg-blue-50 rounded-lg p-4 max-w-lg mx-auto mb-4 border border-blue-200 text-right">
        <div className="font-bold text-lg mb-2">סיכום התביעה</div>
        <div className="text-sm">מספר ההחזרים: <span className="font-bold">{results.length}</span></div>
        <div className="text-sm">תקרת החזר: <span className="font-bold">{totalRefund.toLocaleString()} ₪</span></div>
        <div className="text-sm">מסמכים שהועלו: <span className="font-bold">{files.length}</span> מתוך 1</div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 mt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>חזור לתוצאות</Button>
        <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold" onClick={handleSubmit}>אשר והגש תביעה</Button>
      </div>
    </div>
  );
}
