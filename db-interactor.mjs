import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config.js';
import http from 'http';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const server = http.createServer(async (req, res) => {
    // Basic CORS for local testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SST Admin Impostor</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <link href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css" rel="stylesheet">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
                <style>
                    :root {
                        --bg-main: #050505;
                        --bg-glass: rgba(20, 20, 20, 0.65);
                        --bg-glass-hover: rgba(35, 35, 35, 0.85);
                        --border-glass: rgba(255, 255, 255, 0.08);
                        --text-primary: #ffffff;
                        --text-secondary: #a1a1aa;
                        --accent-blue: #3b82f6;
                        --accent-blue-hover: #2563eb;
                        --accent-green: #10b981;
                        --accent-green-hover: #059669;
                        --input-bg: rgba(255, 255, 255, 0.03);
                        --input-border: rgba(255, 255, 255, 0.1);
                    }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        font-family: 'Inter', sans-serif;
                        background-color: var(--bg-main);
                        background-image: 
                            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
                            radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%);
                        background-attachment: fixed;
                        color: var(--text-primary);
                        min-height: 100vh;
                        padding: 32px;
                        line-height: 1.5;
                    }
                    .container { max-width: 1400px; margin: 0 auto; }
                    /* Typography */
                    h2 {
                        font-weight: 700;
                        font-size: 28px;
                        letter-spacing: -0.5px;
                        background: linear-gradient(to right, #ffffff, #a1a1aa);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin-bottom: 6px;
                    }
                    p.subheading {
                        color: var(--text-secondary);
                        font-size: 15px;
                        margin-bottom: 24px;
                    }
                    /* Layout */
                    .header {
                        background: var(--bg-glass);
                        backdrop-filter: blur(16px);
                        -webkit-backdrop-filter: blur(16px);
                        border: 1px solid var(--border-glass);
                        padding: 28px;
                        border-radius: 16px;
                        margin-bottom: 32px;
                        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
                    }
                    .controls {
                        display: flex;
                        gap: 16px;
                        align-items: center;
                        flex-wrap: wrap;
                    }
                    /* Inputs & Buttons */
                    input, select, textarea {
                        padding: 12px 18px;
                        border-radius: 10px;
                        border: 1px solid var(--input-border);
                        background: var(--input-bg);
                        color: var(--text-primary);
                        font-size: 14px;
                        outline: none;
                        font-family: 'Inter', sans-serif;
                        transition: all 0.3s ease;
                        width: 100%;
                    }
                    input:focus, select:focus, textarea:focus {
                        border-color: rgba(59, 130, 246, 0.5);
                        background: rgba(255, 255, 255, 0.05);
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    }
                    button {
                        padding: 12px 24px;
                        border-radius: 10px;
                        border: 1px solid rgba(255,255,255,0.1);
                        background: rgba(255,255,255,0.05);
                        color: var(--text-primary);
                        font-weight: 600;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        backdrop-filter: blur(8px);
                    }
                    button:not(:disabled):hover {
                        background: rgba(255,255,255,0.1);
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    }
                    button:not(:disabled):active {
                        transform: translateY(1px);
                    }
                    button:disabled {
                        opacity: 0.4 !important;
                        cursor: not-allowed !important;
                    }
                    button.fetch-btn {
                        background: linear-gradient(135deg, var(--accent-blue), #60a5fa);
                        border: none;
                        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                    }
                    button.fetch-btn:not(:disabled):hover {
                        background: linear-gradient(135deg, var(--accent-blue-hover), var(--accent-blue));
                        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
                    }
                    button.create-btn {
                        background: linear-gradient(135deg, var(--accent-green), #34d399);
                        border: none;
                        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
                        color: #000;
                    }
                    button.create-btn:not(:disabled):hover {
                        background: linear-gradient(135deg, var(--accent-green-hover), var(--accent-green));
                        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
                    }
                    button.action-btn {
                        padding: 6px 12px;
                        font-size: 12px;
                        border-radius: 6px;
                        border: none;
                        box-shadow: none;
                        font-weight: 500;
                        transition: all 0.2s ease;
                        backdrop-filter: blur(4px);
                    }
                    button.action-btn.edit {
                        background: rgba(59, 130, 246, 0.15);
                        color: #60a5fa;
                        border: 1px solid rgba(59, 130, 246, 0.3);
                    }
                    button.action-btn.edit:hover {
                        background: rgba(59, 130, 246, 0.25);
                        transform: translateY(-1px);
                    }
                    button.action-btn.delete {
                        background: rgba(239, 68, 68, 0.15);
                        color: #f87171;
                        border: 1px solid rgba(239, 68, 68, 0.3);
                    }
                    button.action-btn.delete:hover {
                        background: rgba(239, 68, 68, 0.25);
                        transform: translateY(-1px);
                    }
                    /* Table */
                    .table-container, .table-wrapper {
                        background: var(--bg-glass);
                        backdrop-filter: blur(16px);
                        border: 1px solid var(--border-glass);
                        border-radius: 16px;
                        padding: 1px;
                        overflow-x: auto;
                        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        text-align: left;
                    }
                    th, td {
                        padding: 16px 20px;
                        border-bottom: 1px solid var(--border-glass);
                        font-size: 14px;
                        vertical-align: top;
                    }
                    th {
                        background: rgba(0, 0, 0, 0.2);
                        font-weight: 600;
                        color: var(--text-secondary);
                        text-transform: uppercase;
                        font-size: 12px;
                        letter-spacing: 0.5px;
                        white-space: nowrap;
                    }
                    tr {
                        transition: background-color 0.2s;
                    }
                    tr:hover td {
                        background: rgba(255, 255, 255, 0.02);
                    }
                    tr:last-child td {
                        border-bottom: none;
                    }
                    /* Custom Scrollbar */
                    ::-webkit-scrollbar { width: 10px; height: 10px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 5px; }
                    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                    
                    /* Badges */
                    .badge {
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        letter-spacing: 0.3px;
                        text-transform: capitalize;
                        display: inline-block;
                    }
                    .badge-pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
                    .badge-approved { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
                    .badge-rejected { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
                    
                    /* Dashboard Stats Grid */
                    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px; animation: fadeIn 0.4s ease-out; }
                    .stat-card { background: var(--bg-glass); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--border-glass); padding: 20px; border-radius: 16px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); transition: transform 0.2s ease, box-shadow 0.2s ease; }
                    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); border-color: rgba(255, 255, 255, 0.15); }
                    .stat-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); font-weight: 600; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
                    .stat-content { font-size: 14px; color: #f8fafc; line-height: 1.6; display: flex; flex-direction: column; gap: 6px; }
                    .stat-item { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
                    .stat-label { color: var(--text-secondary); font-weight: 500; }
                    .stat-value { font-weight: 600; font-size: 15px; }
                    .stat-value.highlight-green { color: #34d399; }
                    .stat-value.highlight-yellow { color: #fbbf24; }
                    .stat-value.highlight-red { color: #f87171; }
                    .stat-value.highlight-blue { color: #60a5fa; }
                    .stat-value.highlight-purple { color: #a78bfa; }
                    
                    .loading {
                        display: none;
                        color: #60a5fa;
                        font-weight: 500;
                        animation: pulse 1.5s infinite;
                        margin-left: auto;
                    }
                    @keyframes pulse {
                        0% { opacity: 0.6; }
                        50% { opacity: 1; }
                        100% { opacity: 0.6; }
                    }
                    /* Modals */
                    .modal-overlay {
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
                        display: none; justify-content: center; align-items: center; z-index: 1000;
                        animation: fadeIn 0.2s ease-out;
                    }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    .modal-content {
                        background: #0f1115; border: 1px solid var(--border-glass);
                        padding: 32px; border-radius: 20px;
                        width: 90%; max-width: 650px; max-height: 85vh; overflow-y: auto;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                    }
                    .form-group { margin-bottom: 20px; }
                    .form-group label {
                        display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-secondary); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;
                    }
                    .stats-text {
                        margin-left: auto; color: var(--text-secondary); font-size: 14px; font-weight: 500;
                        background: rgba(255,255,255,0.05); padding: 8px 16px; border-radius: 20px; border: 1px solid var(--border-glass);
                    }
                    .img-preview { max-width: 150px; max-height: 150px; border-radius: 8px; cursor: pointer; border: 1px solid var(--border-glass); transition: all 0.3s ease; object-fit: cover; }
                    .img-preview:hover { transform: scale(1.05); border-color: var(--accent-blue); box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
                    .nested-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-glass); padding: 12px; border-radius: 10px; margin-bottom: 8px; font-size: 13px; min-width: 250px; }
                    .nested-card strong { color: #fff; font-size: 14px; display: block; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid var(--border-glass); }
                    .nested-card span.label { color: var(--text-secondary); font-weight: 500; display: inline-block; width: 140px; }
                    .nested-card span.value { color: #f8fafc; }
                    pre { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px solid var(--border-glass); overflow-x: auto; font-size: 12px; color: #a78bfa; white-space: pre-wrap; word-break: break-all; }
                    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border-glass); padding-bottom: 16px; }
                    .modal-header h2 { margin: 0; font-size: 22px; background: none; -webkit-text-fill-color: var(--text-primary); }
                    .modal-close { color: var(--text-secondary); font-size: 24px; cursor: pointer; transition: color 0.2s; }
                    .modal-close:hover { color: white; }
                    #imageModal img { max-width: 90%; max-height: 90%; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8); }
                    #imageModal .close { position: absolute; top: 20px; right: 30px; color: #fff; font-size: 40px; font-weight: bold; cursor: pointer; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>SST Admin Impostor ඞ</h2>
                        <p class="subheading">The unofficial backdoor for database management and stealth record injection.</p>
                        
                        <div class="controls">
                            <label for="collectionInput" style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">TARGET COLLECTION</label>
                            <input type="text" id="collectionInput" value="registrations" style="width:220px; cursor:default; opacity: 0.7; font-weight: 500;" title="Double click to edit" readonly ondblclick="this.removeAttribute('readonly'); this.style.cursor='text'; this.style.opacity='1'; this.style.background='rgba(255,255,255,0.08)'; this.focus();" onblur="this.setAttribute('readonly', 'true'); this.style.cursor='default'; this.style.opacity='0.7'; this.style.background='var(--input-bg)';" placeholder="e.g., registrations, users..." />
                            <button class="fetch-btn" onclick="fetchData()">
                                <svg style="width:16px; height:16px; display:inline; vertical-align:-3px; margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                Fetch Records
                            </button>
                            <button class="create-btn" id="createBtn" onclick="openCreateModal()" disabled>
                                <svg style="width:16px; height:16px; display:inline; vertical-align:-3px; margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                Create Custom Record
                            </button>
                            <button class="create-btn" id="downloadBtn" onclick="openDownloadModal()" disabled style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <svg style="width:16px; height:16px; display:inline; vertical-align:-3px; margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download Records
                            </button>
                            <span class="loading" id="loading">
                                <svg style="width:16px; height:16px; display:inline; vertical-align:-3px; margin-right:4px; animation: spin 1s linear infinite;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                Processing...
                            </span>
                            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
                        </div>
                    </div>
                    
                    <div id="statsDashboard" class="stats-grid" style="display:none;">
                        <div class="stat-card">
                            <div class="stat-title">
                                <svg style="width:14px; height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Records & Status
                            </div>
                            <div id="recordCount" class="stat-content"></div>
                        </div>
                        <div class="stat-card" id="attendeesCard" style="display:none;">
                            <div class="stat-title">
                                <svg style="width:14px; height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                Attendees & Financials
                            </div>
                            <div id="attendeesCount" class="stat-content"></div>
                        </div>
                        <div class="stat-card" id="deptCard" style="display:none;">
                            <div class="stat-title">
                                <svg style="width:14px; height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                Top Departments
                            </div>
                            <div id="deptCount" class="stat-content"></div>
                        </div>
                    </div>
                    
                    <div class="stat-card" id="chartCard" style="display:none; flex-direction:column; min-width: 0; overflow: hidden; width: 100%; box-sizing: border-box; margin-bottom: 24px;">
                        <div class="stat-title" style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <svg style="width:14px; height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                Daily Registrations
                            </div>
                            <div style="display:flex; gap:8px; align-items:center;">
                                <input type="date" id="chartStartDate" style="width:130px; padding:6px; font-size:12px; background:rgba(255,255,255,0.05); color:#fff; border:1px solid var(--border-glass); border-radius:6px;" onchange="renderChartFromStats()" />
                                <span style="color:var(--text-secondary); font-size:12px;">to</span>
                                <input type="date" id="chartEndDate" style="width:130px; padding:6px; font-size:12px; background:rgba(255,255,255,0.05); color:#fff; border:1px solid var(--border-glass); border-radius:6px;" onchange="renderChartFromStats()" />
                            </div>
                        </div>
                        <div class="stat-content" style="height: 300px; width: 100%; position: relative; overflow-x: auto;">
                            <div id="chartWrapper" style="height: 100%; min-width: 100%;">
                                <canvas id="registrationsChart"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div id="searchContainer" style="display:none; margin-bottom: 24px; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.03); padding: 16px 24px; border-radius: 12px; border: 1px solid var(--border-glass); box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <svg style="width:20px; height:20px; color:var(--text-secondary);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input type="text" id="searchInput" placeholder="Search by attendee name..." style="width: 300px; padding: 10px 14px; background: var(--input-bg); border: 1px solid var(--border-glass);" onkeydown="if(event.key === 'Enter') searchRecord()" />
                        <button class="fetch-btn" style="padding: 10px 20px;" onclick="searchRecord()">Search</button>
                        <span id="searchResultMsg" style="color: #f87171; font-size: 14px; margin-left: auto; display: none; font-weight: 500;">Record not found</span>
                    </div>

                    <div id="tableContainer" class="table-wrapper">
                        <div class="empty-state">Click "Fetch Records" to load data</div>
                    </div>
                </div>
                
                <!-- Image Viewer Modal -->
                <div id="imageModal" class="modal-overlay" onclick="this.style.display='none'">
                    <span class="close">&times;</span>
                    <img id="modalImage" src="" />
                </div>
                
                <!-- Create Record Modal -->
                <div id="createModal" class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modalTitle">Insert New Record</h2>
                            <span class="modal-close" onclick="closeCreateModal()">&times;</span>
                        </div>
                        <div id="dynamicFormContainer">
                            <!-- Dynamic fields injected here -->
                        </div>
                        <div style="margin-top: 32px; display: flex; justify-content: flex-end; gap: 12px;">
                            <button style="background: transparent; border: 1px solid var(--border-glass);" onclick="closeCreateModal()">Cancel</button>
                            <button class="create-btn" id="insertBtn" onclick="submitCustomRecord()">
                                <svg style="width:16px; height:16px; display:inline; vertical-align:-3px; margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                <span id="insertBtnText">Insert into Database</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Download Records Modal -->
                <div id="downloadModal" class="modal-overlay" style="display:none;">
                    <div class="modal-content" style="max-width: 400px;">
                        <div class="modal-header">
                            <h2>Download Records</h2>
                            <span class="modal-close" onclick="document.getElementById('downloadModal').style.display='none'">&times;</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 16px; padding-top: 16px;">
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; color: white;">
                                <input type="checkbox" id="dl-all" onchange="toggleDownloadAll()" style="width: 18px; height: 18px; cursor: pointer;">
                                All Records
                            </label>
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; color: white;">
                                <input type="checkbox" id="dl-accepted" class="dl-status-check" value="approved" style="width: 18px; height: 18px; cursor: pointer;">
                                Accepted (Approved)
                            </label>
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; color: white;">
                                <input type="checkbox" id="dl-pending" class="dl-status-check" value="pending" style="width: 18px; height: 18px; cursor: pointer;">
                                Pending
                            </label>
                            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; color: white;">
                                <input type="checkbox" id="dl-rejected" class="dl-status-check" value="rejected" style="width: 18px; height: 18px; cursor: pointer;">
                                Rejected
                            </label>
                        </div>
                        <div style="margin-top: 32px; display: flex; justify-content: flex-end; gap: 12px;">
                            <button style="background: transparent; border: 1px solid var(--border-glass); padding: 10px 16px; color: var(--text-primary); border-radius: 8px; cursor: pointer;" onclick="document.getElementById('downloadModal').style.display='none'">Cancel</button>
                            <button class="create-btn" onclick="executeDownload()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <svg style="width:16px; height:16px; display:inline; vertical-align:-3px; margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>

                <script>
                    let currentColumns = []; // Store the schema so we can build the form
                    let lastFetchedData = []; // Store fetched data
                    let lastFetchedDailyStats = {};
                    let currentRandomMs = 0;
                    let currentCropper = null;
                    let currentEditDocId = null;
                    let initialFormData = null;
                    let currentChart = null;

                    function openDownloadModal() {
                        document.getElementById('dl-all').checked = true;
                        toggleDownloadAll();
                        document.getElementById('downloadModal').style.display = 'flex';
                    }

                    function toggleDownloadAll() {
                        const isAll = document.getElementById('dl-all').checked;
                        const checks = document.querySelectorAll('.dl-status-check');
                        checks.forEach(c => {
                            if (isAll) {
                                c.checked = true;
                                c.disabled = true;
                            } else {
                                c.disabled = false;
                            }
                        });
                    }

                    function executeDownload() {
                        const isAll = document.getElementById('dl-all').checked;
                        let selectedStatuses = [];
                        if (!isAll) {
                            document.querySelectorAll('.dl-status-check:checked').forEach(c => {
                                selectedStatuses.push(c.value);
                            });
                            if (selectedStatuses.length === 0) {
                                alert("Please select at least one status or check 'All Records'.");
                                return;
                            }
                        }

                        let recordsToExport = lastFetchedData;
                        if (!isAll) {
                            recordsToExport = recordsToExport.filter(r => {
                                const status = String(r.status || '').toLowerCase();
                                if (status === 'approved' || status === 'accepted') return selectedStatuses.includes('approved');
                                return selectedStatuses.includes(status);
                            });
                        }

                        if (recordsToExport.length === 0) {
                            alert("No records match the selected statuses.");
                            return;
                        }

                        const { jsPDF } = window.jspdf;
                        const doc = new jsPDF('landscape');
                        
                        const headers = currentColumns.filter(c => !['_id', '__v', 'rejectionReason', 'createdAt', 'updatedAt'].includes(c));
                        
                        const body = recordsToExport.map(record => {
                            const arr = headers.map(header => {
                                let val = record[header];
                                if (val === null || val === undefined) return '';
                                if (typeof val === 'string' && val.startsWith('data:image')) {
                                    return ''; // Leave empty, will draw in didDrawCell
                                }
                                if (typeof val === 'object') {
                                    if (Array.isArray(val)) {
                                        return val.map((item, idx) => {
                                            if (typeof item === 'object' && item !== null) {
                                                let str = '[Attendee ' + (idx + 1) + ']\\n';
                                                str += Object.entries(item)
                                                    .filter(([k, v]) => v !== null && v !== '' && k !== 'id' && k !== '_id')
                                                    .map(([k, v]) => '• ' + k.charAt(0).toUpperCase() + k.slice(1) + ': ' + v)
                                                    .join('\\n');
                                                return str;
                                            }
                                            return String(item);
                                        }).join('\\n\\n');
                                    }
                                    return Object.entries(val)
                                        .filter(([k, v]) => v !== null && v !== '')
                                        .map(([k, v]) => '• ' + k.charAt(0).toUpperCase() + k.slice(1) + ': ' + v)
                                        .join('\\n');
                                }
                                return String(val);
                            });
                            arr._originalRecord = record;
                            return arr;
                        });

                        doc.text("Exported Records - SST Admin", 14, 15);
                        
                        doc.autoTable({
                            head: [headers],
                            body: body,
                            startY: 20,
                            styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', valign: 'middle', minCellHeight: 35 },
                            headStyles: { fillColor: [16, 185, 129], textColor: 255 },
                            columnStyles: {
                                // optional: can constrain widths if needed
                            },
                            didDrawCell: function(data) {
                                if (data.section === 'body') {
                                    const header = headers[data.column.index];
                                    const record = data.row.raw && data.row.raw._originalRecord;
                                    if (!record) return;
                                    const rawVal = record[header];
                                    if (typeof rawVal === 'string' && rawVal.startsWith('data:image')) {
                                        try {
                                            // Extract format from data:image/png;base64,...
                                            const match = rawVal.match(/^data:image\\/(png|jpeg|jpg);base64,/i);
                                            const format = match ? match[1].toUpperCase() : 'JPEG';
                                            
                                            // Fit image into cell keeping aspect ratio rough square for simplicity
                                            const dim = Math.min(data.cell.width - 4, data.cell.height - 4, 31);
                                            if (dim > 0) {
                                                const x = data.cell.x + (data.cell.width / 2) - (dim / 2);
                                                const y = data.cell.y + (data.cell.height / 2) - (dim / 2);
                                                doc.addImage(rawVal, format, x, y, dim, dim);
                                            }
                                        } catch (e) {
                                            console.warn("Failed to render image for", header, e);
                                        }
                                    }
                                }
                            }
                        });

                        doc.save("SST_Records.pdf");
                        document.getElementById('downloadModal').style.display = 'none';
                    }

                    function showImage(src) {
                        document.getElementById('modalImage').src = src;
                        document.getElementById('imageModal').style.display = 'flex';
                    }
                
                    function getCollection() {
                        const val = document.getElementById('collectionInput').value.trim();
                        if (!val) { alert('Please enter a collection name'); return null; }
                        return encodeURIComponent(val);
                    }

                    async function fetchData() {
                        const col = getCollection();
                        if (!col) return;
                        
                        document.getElementById('loading').style.display = 'block';
                        try {
                            const response = await fetch('/api/data?collection=' + col);
                            const data = await response.json();
                            
                            // Sort data by createdAt (newest first) if available
                            data.sort((a, b) => {
                                const tA = (a.createdAt && a.createdAt.seconds) ? a.createdAt.seconds : 0;
                                const tB = (b.createdAt && b.createdAt.seconds) ? b.createdAt.seconds : 0;
                                return tB - tA;
                            });
                            
                            // Update total records count
                            const countEl = document.getElementById('recordCount');
                            if (countEl) {
                                let pending = 0, approved = 0, rejected = 0;
                                let confirmedAttendees = 0, unconfirmedAttendees = 0;
                                let confirmedM = 0, confirmedF = 0;
                                let unconfirmedM = 0, unconfirmedF = 0;
                                let confirmedPayment = 0, unconfirmedPayment = 0;
                                let hasStatus = false;
                                let deptStats = {};
                                let dailyStats = {};

                                data.forEach(item => {
                                    let s = '';
                                    let mCount = 0, fCount = 0;

                                    if (Array.isArray(item.attendees)) {
                                        item.attendees.forEach(attendee => {
                                            if (attendee && attendee.gender) {
                                                const g = String(attendee.gender).toLowerCase().trim();
                                                if (g === 'male' || g === 'm') mCount++;
                                                else if (g === 'female' || g === 'f') fCount++;
                                            }
                                        });
                                    }

                                    if (item.status) {
                                        hasStatus = true;
                                        s = item.status.toLowerCase();
                                        const qty = Number(item.quantity) || 0;
                                        const amt = Number(item.amount) || 0;

                                        if (s === 'pending') {
                                            pending++;
                                            unconfirmedAttendees += qty;
                                            unconfirmedM += mCount;
                                            unconfirmedF += fCount;
                                            unconfirmedPayment += amt;
                                        }
                                        else if (s === 'approved' || s === 'accepted') {
                                            approved++;
                                            confirmedAttendees += qty;
                                            confirmedM += mCount;
                                            confirmedF += fCount;
                                            confirmedPayment += amt;
                                        }
                                        else if (s === 'rejected') {
                                            rejected++;
                                        }
                                    }

                                    if (item.createdAt && item.createdAt.seconds) {
                                        const d = new Date(item.createdAt.seconds * 1000);
                                        const year = new Date().getFullYear();
                                        if (!(d.getMonth() < 5 || (d.getMonth() === 5 && d.getDate() < 25))) {
                                            const y = d.getFullYear();
                                            const m = String(d.getMonth() + 1).padStart(2, '0');
                                            const day = String(d.getDate()).padStart(2, '0');
                                            const dateKey = y + '-' + m + '-' + day;
                                            if (!dailyStats[dateKey]) dailyStats[dateKey] = { accepted: 0, pending: 0, rejected: 0 };
                                            
                                            const qty = 1;
                                            if (s === 'approved' || s === 'accepted') dailyStats[dateKey].accepted += qty;
                                            else if (s === 'pending') dailyStats[dateKey].pending += qty;
                                            else if (s === 'rejected') dailyStats[dateKey].rejected += qty;
                                        }
                                    }

                                    if ((s === 'approved' || s === 'accepted') && Array.isArray(item.attendees)) {
                                        item.attendees.forEach(attendee => {
                                            if (attendee && attendee.program) {
                                                const prog = String(attendee.program).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                                                if (prog) {
                                                    deptStats[prog] = (deptStats[prog] || 0) + 1;
                                                }
                                            }
                                        });
                                    }
                                });
                                
                                const attendeesCountEl = document.getElementById('attendeesCount');
                                const deptCountEl = document.getElementById('deptCount');
                                const statsDashboard = document.getElementById('statsDashboard');
                                const attendeesCard = document.getElementById('attendeesCard');
                                const deptCard = document.getElementById('deptCard');

                                if (hasStatus || data.length > 0) {
                                    if (statsDashboard) statsDashboard.style.display = 'grid';
                                } else {
                                    if (statsDashboard) statsDashboard.style.display = 'none';
                                }

                                if (hasStatus) {
                                    countEl.innerHTML = 
                                        '<div class="stat-item"><span class="stat-label">Total Records:</span> <span class="stat-value">' + data.length + '</span></div>' +
                                        '<div class="stat-item"><span class="stat-label">Pending:</span> <span class="stat-value highlight-yellow">' + pending + '</span></div>' +
                                        '<div class="stat-item"><span class="stat-label">Approved:</span> <span class="stat-value highlight-green">' + approved + '</span></div>' +
                                        '<div class="stat-item"><span class="stat-label">Rejected:</span> <span class="stat-value highlight-red">' + rejected + '</span></div>';
                                        
                                    if (attendeesCountEl && attendeesCard) {
                                        attendeesCard.style.display = 'flex';
                                        const confText = confirmedAttendees + ' <span style="font-size:12px; color:var(--text-secondary);">(' + confirmedF + 'f, ' + confirmedM + 'm)</span>';
                                        const unconfText = unconfirmedAttendees + ' <span style="font-size:12px; color:var(--text-secondary);">(' + unconfirmedF + 'f, ' + unconfirmedM + 'm)</span>';
                                        
                                        const formatter = new Intl.NumberFormat('en-US');
                                        const confPayText = formatter.format(confirmedPayment) + ' <span style="font-size:12px; font-weight:normal; color:var(--text-secondary);">PKR</span>';
                                        const unconfPayText = formatter.format(unconfirmedPayment) + ' <span style="font-size:12px; font-weight:normal; color:var(--text-secondary);">PKR</span>';

                                        attendeesCountEl.innerHTML = 
                                            '<div class="stat-item"><span class="stat-label">Confirmed:</span> <span class="stat-value highlight-green">' + confText + '</span></div>' +
                                            '<div class="stat-item"><span class="stat-label">Unconfirmed:</span> <span class="stat-value highlight-yellow">' + unconfText + '</span></div>' +
                                            '<div style="height: 1px; background: var(--border-glass); margin: 6px 0;"></div>' +
                                            '<div class="stat-item"><span class="stat-label">Conf. Payment:</span> <span class="stat-value highlight-green">' + confPayText + '</span></div>' +
                                            '<div class="stat-item"><span class="stat-label">Unconf. Payment:</span> <span class="stat-value highlight-yellow">' + unconfPayText + '</span></div>';
                                    }
                                } else {
                                    countEl.innerHTML = '<div class="stat-item"><span class="stat-label">Total Records:</span> <span class="stat-value">' + data.length + '</span></div>';
                                    if (attendeesCard) attendeesCard.style.display = 'none';
                                }

                                if (deptCountEl && deptCard) {
                                    const deptKeys = Object.keys(deptStats).sort((a,b) => deptStats[b] - deptStats[a]);
                                    if (deptKeys.length > 0) {
                                        deptCard.style.display = 'flex';
                                        const topKeys = deptKeys.slice(0, 5); // Limit to top 5 for clean UI
                                        const deptHtml = topKeys.map(k => '<div class="stat-item"><span class="stat-label">' + k + '</span> <span class="stat-value highlight-purple">' + deptStats[k] + '</span></div>').join('');
                                        const otherKeys = deptKeys.slice(5);
                                        const othersHtml = otherKeys.length > 0 ? '<div class="stat-item"><span class="stat-label">Others</span> <span class="stat-value highlight-blue">' + otherKeys.reduce((acc, k) => acc + deptStats[k], 0) + '</span></div>' : '';
                                        
                                        deptCountEl.innerHTML = deptHtml + othersHtml;
                                    } else {
                                        deptCard.style.display = 'none';
                                    }
                                }
                                
                                lastFetchedDailyStats = dailyStats;
                                renderChartFromStats();
                                
                                // Render table logic continues here
                            }
                            
                            lastFetchedData = data;
                            const createBtn = document.getElementById('createBtn');
                            if (createBtn) {
                                createBtn.disabled = false;
                                createBtn.style.opacity = '1';
                                createBtn.style.cursor = 'pointer';
                            }
                            
                            const downloadBtn = document.getElementById('downloadBtn');
                            if (downloadBtn) {
                                downloadBtn.disabled = false;
                                downloadBtn.style.opacity = '1';
                                downloadBtn.style.cursor = 'pointer';
                            }
                            
                            renderTable(data);
                        } catch (e) {
                            alert('Error fetching data: ' + e.message);
                            const countEl = document.getElementById('recordCount');
                            if (countEl) countEl.innerText = '';
                        } finally {
                            document.getElementById('loading').style.display = 'none';
                        }
                    }
                    
                    function formatDate(val) {
                        if (!val) return '-';
                        let d = null;
                        if (typeof val === 'object' && val.seconds !== undefined) {
                            d = new Date(val.seconds * 1000 + (val.nanoseconds ? val.nanoseconds / 1000000 : 0));
                        } else if (typeof val === 'string' && Date.parse(val)) {
                            d = new Date(val);
                        }
                        if (d) {
                            return d.toLocaleString();
                        }
                        return null;
                    }
                    
                    function renderAttendees(attendees) {
                        if (!Array.isArray(attendees)) return '<pre>' + JSON.stringify(attendees) + '</pre>';
                        if (attendees.length === 0) return '<span style="color:#64748b;">No attendees</span>';
                        
                        let html = '<div style="display:flex; flex-direction:column; gap:8px;">';
                        attendees.forEach((a, i) => {
                            html += \`<div class="nested-card"><strong>Attendee \${i+1}</strong>\`;
                            Object.keys(a).sort().forEach(key => {
                                const val = a[key];
                                let displayVal = val;
                                if (val === undefined || val === null || val === '') displayVal = '-';
                                else if (typeof val === 'object') displayVal = JSON.stringify(val);
                                
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                html += \`<div style="display: flex; margin-bottom: 4px;"><span class="label" style="flex-shrink: 0;">\${label}:</span> <span class="value" style="word-break: break-word;">\${displayVal}</span></div>\`;
                            });
                            html += \`</div>\`;
                        });
                        html += '</div>';
                        return html;
                    }

                    function searchRecord() {
                        const input = document.getElementById('searchInput');
                        const msg = document.getElementById('searchResultMsg');
                        if (!input || !lastFetchedData) return;
                        
                        const term = input.value.trim().toLowerCase();
                        if (!term) {
                            msg.style.display = 'none';
                            document.querySelectorAll('tr').forEach(tr => { tr.style.backgroundColor = ''; tr.style.boxShadow = ''; });
                            return;
                        }
                        
                        const match = lastFetchedData.find(item => {
                            if (!item.attendees || !Array.isArray(item.attendees)) return false;
                            return item.attendees.some(a => a.name && typeof a.name === 'string' && a.name.toLowerCase().includes(term));
                        });
                        
                        document.querySelectorAll('tr').forEach(tr => { tr.style.backgroundColor = ''; tr.style.boxShadow = ''; });
                        
                        if (match && match.id) {
                            msg.style.display = 'none';
                            const targetRow = document.getElementById('row_' + match.id);
                            if (targetRow) {
                                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                targetRow.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                                targetRow.style.boxShadow = 'inset 0 0 0 2px var(--accent-blue)';
                            }
                        } else {
                            msg.style.display = 'block';
                        }
                    }

                    function renderTable(data) {
                        const container = document.getElementById('tableContainer');
                        const searchContainer = document.getElementById('searchContainer');
                        
                        if (!data || data.length === 0) {
                            container.innerHTML = '<div class="empty-state">📦 No records found in this collection.</div>';
                            currentColumns = ['id', 'ticketType', 'amount', 'quantity', 'paymentProof', 'status', 'attendees', 'createdAt']; // accurate fallback
                            if (searchContainer) searchContainer.style.display = 'none';
                            return;
                        }
                        
                        if (searchContainer) searchContainer.style.display = 'flex';

                        const allKeys = new Set();
                        data.forEach(item => {
                            Object.keys(item).forEach(k => {
                                if(k !== '_docId') allKeys.add(k); 
                            });
                        });
                        
                        const preferredOrder = ['id', 'paymentProof', 'attendees', 'amount', 'quantity', 'status', 'createdAt'];
                        currentColumns = Array.from(allKeys).sort((a, b) => {
                            const idxA = preferredOrder.indexOf(a);
                            const idxB = preferredOrder.indexOf(b);
                            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                            if (idxA !== -1) return -1;
                            if (idxB !== -1) return 1;
                            return a.localeCompare(b);
                        });

                        let html = '<table><thead><tr>';
                        currentColumns.forEach(col => {
                            const prettyHeader = col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            html += '<th>' + prettyHeader + '</th>';
                        });
                        html += '<th style="text-align:right;">Actions</th>';
                        html += '</tr></thead><tbody>';

                        data.forEach(item => {
                            html += '<tr id="row_' + item.id + '">';
                            currentColumns.forEach(col => {
                                const val = item[col];
                                let displayVal = val;
                                const formattedDate = formatDate(val);
                                
                                if (val === undefined || val === null) {
                                    displayVal = '<span style="color:#64748b; font-style: italic;">null</span>';
                                } else if (col === 'id') {
                                    displayVal = '<span style="font-family: monospace; color: #60a5fa; font-size: 14px; font-weight: bold; white-space: nowrap;">' + val + '</span>' +
                                                 '<br><span style="font-size: 10px; color: #475569;">(DB: ' + item._docId + ')</span>';
                                } else if (col === 'paymentProof' || (typeof val === 'string' && val.startsWith('data:image'))) {
                                    displayVal = \`<img src="\${val}" class="img-preview" onclick="event.stopPropagation(); showImage('\${val}')" title="Click to enlarge" />\`;
                                } else if (col === 'attendees') {
                                    displayVal = renderAttendees(val);
                                } else if (formattedDate) {
                                    displayVal = '<span style="white-space: nowrap; color: #e2e8f0;">' + formattedDate + '</span>';
                                } else if (typeof val === 'object') {
                                    displayVal = '<pre>' + JSON.stringify(val, null, 2) + '</pre>';
                                } else if (typeof val === 'boolean') {
                                    displayVal = val ? '<span style="color:#10b981; font-weight:bold;">True</span>' : '<span style="color:#ef4444; font-weight:bold;">False</span>';
                                } else {
                                    const escaped = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                    displayVal = '<div style="white-space: normal; word-break: normal;">' + escaped + '</div>';
                                }
                                html += '<td>' + displayVal + '</td>';
                            });
                            let downloadProofBtn = '';
                            if (item.paymentProof) {
                                downloadProofBtn = '<button class="action-btn" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);" onclick="downloadImage(\\\'' + item.paymentProof + '\\\', \\\'payment_proof_' + item._docId + '\\\')">Download Proof</button>';
                            }
                            html += '<td style="text-align:right;"><div style="display:inline-flex; gap:8px; justify-content:flex-end;">' + downloadProofBtn + '<button class="action-btn edit" onclick="openCreateModal(\\\'' + item._docId + '\\\')">Edit</button><button class="action-btn delete" onclick="deleteRecord(\\\'' + item._docId + '\\\')">Delete</button></div></td>';
                            html += '</tr>';
                        });

                        html += '</tbody></table>';
                        container.innerHTML = html;
                    }

                    function downloadImage(dataUrl, filename) {
                        const a = document.createElement('a');
                        a.href = dataUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }

                    function renderChartFromStats() {
                        const chartCard = document.getElementById('chartCard');
                        if (!chartCard) return;
                        const dailyStats = lastFetchedDailyStats;
                        
                        if (Object.keys(dailyStats).length > 0) {
                            chartCard.style.display = 'flex';
                            const labels = [];
                            const dataAccepted = [];
                            const dataPending = [];
                            const dataRejected = [];
                            
                            const statKeys = Object.keys(dailyStats).sort();
                            
                            let startD = new Date(new Date().getFullYear(), 5, 25);
                            let maxDate = new Date(new Date().getFullYear(), 6, 20);
                            
                            if (statKeys.length > 0) {
                                const lastKeyDate = new Date(statKeys[statKeys.length - 1]);
                                if (lastKeyDate > maxDate) maxDate = lastKeyDate;
                            }

                            const startDateInput = document.getElementById('chartStartDate').value;
                            if (startDateInput) {
                                const parts = startDateInput.split('-');
                                startD = new Date(parts[0], parts[1] - 1, parts[2]);
                            }
                            const endDateInput = document.getElementById('chartEndDate').value;
                            if (endDateInput) {
                                const parts = endDateInput.split('-');
                                maxDate = new Date(parts[0], parts[1] - 1, parts[2]);
                            }

                            let curr = new Date(startD);
                            
                            while (curr <= maxDate) {
                                const y = curr.getFullYear();
                                const m = String(curr.getMonth() + 1).padStart(2, '0');
                                const day = String(curr.getDate()).padStart(2, '0');
                                const dateKey = y + '-' + m + '-' + day;
                                
                                labels.push(curr.toLocaleString('en-US', { month: 'short', day: 'numeric' }));
                                
                                const stats = dailyStats[dateKey] || { accepted: 0, pending: 0, rejected: 0 };
                                dataAccepted.push(stats.accepted);
                                dataPending.push(stats.pending);
                                dataRejected.push(stats.rejected);
                                
                                curr.setDate(curr.getDate() + 1);
                                if (labels.length > 365) break;
                            }
                            
                            const chartWrapper = document.getElementById('chartWrapper');
                            const chartCardEl = document.getElementById('chartCard');
                            if (chartWrapper && chartCardEl) {
                                const dynamicWidth = Math.max(labels.length * 50, chartCardEl.clientWidth - 40);
                                chartWrapper.style.width = dynamicWidth + 'px';
                            }

                            const ctx = document.getElementById('registrationsChart');
                            if (currentChart) {
                                currentChart.destroy();
                            }
                            
                            currentChart = new Chart(ctx, {
                                type: 'bar',
                                data: {
                                    labels: labels,
                                    datasets: [
                                        { label: 'Accepted', data: dataAccepted, backgroundColor: '#10b981', stack: 'Stack 0', borderRadius: 4, maxBarThickness: 24 },
                                        { label: 'Pending', data: dataPending, backgroundColor: '#eab308', stack: 'Stack 0', borderRadius: 4, maxBarThickness: 24 },
                                        { label: 'Rejected', data: dataRejected, backgroundColor: '#ef4444', stack: 'Stack 0', borderRadius: 4, maxBarThickness: 24 }
                                    ]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { labels: { color: '#e2e8f0', font: { family: 'Inter' } } }
                                    },
                                    scales: {
                                        x: { stacked: true, ticks: { color: '#94a3b8', font: { family: 'Inter' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                                        y: { stacked: true, ticks: { color: '#94a3b8', stepSize: 1, font: { family: 'Inter' } }, grid: { color: 'rgba(255,255,255,0.05)' } }
                                    }
                                }
                            });
                        } else {
                            chartCard.style.display = 'none';
                        }
                    }

                    // ====== MODAL & INSERT LOGIC ======
                    
                    function openCreateModal(editDocId = null) {
                        currentEditDocId = typeof editDocId === 'string' ? editDocId : null;
                        const isEdit = !!currentEditDocId;
                        document.getElementById('modalTitle').innerText = isEdit ? 'Edit Record' : 'Insert New Record';
                        const insertBtnText = document.getElementById('insertBtnText');
                        if (insertBtnText) insertBtnText.innerText = isEdit ? 'Update Record' : 'Insert into Database';
                        
                        currentRandomMs = Math.floor(Math.random() * 1000);
                        if (currentColumns.length === 0) {
                            currentColumns = ['id', 'ticketType', 'amount', 'quantity', 'paymentProof', 'status', 'attendees', 'createdAt']; // accurate fallback
                        }
                        
                        let defaultBase = 2950;
                        if (lastFetchedData && lastFetchedData.length > 0) {
                            for (const item of lastFetchedData) {
                                if (item.amount && item.quantity && item.quantity > 0) {
                                    defaultBase = item.amount / item.quantity;
                                    break;
                                }
                            }
                        }
                        
                        let html = '';
                        currentColumns.forEach(col => {
                            const prettyLabel = col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            
                            if (col === 'amount') {
                                html += '<div class="form-group"><label>Base Amount</label><input type="number" id="input_baseAmount" min="0" value="' + defaultBase + '" /></div>';
                                html += '<div class="form-group"><label>Amount (Total)</label><input type="number" id="input_amount" min="0" readonly style="background: rgba(255,255,255,0.02); cursor: not-allowed;" /></div>';
                            } else if (col === 'id') {
                                html += '<div class="form-group">';
                                html += '<label>Id</label>';
                                html += '<input type="text" id="input_id" readonly style="background: rgba(255,255,255,0.02); cursor: not-allowed;" />';
                                html += '<small id="id_error" style="color:#ef4444; display:none; margin-top:4px; font-size:12px;">Error: This ID already exists in records!</small>';
                                html += '</div>';
                            } else {
                                html += '<div class="form-group">';
                                html += '<label>' + prettyLabel + '</label>';
                                
                                if (col === 'createdAt') {
                                    html += '<input type="datetime-local" id="input_' + col + '" step="1" />';
                                } else if (col === 'status') {
                                    html += '<select id="input_' + col + '">' +
                                        '<option value="pending">pending</option>' +
                                        '<option value="approved">approved</option>' +
                                        '<option value="rejected">rejected</option>' +
                                    '</select>';
                                } else if (col === 'quantity') {
                                    html += '<input type="number" id="input_' + col + '" min="0" value="1" />';
                                } else if (col === 'attendees') {
                                    html += '<textarea id="input_' + col + '" rows="12">[]</textarea>';
                                } else if (col === 'paymentProof') {
                                    html += '<select id="input_paymentProof_select" style="margin-bottom:12px; width: 100%;">';
                                    html += '<option value="">-- Upload New Image --</option>';
                                    lastFetchedData.forEach(item => {
                                        if (item.paymentProof && item.paymentProof.startsWith('data:image')) {
                                            html += '<option value="' + item.paymentProof + '">' + item.id + ' (Existing Proof)</option>';
                                        }
                                    });
                                    html += '</select>';
                                    html += '<input type="file" id="input_paymentProof_file" accept="image/*" />';
                                    html += '<div id="paymentProof_preview_container" style="display:none; margin-top: 8px; text-align: left;">';
                                    html += '<img id="paymentProof_preview" src="" style="display:block; max-height: 200px; max-width: 100%; margin-bottom: 8px; border-radius: 4px; border: 1px solid var(--border-glass);" />';
                                    html += '<button type="button" id="btn_open_crop" class="fetch-btn" style="padding: 6px 12px; font-size: 12px; background: rgba(59, 130, 246, 0.6);">Crop Image</button>';
                                    html += '</div>';
                                    html += '<div id="cropper_wrapper" style="display:none; margin-top: 8px; width: 100%; max-height: 400px; overflow: hidden; border-radius: 8px; border: 1px solid var(--border-glass);"><img id="paymentProof_cropper_img" style="display:block; max-width: 100%;" /></div>';
                                    html += '<div id="cropper_actions" style="display:none; margin-top: 8px; gap: 8px;"><button type="button" id="btn_done_crop" class="create-btn" style="padding: 8px 16px; font-size: 13px;">Done Cropping</button></div>';
                                    html += '<input type="hidden" id="input_paymentProof" />';
                                } else if (col === 'ticketType') {
                                    html += '<input type="text" id="input_' + col + '" value="Full Experience" />';
                                } else {
                                    html += '<input type="text" id="input_' + col + '" />';
                                }
                                html += '</div>';
                            }
                        });
                        
                        document.getElementById('dynamicFormContainer').innerHTML = html;
                        
                        const createdAtInput = document.getElementById('input_createdAt');
                        const idInput = document.getElementById('input_id');
                        const idError = document.getElementById('id_error');
                        const insertBtn = document.getElementById('insertBtn');

                        // Pre-fill existing data or defaults
                        if (isEdit) {
                            const itemToEdit = lastFetchedData.find(d => d._docId === currentEditDocId);
                            if (itemToEdit) {
                                currentColumns.forEach(col => {
                                    const el = document.getElementById('input_' + col);
                                    if (el) {
                                        let val = itemToEdit[col];
                                        if (col === 'createdAt' && val) {
                                            const d = new Date(val.seconds * 1000 + (val.nanoseconds ? val.nanoseconds / 1000000 : 0));
                                            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                                            el.value = d.toISOString().slice(0, 19);
                                        } else if (col === 'attendees') {
                                            el.value = JSON.stringify(val, null, 2);
                                        } else if (val !== undefined && val !== null) {
                                            el.value = val;
                                        }
                                    }
                                });
                            }
                        } else {
                            if (createdAtInput) {
                                const now = new Date();
                                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                                createdAtInput.value = now.toISOString().slice(0,19);
                            }
                        }
                        
                        function updateId() {
                            if (createdAtInput && idInput && !isEdit) {
                                const dateObj = new Date(createdAtInput.value);
                                if (!isNaN(dateObj.getTime())) {
                                    const timeWithMs = dateObj.getTime() + currentRandomMs;
                                    idInput.value = 'SST-' + timeWithMs.toString().slice(-6);
                                }
                                
                                const exists = lastFetchedData.some(item => item.id === idInput.value);
                                if (exists) {
                                    if (idError) idError.style.display = 'block';
                                    if (insertBtn) {
                                        insertBtn.disabled = true;
                                        insertBtn.style.opacity = '0.5';
                                        insertBtn.style.cursor = 'not-allowed';
                                    }
                                } else {
                                    if (idError) idError.style.display = 'none';
                                    if (insertBtn) {
                                        insertBtn.disabled = false;
                                        insertBtn.style.opacity = '1';
                                        insertBtn.style.cursor = 'pointer';
                                    }
                                }
                            }
                        }
                        
                        if (createdAtInput && !isEdit) createdAtInput.addEventListener('input', updateId);
                        if (!isEdit) updateId(); // Run initial calculation
                        
                        const baseInput = document.getElementById('input_baseAmount');
                        const qtyInput = document.getElementById('input_quantity');
                        const amountInput = document.getElementById('input_amount');
                        const attendeesInput = document.getElementById('input_attendees');
                        
                        function updateAmount() {
                            let qty = 0;
                            if (qtyInput) {
                                qty = Number(qtyInput.value) || 0;
                            }
                            
                            if (baseInput && amountInput) {
                                const base = Number(baseInput.value) || 0;
                                amountInput.value = base * qty;
                            }
                            
                            if (attendeesInput) {
                                let currentAttendees = [];
                                try {
                                    currentAttendees = JSON.parse(attendeesInput.value);
                                    if (!Array.isArray(currentAttendees)) currentAttendees = [];
                                } catch (e) {
                                    currentAttendees = [];
                                }
                                
                                const sample = { 
                                    name: "Test User", 
                                    gender: "male/female",
                                    phone: "03211234567",
                                    batch: "F2022",
                                    program: "BSSE", 
                                    studentId: "F2022065XXX",
                                    email: "f2022065xxx@umt.edu.pk",
                                    emergencyName: "User",
                                    emergencyPhone: "03001234567",
                                    notes: "None"
                                };
                                
                                if (currentAttendees.length !== qty) {
                                    if (currentAttendees.length < qty) {
                                        while (currentAttendees.length < qty) {
                                            let newAttendee = Object.assign({}, sample);
                                            newAttendee.name = "Test User " + (currentAttendees.length + 1);
                                            currentAttendees.push(newAttendee);
                                        }
                                    } else if (currentAttendees.length > qty) {
                                        currentAttendees = currentAttendees.slice(0, qty);
                                    }
                                    attendeesInput.value = JSON.stringify(currentAttendees, null, 2);
                                }
                            }
                        }
                        
                        if (baseInput) baseInput.addEventListener('input', updateAmount);
                        if (qtyInput) qtyInput.addEventListener('input', updateAmount);
                        updateAmount();
                        
                        const proofSelect = document.getElementById('input_paymentProof_select');
                        const proofFile = document.getElementById('input_paymentProof_file');
                        const proofPreview = document.getElementById('paymentProof_preview');
                        const proofHidden = document.getElementById('input_paymentProof');
                        
                        function updateProofPreview(base64) {
                            const previewContainer = document.getElementById('paymentProof_preview_container');
                            const wrapper = document.getElementById('cropper_wrapper');
                            const actions = document.getElementById('cropper_actions');
                            const img = document.getElementById('paymentProof_cropper_img');
                            const btnOpenCrop = document.getElementById('btn_open_crop');
                            const btnDoneCrop = document.getElementById('btn_done_crop');
                            
                            if (currentCropper) {
                                currentCropper.destroy();
                                currentCropper = null;
                            }
                            
                            if (!base64) {
                                previewContainer.style.display = 'none';
                                wrapper.style.display = 'none';
                                actions.style.display = 'none';
                                proofPreview.src = '';
                                proofHidden.value = '';
                                return;
                            }
                            
                            proofPreview.src = base64;
                            proofHidden.value = base64; // Ensures DB gets value even if not cropped
                            previewContainer.style.display = 'block';
                            wrapper.style.display = 'none';
                            actions.style.display = 'none';
                            
                            btnOpenCrop.onclick = function() {
                                previewContainer.style.display = 'none';
                                wrapper.style.display = 'block';
                                actions.style.display = 'flex';
                                
                                img.onload = function() {
                                    if (currentCropper) currentCropper.destroy();
                                    currentCropper = new Cropper(img, {
                                        viewMode: 1,
                                        background: false,
                                        autoCropArea: 1,
                                    });
                                };
                                img.src = proofHidden.value; // load from current valid base64
                            };
                            
                            btnDoneCrop.onclick = function() {
                                if (currentCropper) {
                                    const canvas = currentCropper.getCroppedCanvas();
                                    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
                                    
                                    currentCropper.destroy();
                                    currentCropper = null;
                                    
                                    wrapper.style.display = 'none';
                                    actions.style.display = 'none';
                                    
                                    proofPreview.src = croppedBase64;
                                    proofHidden.value = croppedBase64;
                                    previewContainer.style.display = 'block';
                                }
                            };
                        }

                        if (proofSelect) {
                            proofSelect.addEventListener('change', (e) => {
                                if (e.target.value) {
                                    proofFile.style.display = 'none';
                                    
                                    // Scramble the Base64 by redrawing it on a canvas
                                    const img = new Image();
                                    img.onload = function() {
                                        const canvas = document.createElement('canvas');
                                        canvas.width = img.width;
                                        canvas.height = img.height;
                                        const ctx = canvas.getContext('2d');
                                        
                                        // Fill white background in case it's a transparent PNG being converted to JPEG
                                        ctx.fillStyle = '#FFFFFF';
                                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                                        ctx.drawImage(img, 0, 0);
                                        
                                        // Tweak the top-left pixel slightly to guarantee a unique hash/string
                                        const imgData = ctx.getImageData(0, 0, 1, 1);
                                        imgData.data[0] = (imgData.data[0] === 255) ? 254 : imgData.data[0] + 1;
                                        ctx.putImageData(imgData, 0, 0);
                                        
                                        // Export as JPEG to strip old metadata and get a completely fresh string
                                        let newBase64 = canvas.toDataURL('image/jpeg', 0.95);
                                        
                                        // Fallback if somehow it's still too large
                                        if (newBase64.length > 1000000) {
                                            newBase64 = canvas.toDataURL('image/jpeg', 0.85);
                                        }
                                        
                                        updateProofPreview(newBase64);
                                    };
                                    img.src = e.target.value;
                                    
                                } else {
                                    proofFile.style.display = 'block';
                                    updateProofPreview('');
                                    proofFile.value = '';
                                }
                            });
                        }
                        
                        if (proofFile) {
                            proofFile.addEventListener('change', (e) => {
                                const file = e.target.files[0];
                                if (!file) {
                                    updateProofPreview('');
                                    return;
                                }
                                
                                if (file.size > 500000) {
                                    alert('File is too large. Please upload an image under 500KB.');
                                    proofFile.value = '';
                                    updateProofPreview('');
                                    return;
                                }
                                
                                const reader = new FileReader();
                                reader.onload = function(evt) {
                                    const base64 = evt.target.result;
                                    if (base64.length > 1000000) {
                                        alert('Image too large after Base64 conversion (exceeds 1MB limit).');
                                        proofFile.value = '';
                                        updateProofPreview('');
                                        return;
                                    }
                                    updateProofPreview(base64);
                                };
                                reader.readAsDataURL(file);
                            });
                        }
                        
                        if (isEdit) {
                            const itemToEdit = lastFetchedData.find(d => d._docId === currentEditDocId);
                            if (itemToEdit && itemToEdit.paymentProof && typeof itemToEdit.paymentProof === 'string' && itemToEdit.paymentProof.startsWith('data:image')) {
                                updateProofPreview(itemToEdit.paymentProof);
                                if (proofSelect) proofSelect.value = itemToEdit.paymentProof;
                            }
                            
                            initialFormData = {};
                            currentColumns.forEach(col => {
                                const el = document.getElementById('input_' + col);
                                if (el) initialFormData[col] = el.value;
                            });
                            if (proofHidden) initialFormData['paymentProof'] = proofHidden.value;
                            
                            insertBtn.disabled = true; insertBtn.style.opacity = '0.5'; insertBtn.style.cursor = 'not-allowed';
                            
                            const checkChanges = () => {
                                let hasChanged = false;
                                currentColumns.forEach(col => {
                                    const el = document.getElementById('input_' + col);
                                    if (el && el.value !== initialFormData[col]) hasChanged = true;
                                });
                                if (proofHidden && proofHidden.value !== initialFormData['paymentProof']) hasChanged = true;
                                
                                if (hasChanged) {
                                    insertBtn.disabled = false; insertBtn.style.opacity = '1'; insertBtn.style.cursor = 'pointer';
                                } else {
                                    insertBtn.disabled = true; insertBtn.style.opacity = '0.5'; insertBtn.style.cursor = 'not-allowed';
                                }
                            };
                            
                            currentColumns.forEach(col => {
                                const el = document.getElementById('input_' + col);
                                if (el) el.addEventListener('input', checkChanges);
                            });
                            if (proofSelect) proofSelect.addEventListener('change', () => setTimeout(checkChanges, 100));
                            if (proofFile) proofFile.addEventListener('change', () => setTimeout(checkChanges, 100));
                        }
                        
                        document.getElementById('createModal').style.display = 'flex';
                    }
                    
                    function closeCreateModal() {
                        if (currentCropper) {
                            currentCropper.destroy();
                            currentCropper = null;
                        }
                        document.getElementById('createModal').style.display = 'none';
                    }
                    
                    async function submitCustomRecord() {
                        const col = getCollection();
                        if (!col) return;
                        
                        const payload = {};
                        currentColumns.forEach(c => {
                            const el = document.getElementById('input_' + c);
                            if (!el || !el.value.trim()) return; // skip empty
                            
                            let val = el.value.trim();
                            
                            if (c === 'quantity' || c === 'amount') {
                                val = Number(val);
                            } else if (c === 'attendees') {
                                try { val = JSON.parse(val); } catch(e) { alert('Invalid JSON in attendees field!'); throw e; }
                            } else if (c === 'createdAt') {
                                const d = new Date(val);
                                val = new Date(d.getTime() + currentRandomMs).toISOString();
                            }
                            // Date conversion happens on the backend so we just pass the string
                            payload[c] = val;
                        });
                        
                        document.getElementById('loading').style.display = 'block';
                        closeCreateModal();
                        
                        try {
                            const isEdit = !!currentEditDocId;
                            const endpoint = isEdit ? '/api/update?collection=' + col + '&id=' + currentEditDocId : '/api/create_custom?collection=' + col;
                            const method = isEdit ? 'PUT' : 'POST';
                            const res = await fetch(endpoint, {
                                method: method,
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });
                            if (!res.ok) throw new Error(await res.text());
                            await fetchData();
                        } catch (e) {
                            alert('Error inserting record: ' + e.message);
                            document.getElementById('loading').style.display = 'none';
                        }
                    }

                    async function deleteRecord(id) {
                        const col = getCollection();
                        if (!col) return;
                        
                        if (!confirm('Are you sure you want to delete this record?')) return;
                        document.getElementById('loading').style.display = 'block';
                        try {
                            await fetch('/api/delete?collection=' + col + '&id=' + id, { method: 'DELETE' });
                            await fetchData();
                        } catch (e) {
                            alert('Error: ' + e.message);
                            document.getElementById('loading').style.display = 'none';
                        }
                    }

                    // Attempt initial load if enter pressed
                    document.getElementById('collectionInput').addEventListener('keypress', function (e) {
                        if (e.key === 'Enter') fetchData();
                    });
                </script>
            </body>
            </html>
        `);
    } else if (req.method === 'GET' && req.url.startsWith('/api/data')) {
        try {
            const url = new URL(req.url, 'http://localhost');
            const colName = url.searchParams.get('collection');
            if (!colName) throw new Error('Collection name required');
            
            const querySnapshot = await getDocs(collection(db, colName));
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ _docId: doc.id, ...doc.data() });
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
        }
    } else if (req.method === 'POST' && req.url.startsWith('/api/create_custom')) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const url = new URL(req.url, 'http://localhost');
                const colName = url.searchParams.get('collection');
                if (!colName) throw new Error('Collection name required');
                
                const payload = JSON.parse(body);
                
                // Convert createdAt string from datetime-local back into Firestore Timestamp
                if (payload.createdAt) {
                    const dateObj = new Date(payload.createdAt);
                    payload.createdAt = {
                        seconds: Math.floor(dateObj.getTime() / 1000),
                        nanoseconds: (dateObj.getTime() % 1000) * 1000000
                    };
                }
                
                const docRef = await addDoc(collection(db, colName), payload);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ id: docRef.id }));
            } catch (error) {
                res.writeHead(500);
                res.end(error.message);
            }
        });
    } else if (req.method === 'PUT' && req.url.startsWith('/api/update')) {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const url = new URL(req.url, 'http://localhost');
                const colName = url.searchParams.get('collection');
                const id = url.searchParams.get('id');
                if (!colName || !id) throw new Error('Collection and ID required');
                
                const payload = JSON.parse(body);
                
                if (payload.createdAt) {
                    const dateObj = new Date(payload.createdAt);
                    payload.createdAt = {
                        seconds: Math.floor(dateObj.getTime() / 1000),
                        nanoseconds: (dateObj.getTime() % 1000) * 1000000
                    };
                }
                
                await updateDoc(doc(db, colName, id), payload);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                res.writeHead(500);
                res.end(error.message);
            }
        });
    } else if (req.method === 'DELETE' && req.url.startsWith('/api/delete')) {
        try {
            const url = new URL(req.url, 'http://localhost');
            const colName = url.searchParams.get('collection');
            const id = url.searchParams.get('id');
            if (!colName || !id) throw new Error('Collection and ID required');
            
            await deleteDoc(doc(db, colName, id));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
        }
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Web interface running at http://localhost:${PORT}`);
    console.log(`Open this URL in your browser to interact with the database.`);
});
