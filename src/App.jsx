import { useMemo, useState } from 'react'

const STORAGE_KEY = 'medtrace-records'
const ADMIN_SESSION_KEY = 'medtrace-admin'

function sampleDate(daysAgo, hour, minute) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const seedRecords = [
  {
    serial: 'MT-2025-084291',
    name: 'Amoxicillin',
    strength: '500 mg · 20 capsules',
    batch: 'AMX-24-0918',
    manufacturer: 'Northstar Pharmaceuticals',
    expiry: '18 Sep 2027',
    status: 'In transit',
    history: [
      { status: 'In transit', location: 'Regional distribution center · Mumbai', date: sampleDate(0, 10, 42), note: 'Shipment departed for local fulfillment.' },
      { status: 'Quality verified', location: 'Northstar facility · Pune', date: sampleDate(2, 15, 16), note: 'Batch passed quality control and packaging inspection.' },
      { status: 'Manufactured', location: 'Northstar facility · Pune', date: sampleDate(4, 9, 30), note: 'Production completed for batch AMX-24-0918.' },
    ],
  },
  {
    serial: 'MT-2025-017536',
    name: 'Metformin',
    strength: '850 mg · 30 tablets',
    batch: 'MET-24-1102',
    manufacturer: 'Asterion Labs',
    expiry: '02 Nov 2027',
    status: 'Delivered',
    history: [
      { status: 'Delivered', location: 'Carewell Pharmacy · Bengaluru', date: sampleDate(1, 11, 8), note: 'Received and checked in by pharmacy staff.' },
      { status: 'In transit', location: 'Bengaluru fulfillment hub', date: sampleDate(2, 8, 22), note: 'Shipment scanned and dispatched for delivery.' },
      { status: 'Quality verified', location: 'Asterion Labs · Hyderabad', date: sampleDate(6, 14, 45), note: 'Batch inspection passed.' },
    ],
  },
  {
    serial: 'MT-2025-063804',
    name: 'Vitamin D3',
    strength: '60,000 IU · 4 capsules',
    batch: 'VD3-25-0321',
    manufacturer: 'Helio Health',
    expiry: '21 Mar 2028',
    status: 'Quality verified',
    history: [
      { status: 'Quality verified', location: 'Helio Health · Chennai', date: sampleDate(0, 9, 4), note: 'All quality and safety checks completed.' },
      { status: 'Manufactured', location: 'Helio Health · Chennai', date: sampleDate(1, 13, 30), note: 'Production completed for batch VD3-25-0321.' },
    ],
  },
]

const statusOptions = ['Manufactured', 'Quality verified', 'In transit', 'Delivered']

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" /></>,
    truck: <><path d="M10 17h4V5H2v12h3M14 9h4l4 4v4h-3" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function isTrackingEvent(event) {
  return event !== null
    && typeof event === 'object'
    && statusOptions.includes(event.status)
    && typeof event.location === 'string'
    && event.location.trim().length > 0
    && typeof event.date === 'string'
    && event.date.trim().length > 0
    && typeof event.note === 'string'
    && event.note.trim().length > 0
}

function isMedicineRecord(record) {
  return record !== null
    && typeof record === 'object'
    && typeof record.serial === 'string'
    && record.serial.trim().length > 0
    && typeof record.name === 'string'
    && record.name.trim().length > 0
    && typeof record.strength === 'string'
    && typeof record.batch === 'string'
    && typeof record.manufacturer === 'string'
    && typeof record.expiry === 'string'
    && statusOptions.includes(record.status)
    && Array.isArray(record.history)
    && record.history.length > 0
    && record.history.every(isTrackingEvent)
}

