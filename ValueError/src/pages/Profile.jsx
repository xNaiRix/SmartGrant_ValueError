import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext"; // Pastikan path ini benar
import Button from "../components/Button"; // Pastikan kamu punya komponen ini
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  Save,
  Edit,
  Mail,
  X,
  Check,
  XCircle,
  Clock,
  CreditCard,
  Camera,
  Trash2, // Saya tambah icon sampah untuk fitur delete
} from "lucide-react";

export default function Profile() {
  const {
    user,
    // Data dari API
    fundRequests, // Ini adalah Projects
    grantOffers, // Ini adalah Grants
    applications, // Ini masih kosong di AppContext, jadi aman tapi tidak muncul data

    // Fungsi dari API
    deleteProject,
    deleteGrant,
  } = useApp();

  const navigate = useNavigate();

  // --- SAFETY CHECK 1: Loading State ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  // --- HELPER LOCAL ---
  // Fungsi dummy karena endpoint ini belum ada di AppContext/Swagger kamu
  const updateUser = (data) => {
    console.log("Update User Mock:", data);
    alert("Fitur Update Profile belum tersedia di API backend.");
  };

  const updateApplicationStatus = (id, status) => {
    console.log("Update Status Mock:", id, status);
    alert("Fitur Update Status Aplikasi belum tersedia di API backend.");
  };

  // --- STATE ---
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    bankInfo: user.bankInfo || "", // Field ini mungkin tidak ada di API user, jadi default string kosong
    role: user.role || "",
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bankInfo: user.bankInfo || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    updateUser(formData);
    setEditMode(false);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  // --- FILTER LOGIC (DISESUAIKAN DENGAN REAL API) ---

  // 1. SCIENTIST PROJECTS
  // Di Swagger kamu fieldnya: scientist_email
  // Kita filter berdasarkan email user yang login
  const myRequests = fundRequests.filter(
    (r) => r.scientist_email === user.email || r.scientistEmail === user.email
  );

  // 2. GRANT OFFERS
  // Di Swagger fieldnya: scientist_email (jika company yang bikin, mungkin backend simpan di situ atau field lain)
  // Kita pakai logika "milik saya"
  const myOffers = grantOffers.filter(
    (g) => g.scientist_email === user.email || g.scientistEmail === user.email
  );

  // 3. APPLICATIONS (Sementara kosong/mock safe)
  const myApplications = applications.filter(
    (a) => a.scientistId === user.id || a.scientistId === user.email
  );

  const fundedProjects = applications.filter(
    (a) =>
      (a.companyId === user.id || a.companyId === user.email) &&
      a.status === "accepted"
  );

  // --- HELPERS DATA MAPPING ---
  // API kamu pakai 'name', Mock pakai 'title'. Kita buat adapter.
  const getGrantDetails = (grantId) => {
    const found = grantOffers.find((g) => g.id === grantId);
    return found
      ? { title: found.name, description: found.description } // Map 'name' ke 'title'
      : { title: "Unknown Grant", description: "-" };
  };

  const getProjectDetails = (reqId) => {
    const found = fundRequests.find((r) => r.id === reqId);
    return found
      ? {
          title: found.name, // Map 'name' ke 'title'
          description: found.description,
          totalFunding: "N/A", // API belum ada field ini
          items: "Check description", // API belum ada field ini
          scientistName: found.scientist_email,
        }
      : { title: "Unknown Project", description: "", totalFunding: 0 };
  };

  // --- HANDLE DELETE ---
  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    const confirm = window.confirm(
      `Delete "${selectedItem.name || selectedItem.title}"?`
    );
    if (confirm) {
      if (modalType === "request") {
        // Swagger butuh grant_id, kita kirim 0 dummy
        await deleteProject(selectedItem.id, 0);
      } else if (modalType === "grant-manage") {
        await deleteGrant(selectedItem.id);
      }
      setSelectedItem(null); // Tutup modal
    }
  };

  // --- MODAL COMPONENT ---
  const DetailModal = () => {
    if (!selectedItem) return null;

    // Normalisasi: API pakai .name, UI lama pakai .title. Kita ambil salah satu yg ada.
    const displayTitle = selectedItem.name || selectedItem.title;

    const grantDetail =
      modalType === "application"
        ? getGrantDetails(selectedItem.grantId)
        : null;
    const projectDetail =
      modalType === "application"
        ? getProjectDetails(selectedItem.requestId)
        : null;
    const grantApplicants =
      modalType === "grant-manage"
        ? applications.filter((a) => a.grantId === selectedItem.id)
        : [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[85vh]">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
            <h3 className="text-xl font-serif font-bold text-white">
              {modalType === "request" && "Project Detail"}
              {modalType === "application" && "Application Status"}
              {modalType === "grant-manage" && "Manage Grant"}
            </h3>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto text-slate-300">
            {/* TYPE 1: PROJECT DETAIL */}
            {modalType === "request" && (
              <>
                <div className="mb-6 pb-6 border-b border-slate-800 flex justify-between items-start">
                  <div>
                    <div className="text-sm text-slate-500 font-bold mb-1">
                      Project Title
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {displayTitle}
                    </h2>
                    <div className="text-sm text-blue-400 mt-1">
                      Scientist: {selectedItem.scientist_email || user.email}
                    </div>
                  </div>

                  {/* Tombol Delete ada di sini khusus Scientist */}
                  {user.role === "scientist" && (
                    <button
                      onClick={handleDeleteItem}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-500 font-bold">
                      Description
                    </label>
                    <div className="mt-1 text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedItem.description}
                    </div>
                  </div>

                  {/* Field ini statis karena API belum support angka funding */}
                  <div className="grid md:grid-cols-2 gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="text-sm text-slate-500 font-bold">
                        Budget Required
                      </label>
                      <div className="text-xl font-mono font-bold text-blue-400">
                        {/* Fallback jika API belum ada data funding */}
                        {selectedItem.totalFunding || "Not specified"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500 font-bold">
                        List of Needs
                      </label>
                      <div className="text-sm text-slate-400 whitespace-pre-wrap font-mono mt-1">
                        {selectedItem.items || "See description details"}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TYPE 2: APPLICATION STATUS */}
            {modalType === "application" && (
              <>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 text-center">
                  <div className="text-xs text-slate-500 uppercase mb-2">
                    Status
                  </div>
                  <div
                    className={`text-2xl font-bold capitalize ${
                      selectedItem.status === "accepted"
                        ? "text-green-500"
                        : selectedItem.status === "denied"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {selectedItem.status}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-500 font-bold">
                      Grant Offer:
                    </label>
                    <div className="text-lg font-bold text-violet-400">
                      {grantDetail.title}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 font-bold">
                      Your Project:
                    </label>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      {projectDetail.title}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TYPE 3: GRANT MANAGE */}
            {modalType === "grant-manage" && (
              <>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 mb-8 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-violet-400 mb-2">
                      {displayTitle}
                    </h2>
                    <p className="text-slate-400">{selectedItem.description}</p>
                  </div>
                  {/* Tombol Delete Grant */}
                  <button
                    onClick={handleDeleteItem}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  Applicants{" "}
                  <span className="bg-slate-800 text-xs px-2 py-1 rounded-full text-slate-400">
                    {grantApplicants.length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {grantApplicants.length === 0 && (
                    <p className="text-slate-500 italic">
                      No applications yet.
                    </p>
                  )}
                  {grantApplicants.map((app) => {
                    const proj = getProjectDetails(app.requestId);
                    return (
                      <div
                        key={app.id}
                        className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-white mb-1">
                            {proj.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            Ask: {proj.totalFunding}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex bg-slate-950 rounded-lg border border-slate-800 p-1">
                            <button
                              onClick={() =>
                                updateApplicationStatus(app.id, "review")
                              }
                              className="p-1.5 rounded text-slate-600 hover:text-yellow-500"
                            >
                              <Clock size={16} />
                            </button>
                            <button
                              onClick={() =>
                                updateApplicationStatus(app.id, "accepted")
                              }
                              className="p-1.5 rounded text-slate-600 hover:text-green-500"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() =>
                                updateApplicationStatus(app.id, "denied")
                              }
                              className="p-1.5 rounded text-slate-600 hover:text-red-500"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
            <Button onClick={() => setSelectedItem(null)} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl min-h-screen bg-transparent">
      {/* Catatan: bg-transparent krn mungkin parentnya sudah gelap */}

      <div className="mb-10">
        <h1 className="text-5xl font-serif font-bold text-white mb-2">
          Hi, {user.name || user.role}!
        </h1>
        <p className="text-2xl text-slate-400 font-serif italic">
          {user.role === "company"
            ? "Ready to make the impossible possible?"
            : "Ready to make changes?"}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-16 mb-20 items-start">
        <div className="w-full md:w-1/2 space-y-8 pt-2">
          <div className="relative group">
            <label className="text-sm font-bold text-slate-500 mb-1 block ml-1">
              Email Address
            </label>
            <div className="flex items-center border-b-2 border-slate-800 group-focus-within:border-blue-500 pb-2">
              <Mail className="text-slate-500 mr-3" size={20} />
              <input
                value={formData.email}
                readOnly // Email biasanya read only
                disabled
                className="bg-transparent w-full text-xl text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>
          <div className="relative group">
            <label className="text-sm font-bold text-slate-500 mb-1 block ml-1">
              Fund Through QR Code
            </label>

            <div className="flex items-center border-b-2 border-slate-800 group-focus-within:border-blue-500 pb-2">
              <CreditCard className="text-slate-500 mr-3" size={20} />
              <input
                value={formData.bankInfo}
                onChange={(e) =>
                  setFormData({ ...formData, bankInfo: e.target.value })
                }
                disabled={!editMode}
                placeholder="Scan QR to pay..."
                className="bg-transparent w-full text-xl text-white outline-none"
              />
              <button
                type="button"
                onClick={() => navigate("/scan-qr")}
                className="p-2 rounded-full hover:bg-slate-800 transition-colors active:scale-95"
              >
                <Camera
                  className="text-blue-400 hover:text-blue-300"
                  size={24}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3 flex flex-col gap-3">
          <Button
            onClick={editMode ? handleSave : () => setEditMode(true)}
            variant={editMode ? "primary" : "outline"}
            className="flex items-center justify-center gap-2 py-3 mb-4 bg-blue-600 text-white border-none hover:bg-blue-700"
          >
            {editMode ? <Save size={18} /> : <Edit size={18} />}{" "}
            {editMode ? "Save Changes" : "Edit Profile"}
          </Button>

          {user.role === "scientist" && (
            <>
              <button
                onClick={() => scrollToSection("sec-posted-request")}
                className="nav-btn flex justify-between px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:border-blue-500/50 hover:text-white transition-all"
              >
                Posted Fund Requests <ArrowDown size={18} />
              </button>
              <button
                onClick={() => scrollToSection("sec-applied-offer")}
                className="nav-btn flex justify-between px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:border-violet-500/50 hover:text-white transition-all"
              >
                Applied Grant Offers <ArrowDown size={18} />
              </button>
            </>
          )}

          {user.role === "company" && (
            <>
              <button
                onClick={() => scrollToSection("sec-posted-offer")}
                className="nav-btn flex justify-between px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:border-violet-500/50 hover:text-white transition-all"
              >
                Posted Grant Offers <ArrowDown size={18} />
              </button>
              <button
                onClick={() => scrollToSection("sec-connected")}
                className="nav-btn flex justify-between px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 hover:border-green-500/50 hover:text-white transition-all"
              >
                Connected Projects <ArrowDown size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="space-y-20 border-t border-slate-800 pt-10">
        {/* === SCIENTIST CONTENT === */}
        {user.role === "scientist" && (
          <>
            <div id="sec-posted-request">
              <h2 className="text-3xl font-serif font-bold mb-8 text-blue-400 pl-4 border-l-4 border-blue-500">
                Posted Fund Request
              </h2>

              {/* LIST PROJECTS */}
              {myRequests.length === 0 ? (
                <p className="text-slate-500 italic">
                  You haven't posted any projects yet.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {myRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        setSelectedItem(req);
                        setModalType("request");
                      }}
                      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-blue-500 transition-all"
                    >
                      <h3 className="text-xl font-bold mb-2 text-white">
                        {/* Menggunakan .name dari API */}
                        {req.name}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-3">
                        {req.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div id="sec-applied-offer">
              <h2 className="text-3xl font-serif font-bold mb-8 text-violet-400 pl-4 border-l-4 border-violet-500">
                Applied Grant Offer
              </h2>
              {/* Karena API applications belum diimplementasi, ini akan kosong */}
              {myApplications.length === 0 ? (
                <p className="text-slate-500 italic">No applications found.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedItem(app);
                        setModalType("application");
                      }}
                      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-violet-500 relative"
                    >
                      <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">
                        {app.status}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">
                        {getGrantDetails(app.grantId).title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2">
                        {getGrantDetails(app.grantId).description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* === COMPANY CONTENT === */}
        {user.role === "company" && (
          <>
            <div id="sec-posted-offer">
              <h2 className="text-3xl font-serif font-bold mb-8 text-violet-400 pl-4 border-l-4 border-violet-500">
                Posted Grant Offer
              </h2>
              {myOffers.length === 0 ? (
                <p className="text-slate-500 italic">
                  You haven't created any grants.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {myOffers.map((offer) => {
                    const applicantCount = applications.filter(
                      (a) => a.grantId === offer.id
                    ).length;
                    return (
                      <div
                        key={offer.id}
                        onClick={() => {
                          setSelectedItem(offer);
                          setModalType("grant-manage");
                        }}
                        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-violet-500 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="text-xl font-bold mb-2 text-white">
                            {/* API pakai .name */}
                            {offer.name}
                          </h3>
                          <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                            {offer.description}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-slate-800/50 text-xs font-bold text-slate-500">
                          <span
                            className={
                              applicantCount > 0 ? "text-violet-400" : ""
                            }
                          >
                            {applicantCount} Projects Applied
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div id="sec-connected">
              <h2 className="text-3xl font-serif font-bold mb-8 text-green-400 pl-4 border-l-4 border-green-500">
                Connected Projects
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {fundedProjects.map((app) => {
                  const project = getProjectDetails(app.requestId);
                  const grant = app.grantId
                    ? getGrantDetails(app.grantId)
                    : null;
                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedItem(project);
                        setModalType("request");
                      }}
                      className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-green-500 transition-all relative"
                    >
                      <div className="absolute top-4 right-4 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">
                        FUNDED
                      </div>
                      <h3 className="text-xl font-bold mb-1 text-white">
                        {project.title}
                      </h3>
                      <div className="text-xs font-bold uppercase tracking-wide mt-2 flex items-center gap-2 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                        {grant ? grant.title : "Directly Funded"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <DetailModal />
    </div>
  );
}
