import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import Tesseract from 'tesseract.js';

function SurveyForm({
  onSave,
  initialData = null,
  buttonText = 'Generate Report',
  title = 'New Solar Survey',
}) {
  const [s, setS] = useState({
    customerName: initialData?.customerName || '',
    location: initialData?.location || '',
    consumerNumber: initialData?.consumerNumber || '',

    monthlyUnits: initialData?.monthlyUnits || '',
    billAmount: initialData?.billAmount || '',

    roofType: initialData?.roofType || 'RCC',
    accessDifficulty: initialData?.accessDifficulty || 'Easy',
    dimensionMode: initialData?.dimensionMode || 'Strict',
    roofLength: initialData?.roofLength || '',
    roofWidth: initialData?.roofWidth || '',
    blockedArea: initialData?.blockedArea || '0',

    direction: initialData?.direction || 'South',
    shadowRisk: initialData?.shadowRisk || 'Low',
    panelWattage: initialData?.panelWattage || '550W',
    panelCount: initialData?.panelCount || '',
    orientation: initialData?.orientation || 'Auto',
    status: initialData?.status || 'New',
  });

  const [files, setFiles] = useState([]);
  const [billFile, setBillFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');

  const set = (e) => {
    setS({
      ...s,
      [e.target.name]: e.target.value,
    });
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);

    const mapped = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const cleanValue = (value) => {
    return value
      ?.replace(/[|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractByPatterns = (text, patterns) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);

      if (match) {
        return (match[2] || match[1] || '').trim();
      }
    }

    return '';
  };

  const extractAmountFallback = (text) => {
    const numbers = text.match(/\b\d{2,7}\b/g) || [];

    const validAmounts = numbers
      .map((n) => Number(n))
      .filter((n) => n >= 100 && n <= 200000);

    if (validAmounts.length === 0) return '';

    return String(Math.max(...validAmounts));
  };

  const processBill = async (file) => {
    try {
      setOcrLoading(true);
      setOcrText('');

      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m),
      });

      const rawText = result.data.text;
      console.log('OCR TEXT:', rawText);
      setOcrText(rawText);

      const text = rawText
        .replace(/\r/g, '\n')
        .replace(/[₹]/g, 'Rs ')
        .replace(/,/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const lower = text.toLowerCase();

      const name = extractByPatterns(text, [
        /consumer\s*name\s*[:\-]?\s*([A-Za-z .]{3,60})/i,
        /customer\s*name\s*[:\-]?\s*([A-Za-z .]{3,60})/i,
        /name\s*of\s*consumer\s*[:\-]?\s*([A-Za-z .]{3,60})/i,
        /applicant\s*name\s*[:\-]?\s*([A-Za-z .]{3,60})/i,
        /name\s*[:\-]?\s*([A-Za-z .]{3,60})/i,
      ]);

      const address = extractByPatterns(text, [
        /supply\s*address\s*[:\-]?\s*([A-Za-z0-9 ,./\-()]{10,150})/i,
        /premises\s*address\s*[:\-]?\s*([A-Za-z0-9 ,./\-()]{10,150})/i,
        /consumer\s*address\s*[:\-]?\s*([A-Za-z0-9 ,./\-()]{10,150})/i,
        /address\s*[:\-]?\s*([A-Za-z0-9 ,./\-()]{10,150})/i,
      ]);

      const consumerNumber = extractByPatterns(text, [
        /consumer\s*(no|number|id)\s*[:\-]?\s*(\d{5,20})/i,
        /account\s*(no|number)\s*[:\-]?\s*(\d{5,20})/i,
        /connection\s*(no|number)\s*[:\-]?\s*(\d{5,20})/i,
        /service\s*(no|number)\s*[:\-]?\s*(\d{5,20})/i,
        /ca\s*(no|number)\s*[:\-]?\s*(\d{5,20})/i,
        /k\s*no\s*[:\-]?\s*(\d{5,20})/i,
        /consumer\s*id\s*[:\-]?\s*(\d{5,20})/i,
      ]);

      const units = extractByPatterns(lower, [
        /consumed\s*units?\s*[:\-]?\s*(\d{2,5})/i,
        /units?\s*consumed\s*[:\-]?\s*(\d{2,5})/i,
        /billed\s*units?\s*[:\-]?\s*(\d{2,5})/i,
        /total\s*units?\s*[:\-]?\s*(\d{2,5})/i,
        /energy\s*consumption\s*[:\-]?\s*(\d{2,5})/i,
        /current\s*consumption\s*[:\-]?\s*(\d{2,5})/i,
        /consumption\s*[:\-]?\s*(\d{2,5})/i,
        /unit\s*[:\-]?\s*(\d{2,5})/i,
        /(\d{2,5})\s*kwh/i,
        /(\d{2,5})\s*units/i,
      ]);

      let amount = extractByPatterns(lower, [
        /amount\s*payable\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /total\s*amount\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /net\s*amount\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /bill\s*amount\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /payable\s*amount\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /total\s*payable\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /net\s*payable\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /current\s*bill\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /due\s*amount\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /gross\s*amount\s*[:\-]?\s*(?:rs)?\s*(\d{2,7})/i,
        /rs\.?\s*(\d{2,7})/i,
      ]);

      if (!amount) {
        amount = extractAmountFallback(lower);
      }

      setS((prev) => ({
        ...prev,
        customerName: cleanValue(name) || prev.customerName,
        location: cleanValue(address) || prev.location,
        consumerNumber: cleanValue(consumerNumber) || prev.consumerNumber,
        monthlyUnits: cleanValue(units) || prev.monthlyUnits,
        billAmount: cleanValue(amount) || prev.billAmount,
      }));

      alert('OCR completed. Please verify extracted details.');
    } catch (err) {
      console.log(err);
      alert('OCR failed. Please enter details manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <>
      <h1>{title}</h1>

      <div className="card">
        <div className="grid">
          <Field
            label="Customer Name"
            name="customerName"
            value={s.customerName}
            onChange={set}
          />

          <Field
            label="Location / Address"
            name="location"
            value={s.location}
            onChange={set}
          />

          <Field
            label="Consumer Number"
            name="consumerNumber"
            value={s.consumerNumber}
            onChange={set}
          />

          <div className="billUploadBox">
            <label className="upload">
              <Upload size={20} />
              Upload Electricity Bill
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  setBillFile(file);
                  processBill(file);
                }}
              />
            </label>

            {ocrLoading && <p>Processing Bill OCR...</p>}

            {billFile && (
              <p>
                Uploaded Bill: <b>{billFile.name}</b>
              </p>
            )}
          </div>

          <Field
            label="Monthly Units"
            name="monthlyUnits"
            value={s.monthlyUnits}
            onChange={set}
          />

          <Field
            label="Monthly Bill Amount"
            name="billAmount"
            value={s.billAmount}
            onChange={set}
          />

          {ocrText && (
            <div className="ocrBox">
              <h3>OCR Extracted Text</h3>
              <pre>{ocrText}</pre>
            </div>
          )}

          <Select
            label="Roof Type"
            name="roofType"
            value={s.roofType}
            onChange={set}
            opts={['RCC', 'Tin Shed', 'Asbestos', 'Sloped Roof']}
          />

          <Select
            label="Roof Access"
            name="accessDifficulty"
            value={s.accessDifficulty}
            onChange={set}
            opts={['Easy', 'Medium', 'Difficult']}
          />

          <Select
            label="Dimension Mode"
            name="dimensionMode"
            value={s.dimensionMode}
            onChange={set}
            opts={['Strict', 'Relaxed']}
          />

          <Field
            label="Roof Length (meter)"
            name="roofLength"
            value={s.roofLength}
            onChange={set}
          />

          <Field
            label="Roof Width (meter)"
            name="roofWidth"
            value={s.roofWidth}
            onChange={set}
          />

          <Field
            label="Blocked Area / Obstacles"
            name="blockedArea"
            value={s.blockedArea}
            onChange={set}
          />

          <Select
            label="Roof Direction"
            name="direction"
            value={s.direction}
            onChange={set}
            opts={['South', 'South-East', 'South-West', 'East', 'West', 'North']}
          />

          <Select
            label="Shadow Risk"
            name="shadowRisk"
            value={s.shadowRisk}
            onChange={set}
            opts={['Low', 'Medium', 'High']}
          />

          <Select
            label="Panel Wattage"
            name="panelWattage"
            value={s.panelWattage}
            onChange={set}
            opts={['540W', '550W', '580W']}
          />

          <Field
            label="Required Number of Panels"
            name="panelCount"
            value={s.panelCount}
            onChange={set}
          />

          <Select
            label="Panel Orientation"
            name="orientation"
            value={s.orientation}
            onChange={set}
            opts={['Auto', 'Portrait', 'Landscape']}
          />

          <Select
            label="Survey Status"
            name="status"
            value={s.status}
            onChange={set}
            opts={['New', 'Surveyed', 'Design Ready', 'Quotation Sent', 'Installed']}
          />

          <div className="uploadBox">
            <label className="upload">
              <Upload size={20} />
              Roof Photo / Video Preview Only
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFiles}
              />
            </label>

            <div className="previewGrid">
              {files.map((f, i) => (
                <div className="previewCard" key={i}>
                  {f.file.type.startsWith('image') ? (
                    <img src={f.preview} alt="" />
                  ) : (
                    <video src={f.preview} controls />
                  )}

                  <button
                    type="button"
                    className="removeBtn"
                    onClick={() => removeFile(i)}
                  >
                    <X size={14} />
                  </button>

                  <span>{f.file.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="primary" onClick={() => onSave(s)}>
          {buttonText}
        </button>
      </div>
    </>
  );
}

function Field(props) {
  return (
    <label>
      {props.label}
      <input {...props} />
    </label>
  );
}

function Select({ label, opts, ...props }) {
  return (
    <label>
      {label}
      <select {...props}>
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export default SurveyForm;