function refreshLegacySampleDates(records) {
  const legacyDates = {
    '20 Oct 2025, 10:42 AM': sampleDate(0, 10, 42),
    '18 Oct 2025, 3:16 PM': sampleDate(2, 15, 16),
    '16 Oct 2025, 9:30 AM': sampleDate(4, 9, 30),
    '19 Oct 2025, 11:08 AM': sampleDate(1, 11, 8),
    '18 Oct 2025, 8:22 AM': sampleDate(2, 8, 22),
    '14 Oct 2025, 2:45 PM': sampleDate(6, 14, 45),
    '20 Oct 2025, 9:04 AM': sampleDate(0, 9, 4),
    '19 Oct 2025, 1:30 PM': sampleDate(1, 13, 30),
  }
  return records.map((record) => ({
    ...record,
    history: record.history.map((event) => legacyDates[event.date]
      ? { ...event, date: legacyDates[event.date] }
      : event),
  }))
}

function readRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRecords))
      return { records: seedRecords, error: '' }
    }
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)
      && parsed.every(isMedicineRecord)
      && new Set(parsed.map((record) => record.serial)).size === parsed.length) {
      const records = refreshLegacySampleDates(parsed)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      } catch {
        return {
          records,
          error: 'Browser storage could not be updated. Existing records are shown, but new updates may not persist.',
        }
      }
      return { records, error: '' }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRecords))
    return {
      records: seedRecords,
      error: 'Saved medicine data was invalid, so the demo records were restored.',
    }
  } catch (error) {
    return {
      records: seedRecords,
      error: error instanceof SyntaxError
        ? 'Saved medicine data could not be read. Demo records are shown instead.'
        : 'Browser storage is unavailable. Demo records are shown, but updates may not persist.',
    }
  }
}

