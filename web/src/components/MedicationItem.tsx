import { useState } from 'react';
import type { Medication } from '../types';
import { deleteMedication, updateMedication } from '../api';

interface MedicationItemProps {
  medication: Medication;
  onChanged: () => void;
}

export function MedicationItem({ medication, onChanged }: MedicationItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage ?? '');
  const [form, setForm] = useState(medication.form ?? '');
  const [frequency, setFrequency] = useState(medication.frequency ?? '');
  const [schedule, setSchedule] = useState(medication.schedule ?? '');
  const [instructions, setInstructions] = useState(medication.instructions ?? '');
  const [notes, setNotes] = useState(medication.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setName(medication.name);
    setDosage(medication.dosage ?? '');
    setForm(medication.form ?? '');
    setFrequency(medication.frequency ?? '');
    setSchedule(medication.schedule ?? '');
    setInstructions(medication.instructions ?? '');
    setNotes(medication.notes ?? '');
    setEditing(true);
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const saveEdit = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateMedication(medication.id, {
        id: medication.id,
        name,
        dosage,
        form,
        frequency,
        schedule,
        instructions,
        notes,
      });
      onChanged();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const removeMedication = async () => {
    if (!window.confirm(`Delete medication "${medication.name}"?`)) return;
    try {
      await deleteMedication(medication.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const formatValue = (value: string | null): string => (value === null ? '' : value);

  const fields = [
    { label: 'Dosage', value: medication.dosage },
    { label: 'Form', value: medication.form },
    { label: 'Frequency', value: medication.frequency },
    { label: 'Schedule', value: medication.schedule },
    { label: 'Instructions', value: medication.instructions },
    { label: 'Notes', value: medication.notes },
  ].filter((field) => field.value && field.value.trim() !== '');

  if (editing) {
    return (
      <div className="med-item">
        <div className="med-edit">
          <input
            className="med-edit__name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
          <input
            className="med-edit__dosage"
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            maxLength={200}
          />
          <input
            className="med-edit__form"
            type="text"
            value={form}
            onChange={(e) => setForm(e.target.value)}
            maxLength={80}
          />
          <input
            className="med-edit__frequency"
            type="text"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            maxLength={120}
          />
          <input
            className="med-edit__schedule"
            type="text"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            maxLength={200}
          />
          <textarea
            className="med-edit__instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            maxLength={500}
          />
          <textarea
            className="med-edit__notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={2000}
          />
          {error && <p className="error">{error}</p>}
          <div className="med-edit__actions">
            <button type="button" className="btn" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={saveEdit} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="med-item">
      <div className="med-item__text">
        <div className="med-item__name">
          <span>{medication.name}</span>
          {medication.dosage && <span className="med-item__badge">{medication.dosage}</span>}
        </div>
        {fields.length > 0 ? (
          <div className="med-item__details">
            {fields.map((field) => (
              <span key={field.label}>
                <strong>{field.label}:</strong> {formatValue(field.value)}
              </span>
            ))}
          </div>
        ) : (
          <div className="med-item__details med-item__details--muted">
            No additional details
          </div>
        )}
      </div>
      <div className="med-item__actions">
        <button type="button" className="btn" onClick={startEdit}>
          Edit
        </button>
        <button type="button" className="btn btn--danger" onClick={removeMedication}>
          Delete
        </button>
      </div>
    </div>
  );
}
