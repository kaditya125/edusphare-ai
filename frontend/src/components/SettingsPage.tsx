import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Users,
  Link as LinkIcon,
  ShieldCheck,
  Upload,
  Plus,
  Pencil,
  Phone,
  Calendar,
  Mail,
  FileText,
  Globe,
  Clock,
  MapPin,
  Building,
  BookOpen,
  Check,
  X,
  Sparkles,
  Loader2,
  BrainCircuit,
  Bell
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../services/api";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    phone: "",
    address: "",
    program: "",
    currentSemester: "",
    advisor: "",
    enrollmentDate: "",
    bio: "",
    skills: [] as string[],
    studyPreferences: {
      focusModeHours: 2,
      preferredTime: "Evening",
      limitNotifications: false
    }
  });

  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/me');
      const data = res.data;
      setProfileData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.userId?.email || "",
        dob: data.dob || "",
        phone: data.contactNumber || "",
        address: data.address || "",
        program: data.program || "",
        currentSemester: `Semester ${data.currentSemester || 1}`,
        advisor: data.advisor || "Not Assigned",
        enrollmentDate: data.enrollmentDate || "",
        bio: data.bio || "",
        skills: data.skills || [],
        studyPreferences: data.studyPreferences || {
          focusModeHours: 2,
          preferredTime: "Evening",
          limitNotifications: false
        }
      });
      setStudentId(data.enrollmentNumber || "");
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/students/me', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dob: profileData.dob,
        contactNumber: profileData.phone,
        address: profileData.address,
        program: profileData.program,
        currentSemester: profileData.currentSemester.replace('Semester ', ''),
        advisor: profileData.advisor,
        enrollmentDate: profileData.enrollmentDate,
        bio: profileData.bio,
        skills: profileData.skills
      });
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    }
  };

  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimizeProfile = async () => {
    setIsOptimizing(true);
    try {
      const res = await api.post('/students/me/ai/optimize-profile', {
        bio: profileData.bio,
        skills: profileData.skills
      });
      const data = res.data;
      if (data.bio || data.skills) {
        setProfileData(prev => ({
          ...prev,
          bio: data.bio || prev.bio,
          skills: data.skills || prev.skills
        }));
        setIsEditingProfile(true); // Open edit mode so they see the changes and can save
      }
    } catch (err) {
      console.error("Optimize error", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const [studyGoal, setStudyGoal] = useState("");
  const [isGeneratingStudyPrefs, setIsGeneratingStudyPrefs] = useState(false);

  const handleGenerateStudyPrefs = async () => {
    if (!studyGoal.trim()) return;
    setIsGeneratingStudyPrefs(true);
    try {
      const res = await api.post('/students/me/ai/study-preferences', { goal: studyGoal });
      const newPrefs = res.data;
      setProfileData(prev => ({
        ...prev,
        studyPreferences: newPrefs
      }));
      // Immediately save the updated profile
      await api.put('/students/me', { ...profileData, studyPreferences: newPrefs });
      setStudyGoal("");
    } catch (err) {
      console.error("Study Pref Error", err);
    } finally {
      setIsGeneratingStudyPrefs(false);
    }
  };

  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setPasswordMessage("Passwords do not match");
      return;
    }
    setIsChangingPassword(true);
    setPasswordMessage("");
    try {
      await api.post('/auth/change-password', {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });
      setPasswordMessage("Password changed successfully!");
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordMessage(err.response?.data?.error || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: Users },
    { id: "study", label: "Smart Study Preferences", icon: BrainCircuit },
    { id: "security", label: "Security & Options", icon: ShieldCheck },
  ];

  return (
    <div className="flex-1 w-full h-full overflow-y-auto pt-16 lg:pt-20 px-4 md:px-8 bg-slate-50 dark:bg-slate-900 pb-20 relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Settings {isLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Student ID: {studentId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
            {activeTab === "profile" &&
              (isEditingProfile ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-md shadow-green-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </button>
              ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-700 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300",
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-600/50"
                  : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Personal Info */}
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative">
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-5 mb-8">
                    <div
                      className="w-20 h-20 rounded-2xl bg-cover bg-center shrink-0 border-2 border-white dark:border-slate-700 shadow-md"
                      style={{
                        backgroundImage:
                          "url('https://api.dicebear.com/7.x/notionists/svg?seed=sahanbaaz&backgroundColor=b6e3f4')",
                      }}
                    />
                    <div className="flex-1 max-w-[calc(100%-6rem)]">
                      {isEditingProfile ? (
                        <div className="space-y-2 flex gap-2">
                          <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleProfileChange}
                            placeholder="First Name"
                            className="w-full max-w-[150px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                          <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                            placeholder="Last Name"
                            className="w-full max-w-[150px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                            {profileData.firstName} {profileData.lastName}
                          </h3>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
                            {profileData.email}
                          </p>
                        </>
                      )}
                      <div className="inline-flex items-center px-2.5 py-0.5 mt-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-lg border border-blue-100 dark:border-blue-800/50">
                        Active Student
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                    Personal Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        First Name
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {profileData.firstName}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Last Name
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {profileData.lastName}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Date of Birth
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="dob"
                            value={profileData.dob}
                            onChange={handleProfileChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        ) : (
                          <span>{profileData.dob}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Phone Number
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        ) : (
                          <span>{profileData.phone}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Address
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        {isEditingProfile ? (
                          <input
                            type="text"
                            name="address"
                            value={profileData.address}
                            onChange={handleProfileChange}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                          />
                        ) : (
                          <span className="truncate">
                            {profileData.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Academic Details */}
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm relative h-full">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Academic
                    Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-6">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Course Program
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="program"
                          value={profileData.program}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {profileData.program}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Current Semester
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="currentSemester"
                          value={profileData.currentSemester}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {profileData.currentSemester}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Faculty Advisor
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="advisor"
                          value={profileData.advisor}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {profileData.advisor}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Enrollment Date
                      </div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          name="enrollmentDate"
                          value={profileData.enrollmentDate}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      ) : (
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {profileData.enrollmentDate}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Overall Attendance
                      </div>
                      <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                        86%
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                        style={{ width: "86%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* AI Profile Assistant Section */}
              <div className="col-span-1 lg:col-span-2">
                <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="flex-1 space-y-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" /> AI Profile Assistant
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Let AI craft a highly professional bio and suggest top technical skills based on your current program and department.
                      </p>
                      
                      <div className="space-y-4 pt-2">
                        <div>
                          <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Professional Bio</div>
                          {isEditingProfile ? (
                            <textarea
                              name="bio"
                              value={profileData.bio}
                              onChange={handleProfileChange}
                              rows={3}
                              className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                              placeholder="Write your bio or let AI generate one..."
                            />
                          ) : (
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                              {profileData.bio || "No bio added yet. Click 'Optimize Profile' to generate one!"}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Top Skills</div>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              name="skills"
                              value={profileData.skills.join(', ')}
                              onChange={(e) => setProfileData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }))}
                              className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                              placeholder="React, Node.js, Python (comma separated)"
                            />
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {profileData.skills.length > 0 ? profileData.skills.map((skill, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg shadow-sm">
                                  {skill}
                                </span>
                              )) : (
                                <span className="text-sm text-slate-500">No skills added.</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start md:items-center justify-center shrink-0 border-t md:border-t-0 md:border-l border-indigo-200/50 dark:border-indigo-500/30 pt-6 md:pt-0 md:pl-6">
                      <button
                        onClick={handleOptimizeProfile}
                        disabled={isOptimizing}
                        className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden w-full md:w-auto"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                        {isOptimizing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Optimize Profile
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "study" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-500/30 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Study Preferences</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Let AI tailor your ideal study schedule and notification rules based on your current goals.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Left: Input Goal */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 block">What is your current academic goal?</label>
                    <textarea
                      value={studyGoal}
                      onChange={(e) => setStudyGoal(e.target.value)}
                      rows={4}
                      className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none shadow-inner"
                      placeholder="e.g., 'I want to ace Machine Learning while balancing my part-time internship...'"
                    />
                  </div>
                  <button
                    onClick={handleGenerateStudyPrefs}
                    disabled={isGeneratingStudyPrefs || !studyGoal.trim()}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGeneratingStudyPrefs ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Goal...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Generate Configuration</>
                    )}
                  </button>
                </div>

                {/* Right: Display Preferences */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">Active AI Configuration</h3>
                  
                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Optimal Focus Mode (Hours)
                    </div>
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {profileData.studyPreferences.focusModeHours} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">hours/day</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> Preferred Study Time
                    </div>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {profileData.studyPreferences.preferredTime}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5" /> Notification Limits
                    </div>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold",
                      profileData.studyPreferences.limitNotifications 
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                        : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                    )}>
                      {profileData.studyPreferences.limitNotifications ? "Strict Mode (Muted)" : "Standard Alerts"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-2xl mx-auto"
          >
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-slate-500">Update your account password to stay secure.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">Current Password</label>
                  <input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">New Password</label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {passwordMessage && (
                  <div className={cn(
                    "p-3 rounded-lg text-sm font-bold",
                    passwordMessage.includes("success") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {passwordMessage}
                  </div>
                )}

                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Update Password
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
