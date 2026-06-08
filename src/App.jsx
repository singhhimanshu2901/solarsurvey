import React, { useEffect, useState } from 'react';
import { Building2, FileText, LogOut, Plus, Sun, Menu, X } from 'lucide-react';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SurveyForm from './components/SurveyForm';
import Reports from './components/Reports';
import Report from './components/Report';

import { estimateReport } from './utils/estimateReport';
import { db, auth } from './firebase';

function App() {
  const [view, setView] = useState('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [active, setActive] = useState(null);
  const [editing, setEditing] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setSurveys([]);
      return;
    }

    const q = query(
      collection(db, 'surveys'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((docSnap) => ({
          firestoreId: docSnap.id,
          ...docSnap.data(),
        }))
        .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));

      setSurveys(data);
    });

    return () => unsub();
  }, [user]);

  async function saveSurvey(s) {
    const report = estimateReport(s);

    const item = {
      id: Date.now(),
      userId: user.uid,
      userEmail: user.email || '',
      createdAt: new Date().toLocaleString(),
      createdAtMs: Date.now(),
      ...s,
      report,
    };

    const docRef = await addDoc(collection(db, 'surveys'), item);

    setActive({
      firestoreId: docRef.id,
      ...item,
    });

    setEditing(null);
    setView('report');
  }

  async function updateSurvey(s) {
    const report = estimateReport(s);

    const updated = {
      ...editing,
      ...s,
      report,
      updatedAt: new Date().toLocaleString(),
    };

    await updateDoc(doc(db, 'surveys', editing.firestoreId), updated);

    setActive(updated);
    setEditing(null);
    setView('report');
  }

  async function deleteSurvey(survey) {
    if (!confirm('Are you sure you want to delete this survey?')) return;

    await deleteDoc(doc(db, 'surveys', survey.firestoreId));

    if (active?.firestoreId === survey.firestoreId) {
      setActive(null);
      setView('reports');
    }
  }
  async function updateStatus(survey, newStatus) {
  await updateDoc(doc(db, 'surveys', survey.firestoreId), {
    status: newStatus,
    updatedAt: new Date().toLocaleString(),
  });

  if (active?.firestoreId === survey.firestoreId) {
    setActive({
      ...active,
      status: newStatus,
      updatedAt: new Date().toLocaleString(),
    });
  }
}

  function editSurvey(survey) {
    setEditing(survey);
    setView('edit');
  }

  async function handleLogout() {
    await signOut(auth);
    setView('dashboard');
    setActive(null);
    setEditing(null);
  }

  if (loading) {
    return (
      <div className="login">
        <div className="card loginCard">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
  return (
    <>
      <Login onLogin={() => {}} />
      <Footer />
    </>
  );
}

 return (
  <>
    <div className="mobileTopbar">
      <div className="mobileBrand">
        <Sun />
        <b>Solar Survey</b>
      </div>

      <button className="menuBtn" onClick={() => setMobileMenu(true)}>
        <Menu size={22} />
      </button>
    </div>

    {mobileMenu && (
      <div className="overlay" onClick={() => setMobileMenu(false)}></div>
    )}

    <div className="app">
      <aside className={mobileMenu ? 'showSidebar' : ''}>
        <div className="mobileClose">
          <button onClick={() => setMobileMenu(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="brand">
          <Sun />
          <div>
            <b>Solar Survey</b>
            <span>{user.email}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setView('dashboard');
            setMobileMenu(false);
          }}
          className={view === 'dashboard' ? 'on' : ''}
        >
          <Building2 size={18} /> Dashboard
        </button>

        <button
          onClick={() => {
            setEditing(null);
            setView('new');
            setMobileMenu(false);
          }}
          className={view === 'new' ? 'on' : ''}
        >
          <Plus size={18} /> New Survey
        </button>

        <button
          onClick={() => {
            setView('reports');
            setMobileMenu(false);
          }}
          className={view === 'reports' ? 'on' : ''}
        >
          <FileText size={18} /> Reports
        </button>

        <button onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main>
        {view === 'dashboard' && (
         <Dashboard
  surveys={surveys}
  open={(s) => {
    setActive(s);
    setView('report');
  }}
  updateStatus={updateStatus}
/>
        )}

        {view === 'new' && <SurveyForm onSave={saveSurvey} />}

        {view === 'edit' && (
          <SurveyForm
            onSave={updateSurvey}
            initialData={editing}
            buttonText="Update Report"
            title="Edit Solar Survey"
          />
        )}

        {view === 'reports' && (
          <Reports
  surveys={surveys}
  open={(s) => {
    setActive(s);
    setView('report');
  }}
  edit={editSurvey}
  remove={deleteSurvey}
  updateStatus={updateStatus}
/>
        )}

        {view === 'report' && active && <Report survey={active} />}
      </main>
    </div>

    <Footer />
  </>
);
}

export default App;