function readAdminSession() {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

function statusTone(status) {
  if (status === 'Delivered') return 'bg-emerald-50 text-emerald-800'
  if (status === 'In transit') return 'bg-amber-50 text-amber-800'
  if (status === 'Manufactured') return 'bg-indigo-50 text-indigo-700'
  return 'bg-green-50 text-green-800'
}

function eventIcon(status) {
  if (status === 'Delivered' || status === 'Quality verified') return 'check'
  if (status === 'In transit') return 'truck'
  return 'box'
}

function App() {
  const [initialRecords] = useState(readRecords)
  const [records, setRecords] = useState(initialRecords.records)
  const [storageError, setStorageError] = useState(initialRecords.error)
  const [query, setQuery] = useState('')
  const [searchedSerial, setSearchedSerial] = useState('')
  const [searchError, setSearchError] = useState('')
  const [isAdmin, setIsAdmin] = useState(readAdminSession)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedSerial, setSelectedSerial] = useState('')
  const [eventStatus, setEventStatus] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [eventNote, setEventNote] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const searchedRecord = useMemo(
    () => records.find((record) => record.serial.toLowerCase() === searchedSerial.toLowerCase()),
    [records, searchedSerial],
  )
  const selectedRecord = records.find((record) => record.serial === selectedSerial) ?? records[0]
  const totalEvents = records.reduce((total, record) => total + record.history.length, 0)
  const inTransitCount = records.filter((record) => record.status === 'In transit').length
  const deliveredCount = records.filter((record) => record.status === 'Delivered').length

  function handleSearch(event) {
    event.preventDefault()
    const serial = query.trim()
    if (!serial) {
      setSearchError('Enter a serial number to trace your medicine.')
      setSearchedSerial('')
      return
    }
    setSearchError('')
    setSearchedSerial(serial)
  }

  function handleLogin(event) {
    event.preventDefault()
    if (email.trim().toLowerCase() !== 'admin@medtrace.com' || password !== 'admin123') {
      setLoginError('That email and password don’t match. Try the demo credentials below.')
      return
    }
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
    } catch {
      setLoginError('Browser session storage is unavailable. Enable it to use the demo admin view.')
      return
    }
    setIsAdmin(true)
    setSelectedSerial(records[0]?.serial ?? '')
    setEventStatus(records[0]?.status ?? 'In transit')
    setLoginOpen(false)
    setLoginError('')
    setEmail('')
    setPassword('')
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY)
    } catch {
      setStorageError('Browser session storage could not be cleared. Close this tab to end the demo session.')
    }
    setIsAdmin(false)
  }

  function showPublicTracker() {
    handleLogout()
    setSearchedSerial('')
  }

  function handleUpdate(event) {
    event.preventDefault()
    if (!selectedRecord || !eventLocation.trim() || !eventNote.trim()) {
      setUpdateError('Add a location and a short update before saving.')
      return
    }
    const status = eventStatus || selectedRecord.status
    const newEvent = {
      status,
      location: eventLocation.trim(),
      date: new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
      note: eventNote.trim(),
    }
    const updatedRecords = records.map((record) => record.serial === selectedRecord.serial
      ? { ...record, status, history: [newEvent, ...record.history] }
      : record)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords))
    } catch {
      setUpdateError('Your browser could not save this update. Check available storage and try again.')
      return
    }
    setRecords(updatedRecords)
    setStorageError('')
    setEventLocation('')
    setEventNote('')
    setUpdateError('')
  }

  const logo = (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-emerald-800 text-white"><Icon name="shield" size={21} /></span>
      <span className="font-[Manrope,sans-serif] text-xl font-extrabold tracking-[-1px] text-slate-800">medtrace<span className="text-emerald-600">.</span></span>
    </span>
  )

  return (
    <div className={`min-h-screen overflow-hidden bg-[#fbfcf9] text-[#192c25] ${isAdmin ? 'bg-[#f7f9f6]' : ''}`}>
      <header className="relative z-10 flex h-[68px] items-center justify-between border-b border-slate-100 bg-white/90 px-[6vw] md:h-[76px] md:px-[max(calc((100vw-1200px)/2),6.7vw)]">
        <a href="#" aria-label="MedTrace home" onClick={(event) => { event.preventDefault(); isAdmin ? handleLogout() : setIsAdmin(false) }}>{logo}</a>
        {isAdmin ? (
          <div className="flex items-center gap-5">
            <span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><i className="size-1.5 rounded-full bg-emerald-500" /> Admin workspace</span>
            <button className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600" onClick={handleLogout}><span className="grid size-8 place-items-center rounded-full bg-emerald-50 text-emerald-800">A</span><span className="hidden sm:inline">Admin</span><Icon name="logout" size={16} /></button>
          </div>
        ) : (
          <>
            <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-[67px] flex-col gap-5 border-b border-slate-100 bg-white px-[6vw] py-5 text-sm font-semibold text-slate-600 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-9 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
              <a href="#trust" onClick={() => setMobileMenuOpen(false)}>Our commitment</a>
              <button className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border border-emerald-100 bg-white px-4 text-emerald-800 hover:bg-emerald-50" onClick={() => { setLoginOpen(true); setMobileMenuOpen(false) }}><Icon name="lock" size={15} /> Admin login</button>
            </nav>
            <button className="grid size-10 place-items-center text-emerald-900 md:hidden" aria-label="Toggle navigation" onClick={() => setMobileMenuOpen((open) => !open)}><Icon name={mobileMenuOpen ? 'close' : 'menu'} /></button>
          </>
        )}
      </header>

      {isAdmin ? (
        <main className="mx-auto min-h-[calc(100vh-150px)] max-w-[1200px] px-[5vw] py-9 md:py-11">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div><p className="text-[9px] font-bold tracking-[1.3px] text-emerald-700">OVERVIEW <span className="mx-1 text-slate-300">·</span> {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()}</p><h1 className="mb-1 mt-2 font-[Manrope,sans-serif] text-xl font-bold tracking-tight text-slate-800 md:text-[27px]">Good morning, Admin <span className="text-emerald-600">✳</span></h1><p className="text-[10px] text-slate-500 md:text-xs">Here’s what’s happening across your medicine supply chain.</p></div>
            <button className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-100 bg-white px-2.5 text-[9px] font-bold text-emerald-800 hover:bg-emerald-50 md:px-4 md:text-[10px]" onClick={showPublicTracker}>Sign out to public tracker <Icon name="arrow" size={15} /></button>
          </div>
          <section className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4" aria-label="Tracking overview">
            <StatCard icon="box" title="Tracked medicines" value={records.length} caption="Serial numbers registered" color="text-emerald-700 bg-emerald-50" />
            <StatCard icon="truck" title="In transit" value={inTransitCount} caption="Currently moving through the chain" color="text-amber-700 bg-amber-50" />
            <StatCard icon="check" title="Delivered" value={deliveredCount} caption="Successfully received" color="text-sky-700 bg-sky-50" />
            <StatCard icon="clock" title="Trace events" value={totalEvents} caption="Updates logged across all batches" color="text-violet-700 bg-violet-50" />
          </section>
          <div className="grid items-start gap-4 lg:grid-cols-[1.15fr_.85fr]">
            <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 md:p-5">
              <PanelHeading eyebrow="YOUR INVENTORY" title="Tracked medicines"><span className="rounded-full border border-slate-100 px-2.5 py-1.5 text-[9px] text-slate-500">{records.length} records</span></PanelHeading>
              <div className="mt-4 space-y-1">
                {records.map((record) => (
                  <button key={record.serial} className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left transition md:gap-3 ${selectedRecord?.serial === record.serial ? 'border-emerald-100 bg-emerald-50/60' : 'border-transparent hover:bg-slate-50'}`} onClick={() => { setSelectedSerial(record.serial); setEventStatus(record.status); setUpdateError('') }}>
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icon name="box" size={18} /></span>
                    <span className="grid min-w-0 flex-1 gap-1"><strong className="text-[10px] text-slate-700">{record.name}</strong><small className="text-[8px] text-slate-400">{record.serial}</small></span>
                    <StatusBadge status={record.status} compact />
                  </button>
                ))}
              </div>
              {selectedRecord && <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3.5">
                <p className="text-[8px] font-bold tracking-widest text-emerald-700">SELECTED MEDICINE</p>
                <h3 className="mb-2 mt-2 text-xs font-bold text-slate-700">{selectedRecord.name} <span className="ml-1 font-normal text-slate-400">{selectedRecord.strength}</span></h3>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-[9px] text-slate-500"><span>Batch <b className="ml-1 text-slate-600">{selectedRecord.batch}</b></span><span>Expires <b className="ml-1 text-slate-600">{selectedRecord.expiry}</b></span></div>
              </div>}
              <div className="mb-1 mt-6"><PanelHeading eyebrow="LATEST ACTIVITY" title="Previous history" /></div>
              <Timeline events={selectedRecord?.history ?? []} compact />
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
              <PanelHeading eyebrow="KEEP THE RECORD CURRENT" title="Update tracking"><span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icon name="plus" /></span></PanelHeading>
              {selectedRecord && <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-slate-50 p-2.5 text-[9px] text-slate-500"><i className="size-1.5 rounded-full bg-emerald-500" /> Updating <strong className="text-slate-700">{selectedRecord.name}</strong><span className="ml-auto text-[8px] text-slate-400">{selectedRecord.serial}</span></div>}
              {storageError && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-[10px] text-amber-900" role="status">{storageError}</p>}
              <form className="mt-4 grid gap-3.5" onSubmit={handleUpdate}>
                <label className="grid gap-1.5 text-[10px] font-semibold text-slate-600">Tracking status<select className="h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={eventStatus || selectedRecord?.status || 'In transit'} onChange={(event) => setEventStatus(event.target.value)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
                <label className="grid gap-1.5 text-[10px] font-semibold text-slate-600">Current location<span className="relative"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="pin" size={17} /></span><input className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[11px] font-normal outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={eventLocation} onChange={(event) => setEventLocation(event.target.value)} placeholder="e.g. Central distribution hub · Delhi" /></span></label>
                <label className="grid gap-1.5 text-[10px] font-semibold text-slate-600">Update note<textarea className="min-h-20 resize-y rounded-lg border border-slate-200 px-2.5 py-2 text-[11px] font-normal leading-relaxed outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={eventNote} onChange={(event) => setEventNote(event.target.value)} rows="4" placeholder="Add a clear note about this tracking update..." /></label>
                {updateError && <p className="text-[10px] text-red-700" role="alert">{updateError}</p>}
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-800 text-xs font-bold text-white hover:bg-emerald-900" type="submit"><Icon name="plus" size={18} /> Save tracking update</button>
              </form>
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50/70 p-3 text-[9px] leading-relaxed text-slate-500"><Icon name="shield" size={17} /><span>Updates are stored on this device and immediately appear in the public medicine trace.</span></div>
            </section>
          </div>
          <p className="mt-4 text-center text-[9px] text-slate-400">Demo workspace · Changes are saved locally in this browser.</p>
        </main>
      ) : (
        <main>
          {storageError && <p className="mx-[6vw] mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 md:mx-auto md:max-w-[1060px]" role="status">{storageError}</p>}
          <section className="relative grid min-h-[550px] overflow-hidden bg-[#f3f7f0] px-[6vw] py-14 md:min-h-[558px] md:grid-cols-[1.02fr_.98fr] md:items-center md:px-[max(calc((100vw-1200px)/2),6.7vw)] md:py-16">
            <div className="relative z-[2] max-w-[560px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[9px] font-bold tracking-[1.1px] text-emerald-800"><i className="size-1.5 rounded-full bg-emerald-500" /> MEDICINE TRANSPARENCY, BUILT IN</div>
              <h1 className="mb-4 mt-5 font-[Manrope,sans-serif] text-[clamp(40px,5vw,54px)] font-bold leading-[1.11] tracking-[-2.5px] text-[#18352a]">Know the journey.<br /><span className="text-[#4c8967]">Trust what you take.</span></h1>
              <p className="max-w-[440px] text-sm leading-7 text-slate-500">Every medicine has a story. Follow its journey from the moment it’s made to the moment it reaches you.</p>
              <form className="mt-7 flex h-[60px] max-w-[505px] items-center gap-3 rounded-xl border border-slate-100 bg-white p-1.5 pl-4 text-emerald-700 shadow-lg shadow-emerald-950/5 focus-within:border-emerald-400" onSubmit={handleSearch}>
                <Icon name="search" size={20} /><input className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" aria-label="Medicine serial number" value={query} onChange={(event) => { setQuery(event.target.value); setSearchError('') }} placeholder="Enter your medicine’s serial number" />
                <button className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-emerald-800 px-3 text-[10px] font-bold text-white hover:bg-emerald-900 md:px-4 md:text-xs" type="submit">Trace medicine <Icon name="arrow" size={15} /></button>
              </form>
              {searchError ? <p className="mt-2 text-[11px] text-red-700" role="alert">{searchError}</p> : <p className="ml-1 mt-2 text-[11px] text-slate-400">Look for the unique serial number on your medicine pack.</p>}
              <div className="mt-6 flex flex-wrap items-center gap-3 text-[9px] font-semibold text-slate-500 sm:gap-4 sm:text-[10px]"><span className="inline-flex items-center gap-1.5"><Icon name="check" size={15} /> Verified supply chain</span><i className="h-3.5 w-px bg-slate-300" /><span className="inline-flex items-center gap-1.5"><Icon name="lock" size={14} /> Your health, your peace of mind</span></div>
            </div>
            <MedicineIllustration />
            <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 rotate-180 text-[7px] tracking-[1.4px] text-emerald-900/30 [writing-mode:vertical-rl] md:block">A CLEARER PATH TO BETTER HEALTH — TRACE WITH CONFIDENCE</div>
          </section>

          {searchedSerial && <section className="relative z-[2] mx-[5vw] mb-12 mt-[-18px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl shadow-emerald-950/5 md:mx-auto md:max-w-[1060px] md:p-7" aria-live="polite">
            {searchedRecord ? <>
              <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-bold tracking-widest text-emerald-700">MEDICINE TRACE RESULT</p><h2 className="mt-1.5 font-[Manrope,sans-serif] text-lg font-bold text-slate-800 md:text-xl">Your medicine’s journey</h2></div><StatusBadge status={searchedRecord.status} /></div>
              <div className="my-4 flex items-center gap-3 border-y border-slate-100 py-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon name="box" size={22} /></span>
                <div><h3 className="text-xs font-bold text-slate-700 md:text-sm">{searchedRecord.name} <span className="ml-1 text-[10px] font-normal text-slate-400">{searchedRecord.strength}</span></h3><p className="mt-1.5 text-[8px] text-slate-400 md:text-[9px]">Serial {searchedRecord.serial} <span className="mx-1.5">·</span> Batch {searchedRecord.batch}</p></div>
                <span className="ml-auto hidden text-right text-[9px] text-slate-400 sm:block">Expires <b className="ml-1 text-slate-600">{searchedRecord.expiry}</b></span>
              </div>
              <Timeline events={searchedRecord.history} />
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500"><Icon name="shield" size={17} /><span>Manufactured by <strong className="text-slate-700">{searchedRecord.manufacturer}</strong></span></div>
            </> : <div className="flex flex-wrap items-center gap-4 py-2"><span className="grid size-11 place-items-center rounded-xl bg-slate-50 text-slate-500"><Icon name="search" /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-bold text-slate-700">No medicine found for that serial</h2><p className="mt-1 text-[10px] text-slate-500">Check the number on the package and try again. Serial numbers are not case-sensitive.</p></div><button className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-800" onClick={() => { setQuery(''); setSearchedSerial('') }}>Try another number</button></div>}
          </section>}

          <section className="mx-auto grid max-w-[1060px] gap-7 px-[6vw] py-16 md:grid-cols-[.85fr_1.45fr] md:items-center md:gap-14 md:px-0 md:py-[85px]" id="how-it-works">
            <div><p className="text-[9px] font-bold tracking-[1.3px] text-emerald-700">A LITTLE MORE CERTAINTY</p><h2 className="mb-3 mt-3 font-[Manrope,sans-serif] text-[27px] font-bold leading-tight tracking-tight text-slate-800 md:text-3xl">From source to you,<br />nothing left to guess.</h2><p className="max-w-[285px] text-xs leading-relaxed text-slate-500">One simple trace brings the entire supply journey into focus.</p></div>
            <div className="grid grid-cols-3 gap-2.5 md:gap-5">
              <StepCard number="01" icon="search" title="Find your serial" description="Look for the unique MedTrace number on your medicine packaging." />
              <StepCard number="02" icon="box" title="Follow its journey" description="See verified milestones, from quality checks to delivery." />
              <StepCard number="03" icon="shield" title="Feel confident" description="Know where your medicine came from and how it got to you." />
            </div>
          </section>
          <section className="mx-[5vw] mb-9 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 md:mx-auto md:mb-14 md:max-w-[1060px] md:gap-4 md:p-6" id="trust">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Icon name="shield" size={22} /></span><div className="flex-1"><b className="text-[10px] text-emerald-950 md:text-xs">Better information makes better care.</b><p className="mt-1 text-[9px] leading-relaxed text-slate-500 md:text-[10px]">MedTrace helps make medicine supply chains more transparent, one verified journey at a time.</p></div><span className="hidden text-[8px] font-bold tracking-widest text-emerald-800/60 sm:block">MADE FOR PEACE OF MIND ✳</span>
          </section>
        </main>
      )}

      <footer className="flex min-h-[72px] items-center justify-between gap-3 border-t border-slate-100 bg-white px-[6vw] py-4 text-[9px] text-slate-400 md:px-[max(calc((100vw-1200px)/2),6.7vw)]">
        <a href="#" aria-label="MedTrace home" onClick={(event) => { event.preventDefault(); isAdmin ? handleLogout() : setIsAdmin(false) }}>{logo}</a><span className="hidden sm:block">Medicine transparency, built for everyone.</span><span className="whitespace-nowrap">© {new Date().getFullYear()} MedTrace <i className="mx-2 inline-block size-[3px] rounded-full bg-slate-300" /> Demo experience</span>
      </footer>

      {loginOpen && <div className="fixed inset-0 z-20 grid place-items-center bg-emerald-950/40 p-5 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLoginOpen(false) }}>
        <section className="relative w-full max-w-[405px] rounded-2xl border border-slate-100 bg-white p-7 shadow-2xl md:p-9" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <button className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg bg-slate-50 text-slate-500" aria-label="Close login" onClick={() => setLoginOpen(false)}><Icon name="close" /></button>
          <span className="mb-5 grid size-11 place-items-center rounded-xl bg-emerald-800 text-white"><Icon name="shield" size={25} /></span><p className="text-[9px] font-bold tracking-widest text-emerald-700">MEDTRACE ADMIN</p><h2 id="login-title" className="mb-1 mt-2 font-[Manrope,sans-serif] text-[27px] font-bold tracking-tight text-slate-800">Welcome back.</h2><p className="text-xs leading-relaxed text-slate-500">Sign in to update medicine tracking and review supply history.</p>
          <form className="mt-5 grid gap-3.5" onSubmit={handleLogin}>
            <label className="grid gap-1.5 text-[10px] font-semibold text-slate-600">Email address<input className="h-11 rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@medtrace.com" required /></label>
            <label className="grid gap-1.5 text-[10px] font-semibold text-slate-600">Password<input className="h-11 rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></label>
            {loginError && <p className="text-[10px] text-red-700" role="alert">{loginError}</p>}
            <button className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-800 text-xs font-bold text-white hover:bg-emerald-900" type="submit">Sign in to dashboard <Icon name="arrow" size={16} /></button>
          </form>
          <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border border-dashed border-emerald-100 bg-emerald-50/50 p-3 text-[10px]"><span className="row-span-2 self-center text-[8px] font-bold tracking-wider text-emerald-800/70">DEMO ACCESS</span><b className="font-semibold text-slate-600">admin@medtrace.com</b><b className="font-semibold text-slate-600">admin123</b></div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] text-slate-500"><Icon name="lock" size={14} /> Public demo credentials — this is not secure authentication.</p>
        </section>
      </div>}
    </div>
  )
}

function StatusBadge({ status, compact = false }) {
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-[9px] font-bold ${statusTone(status)} ${compact ? 'gap-1 px-1.5 text-[8px]' : ''}`}><i className="size-1 rounded-full bg-current" />{status}</span>
}

function StatCard({ icon, title, value, caption, color }) {
  return <article className="relative min-h-[120px] rounded-xl border border-slate-200 bg-white p-3.5 md:min-h-[135px] md:p-[17px]">
    <span className={`absolute right-3 top-3 grid size-8 place-items-center rounded-lg md:right-4 md:top-4 ${color}`}><Icon name={icon} /></span>
    <span className="mb-2 block text-[9px] font-semibold text-slate-500 md:text-[10px]">{title}</span><strong className="block font-[Manrope,sans-serif] text-2xl font-bold text-slate-800 md:text-[28px]">{value}</strong><span className="mt-1 block max-w-[150px] text-[8px] leading-relaxed text-slate-400">{caption}</span>
  </article>
}

function PanelHeading({ eyebrow, title, children }) {
  return <div className="flex items-center justify-between gap-3"><div><p className="text-[8px] font-bold tracking-widest text-emerald-700">{eyebrow}</p><h2 className="mt-1.5 font-[Manrope,sans-serif] text-base font-bold tracking-tight text-slate-800">{title}</h2></div>{children}</div>
}

function Timeline({ events, compact = false }) {
  return <ol className={`grid list-none p-0 ${compact ? 'gap-0 pt-3' : 'gap-4 pt-5 md:grid-cols-3 md:gap-0'}`}>
    {events.map((event, index) => <li key={`${event.date}-${event.status}`} className={`relative flex gap-2.5 ${compact ? 'min-h-[62px] pb-3' : 'md:pr-4'}`}>
      {index < events.length - 1 && <span className={`absolute bg-slate-200 ${compact ? 'bottom-2 left-[13px] top-7 w-px' : 'left-7 top-[14px] hidden h-px w-[calc(100%-28px)] md:block'}`} />}
      <span className={`relative z-[1] grid size-[28px] shrink-0 place-items-center rounded-full border ${index === 0 ? 'border-emerald-600 bg-emerald-600 text-white ring-4 ring-emerald-50' : 'border-slate-200 bg-white text-emerald-700'}`}><Icon name={eventIcon(event.status)} size={13} /></span>
      <div className="min-w-0 flex-1 pt-0.5"><div className={`flex ${compact ? 'flex-row justify-between' : 'flex-col'} gap-1`}><strong className="text-[9px] text-slate-600">{event.status}</strong><time className="text-[8px] text-slate-400">{event.date}</time></div>
        <p className="my-1.5 flex items-center gap-1 text-[8px] text-slate-500 md:text-[9px]"><Icon name="pin" size={13} />{event.location}</p>{!compact && <p className="text-[9px] leading-relaxed text-slate-400">{event.note}</p>}</div>
    </li>)}
  </ol>
}

function StepCard({ number, icon, title, description }) {
  return <article className="relative min-h-[157px] rounded-xl border border-slate-100 bg-white p-3.5 md:min-h-[170px] md:p-5"><span className="absolute right-3 top-3 text-[9px] font-bold tracking-wider text-slate-300 md:right-4 md:top-4">{number}</span><span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 md:size-9"><Icon name={icon} size={18} /></span><h3 className="mb-1 mt-4 text-[9px] font-bold text-slate-700 md:mt-4 md:text-xs">{title}</h3><p className="text-[8px] leading-relaxed text-slate-500 md:text-[10px]">{description}</p></article>
}

function MedicineIllustration() {
  return <div className="relative mx-auto mt-8 grid h-[350px] w-full max-w-[460px] place-items-center md:mt-0 md:h-[400px]" aria-hidden="true">
    <div className="absolute size-[275px] rounded-full bg-[radial-gradient(circle,#dfeedd_0,rgba(223,238,221,.42)_53%,transparent_72%)] md:size-[335px]" /><div className="art-orbit art-orbit-one" /><div className="art-orbit art-orbit-two" />
    <div className="relative z-[1] w-[295px] -rotate-3 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_23px_65px_rgba(41,76,52,.15)] md:w-[328px]">
      <div className="flex items-center gap-2 text-[8px] font-bold tracking-widest text-slate-500"><span className="grid size-6 place-items-center rounded-md bg-emerald-800 text-white"><Icon name="shield" size={16} /></span> MEDTRACE VERIFIED <span className="ml-auto grid size-5 place-items-center rounded-full bg-emerald-600 text-white"><Icon name="check" size={13} /></span></div>
      <div className="pack-art relative my-3 h-[180px] overflow-hidden rounded-lg md:h-[202px]"><div className="pack-shine" /><div className="capsule capsule-one" /><div className="capsule capsule-two" /><div className="absolute left-5 top-8 text-emerald-950"><span className="block text-[8px] font-bold tracking-widest">AMOXICILLIN</span><b className="block font-[Manrope,sans-serif] text-[52px] leading-tight tracking-[-3px]">500<span className="ml-1 text-lg">mg</span></b><small className="text-[8px] text-emerald-900/60">20 capsules · batch AMX-24-0918</small></div><div className="absolute bottom-5 right-5 flex flex-col items-center gap-1 text-emerald-800/60"><Icon name="shield" size={27} /><span className="text-center text-[6px] font-bold leading-tight tracking-wider">AUTHENTIC<br />MEDICINE</span></div></div>
      <div className="flex items-center justify-between text-[8px] text-emerald-900/70"><span className="inline-flex items-center gap-1.5 font-semibold"><i className="size-1.5 rounded-full bg-emerald-500" /> Authenticity confirmed</span><span className="text-[7px] text-slate-400">MT-2025-084291</span></div>
    </div>
    <div className="absolute right-0 top-4 z-[2] flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3 shadow-lg md:right-0 md:top-10"><span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icon name="check" size={16} /></span><span><b className="block text-[10px] text-slate-700">Quality verified</b><small className="mt-1 block text-[8px] text-slate-400">Every step, accounted for</small></span></div>
    <div className="absolute bottom-3 left-0 z-[2] flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3 shadow-lg md:bottom-8"><span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><Icon name="pin" size={16} /></span><span><b className="block text-[10px] text-slate-700">Tracked in real time</b><small className="mt-1 block text-[8px] text-slate-400">From maker to medicine cabinet</small></span></div>
    <span className="absolute left-[9%] top-[14%] text-sm text-emerald-700/50">✳</span><span className="absolute bottom-[12%] right-[10%] text-xs text-emerald-700/50">✳</span>
  </div>
}

export default App
