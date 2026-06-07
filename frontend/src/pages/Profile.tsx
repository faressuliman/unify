import { toast } from "sonner";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  userApi,
  claimApi,
  chatApi,
  sightingApi,
  type UserProfileInfo,
  type BackendPost,
  type BackendClaim,
} from "../lib/api";
import type { ProfileData } from "../components/home/PersonCard";
import { mapPostFields } from "../lib/postFormatters";
import {
  FileText,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ArrowDownRight,
  ArrowDownLeft,
  ChevronRight,
  ChevronLeft,
  Pencil,
  MessageCircle,
  XCircle,
  Clock,
  Eye,
  UserX,
  Save,
  X,
  Loader2,
  Camera,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import MissingPersonCard from "../components/search/MissingPersonCard";
import FoundPersonCard from "../components/search/FoundPersonCard";
import UnderlineTabSelector from "../components/ui/UnderlineTabSelector";
import EditProfileModal from "../components/ui/modals/EditProfileModal";
import SightingsListModal from "../components/ui/modals/SightingsListModal";
import ClaimsListModal from "../components/ui/modals/ClaimsListModal";
import BlockedUsersModal from "../components/ui/modals/BlockedUsersModal";

export default function Profile() {
  const { t, language } = useLanguage();
  const { token, updateUser } = useAuth();
  const isRTL = language === "ar";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"missing" | "found">("missing");
  const cardsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [profileData, setProfileData] = useState<UserProfileInfo | null>(null);
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [claims, setClaims] = useState<BackendClaim[]>([]);
  const [hasBlockedUsers, setHasBlockedUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [sightingsModal, setSightingsModal] = useState<{
    open: boolean;
    postId: string;
    postName: string;
    highlightSightingId: string | null;
  }>({
    open: false,
    postId: "",
    postName: "",
    highlightSightingId: null,
  });
  const [claimsModal, setClaimsModal] = useState<{
    open: boolean;
    postId: string;
    postName: string;
  }>({
    open: false,
    postId: "",
    postName: "",
  });
  const [imageError, setImageError] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [mySightings, setMySightings] = useState<any[]>([]);
  const [sightingsLoading, setSightingsLoading] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [profileData?.profilePicture, profileData?.idImagePath]);

  const avatarSrc = profileData?.profilePicture || null;

  const normalizeInlineError = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("email") && lower.includes("valid")) {
      return "Invalid email address";
    }
    if (lower.includes("phonenumber")) {
      return message.replace(/"?phoneNumber"?/g, "Phone Number");
    }
    return message;
  };

  const handleSaveInlineEmail = async () => {
    if (!token || !draftEmail.trim() || draftEmail === profileData?.email) {
      setEditingEmail(false);
      return;
    }
    try {
      setSavingEmail(true);
      const fd = new FormData();
      fd.append("email", draftEmail.trim());
      const res = await userApi.updateProfile(fd, token);
      setProfileData(res.user);
      toast.success(
        isRTL ? "تم تحديث البريد" : "Email updated",
      );
      setEditingEmail(false);
    } catch (error) {
      const err = error as Error;
      const fallback = isRTL ? "فشل التحديث" : "Update failed";
      toast.error(normalizeInlineError(err.message || fallback));
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSaveInlinePhone = async () => {
    if (!token || !draftPhone.trim() || draftPhone === profileData?.phoneNumber) {
      setEditingPhone(false);
      return;
    }
    try {
      setSavingPhone(true);
      const fd = new FormData();
      fd.append("phoneNumber", draftPhone.trim());
      const res = await userApi.updateProfile(fd, token);
      setProfileData(res.user);
      toast.success(
        isRTL ? "تم تحديث رقم الهاتف" : "Phone number updated",
      );
      setEditingPhone(false);
    } catch (error) {
      const err = error as Error;
      const fallback = isRTL ? "فشل التحديث" : "Update failed";
      toast.error(normalizeInlineError(err.message || fallback));
    } finally {
      setSavingPhone(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setSelectedPhotoFile(file);
  };

  const handleSavePhoto = async () => {
    if (!selectedPhotoFile || !token) return;

    try {
      setUploadingPhoto(true);
      const fd = new FormData();
      fd.append("profilePicture", selectedPhotoFile);
      const res = await userApi.updateProfile(fd, token);
      
      setProfileData(res.user);
      updateUser(res.user); 
      
      toast.success(
        isRTL ? "تم تحديث الصورة الشخصية" : "Profile picture updated",
      );
      handleCancelPhoto();
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      toast.error(isRTL ? "فشل تحديث الصورة" : "Failed to update picture");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancelPhoto = () => {
    setPhotoPreview(null);
    setSelectedPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatBirthDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatMonthDay = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (value?: string) => {
    if (!value) return null;
    const birth = new Date(value);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDelta = today.getMonth() - birth.getMonth();
    if (
      monthDelta < 0 ||
      (monthDelta === 0 && today.getDate() < birth.getDate())
    ) {
      age -= 1;
    }
    return age;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        setLoading(false);
        setHasBlockedUsers(false);
        return;
      }
      try {
        const [profileRes, claimsRes, blockedRes] = await Promise.all([
          userApi.getProfile(token),
          claimApi.getMyClaims(token).catch(() => ({ claims: [] })),
          userApi.getBlockedUsers(token).catch(() => ({ blockedUsers: [] })),
        ]);
        setProfileData(profileRes.user);
        setPosts(profileRes.posts || []);
        setClaims(claimsRes.claims || []);
        setHasBlockedUsers((blockedRes.blockedUsers || []).length > 0);
      } catch (error) {
        console.error("Failed to fetch profile info:", error);
        setHasBlockedUsers(false);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token]);

  // Fetch sightings submitted by the user
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const load = async () => {
      setSightingsLoading(true);
      try {
        const res = await sightingApi.getMySightings(token);
        if (cancelled) return;
        
        let reports = res.reports || [];
        // Map missingPersonId object to postId and postName for compatibility
        reports = reports.map((r: any) => ({
          ...r,
          postId: r.missingPersonId?._id || r.missingPersonId,
          postName: r.missingPersonId?.name || (isRTL ? "بدون اسم" : "Unknown"),
          postOwnerId:
            typeof r.missingPersonId?.userId === "object"
              ? r.missingPersonId?.userId?._id
              : r.missingPersonId?.userId,
        }));
        
        setMySightings(reports);
      } catch (err) {
        console.error('Failed to load my sightings:', err);
      } finally {
        if (!cancelled) setSightingsLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [token, isRTL]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => post.postType === activeTab)
      .map((post) => {
        const fields = mapPostFields(post, isRTL);
        return {
          id: post._id,
          name: fields.name || (isRTL ? "غير معروف" : "Unknown"),
          type: post.postType,
          status: post.status,
          location: fields.location,
          timeAgo: fields.timeAgo,
          details: fields.details,
          image: post.postImage,
          city: fields.city,
          age: fields.age,
          physicalDescription: fields.physicalDescription || undefined,
          clothingDescription: fields.clothingDescription,
          lastSeenLocationDetails: fields.lastSeenLocationDetails,
          foundLocationDetails: fields.foundLocationDetails,
          reportDate: fields.reportDate,
          postedBy: fields.postedBy ?? profileData?.name,
          postUserId: fields.postUserId ?? profileData?.id,
        } as ProfileData;
      });
  }, [activeTab, posts, isRTL, profileData]);

  const updateScrollControls = () => {
    if (!cardsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = cardsRef.current;
    setCanScrollLeft(Math.abs(scrollLeft) > 5);
    setCanScrollRight(
      Math.round(Math.abs(scrollLeft) + clientWidth) < scrollWidth - 5,
    );
  };

  useEffect(() => {
    updateScrollControls();
    window.addEventListener("resize", updateScrollControls);
    return () => window.removeEventListener("resize", updateScrollControls);
  }, [activeTab, filteredPosts.length]);

  useEffect(() => {
    const postId = searchParams.get("sightingPostId");
    const sightingId = searchParams.get("sightingId");

    if (!token || !postId) return;

    const matchedPost = posts.find((post) => post._id === postId);
    setSightingsModal({
      open: true,
      postId,
      postName: matchedPost?.name || "",
      highlightSightingId: sightingId,
    });

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("sightingPostId");
      next.delete("sightingId");
      return next;
    }, { replace: true });
  }, [posts, searchParams, setSearchParams, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-tertiary mb-2">
            {isRTL ? "تعذر تحميل الملف الشخصي" : "Unable to load profile."}
          </p>
          <p className="text-sm text-slate-500">
            {isRTL
              ? "حاول تحديث الصفحة أو تسجيل الخروج ثم تسجيل الدخول مرة أخرى."
              : "Try refreshing the page or signing out and signing in again."}
          </p>
        </div>
      </div>
    );
  }

  const handleStartChat = async (claim: BackendClaim) => {
    try {
      let responderId = "";
      if (typeof claim.claimUserId === "object" && claim.claimUserId?._id) {
        responderId = claim.claimUserId._id;
      } else if (typeof claim.postId === "object" && claim.postId?.userId) {
        const uid = claim.postId.userId;
        responderId = typeof uid === "object" ? uid._id : uid;
      }
      if (!responderId) {
        console.warn("Could not find user to chat with.");
        return;
      }

      await chatApi.startChat(responderId, token!);
      navigate("/chat");
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col pt-8 pb-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <PageHeader
        navigatedTo={isRTL ? "الملف الشخصي" : "Profile"}
        title={isRTL ? "ملفي الشخصي" : "My Profile"}
        subtitle={
          isRTL
            ? "إدارة تقاريرك ومعلومات حسابك"
            : "Manage your reports and account information."
        }
        showArrow={true}
      />

      <main className="w-full max-w-400 mx-auto px-6 lg:px-12 flex flex-col gap-6">
        {/* Profile Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-primary-200 flex flex-col gap-6 shadow-sm relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 px-6 md:px-8 pt-8 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-6 w-full md:w-auto">
              <div className="relative shrink-0 group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={!photoPreview ? handlePhotoClick : undefined}
                  className={`w-28 h-28 rounded-full flex items-center justify-center overflow-hidden shadow-sm relative ${!photoPreview ? "cursor-pointer" : ""}`}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : avatarSrc && !imageError ? (
                    <img
                      src={avatarSrc}
                      alt=""
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover rounded-full transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center bg-secondary/20 text-secondary text-4xl font-bold uppercase transition-transform duration-300">
                      {profileData?.name?.charAt(0) || "?"}
                    </div>
                  )}

                  {/* Hover Overlay - only show if not in preview mode */}
                  {!photoPreview && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                        {isRTL ? "تغيير الصورة" : "Change Picture"}
                      </span>
                    </div>
                  )}

                  {/* Uploading Loader */}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Save/Cancel Controls - visible when previewing */}
                {photoPreview && !uploadingPhoto && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-md border border-slate-100 z-20">
                    <button
                      onClick={handleSavePhoto}
                      title={isRTL ? "حفظ" : "Save"}
                      className="p-1.5 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelPhoto}
                      title={isRTL ? "إلغاء" : "Cancel"}
                      className="p-1.5 bg-blue-50 text-tertiary rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-start w-full">
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <h1 className="text-tertiary text-2xl md:text-3xl font-bold leading-tight">
                    {profileData?.name || (isRTL ? "مستخدم مجهول" : "Unknown User")}
                  </h1>
                  <span
                    className={`relative top-0.5 inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border ${profileData?.isVerified ? "border-secondary/20 bg-secondary/10 text-secondary" : "border-slate-200 bg-slate-100 text-slate-400"}`}
                    title={
                      profileData?.isVerified
                        ? isRTL
                          ? "هوية موثقة"
                          : "Verified"
                        : isRTL
                          ? "غير موثق"
                          : "Unverified"
                    }
                  >
                    <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="text-slate-500 text-sm flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <MapPin className="w-4 h-4 text-secondary" />
                    {profileData?.city ||
                      (isRTL ? "المدينة غير محددة" : "City not set")}
                  </span>
                  <span className="text-slate-500 text-sm flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <Calendar className="w-4 h-4 text-secondary" />
                    {formatMonthDay(profileData?.createdAt) ||
                      (isRTL ? "تاريخ الانضمام غير محدد" : "Join date not set")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-row flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end md:self-start md:mt-1">
              <button
                onClick={() => {
                  setIsEditModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 text-[#212a4a] rounded-[10px] font-semibold text-xs sm:text-sm whitespace-nowrap border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {isRTL ? "تعديل الملف" : "Edit Profile"}
              </button>
              <button
                onClick={() => navigate("/create-post")}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#fef5da] text-[#1c190d] rounded-[10px] font-semibold text-xs sm:text-sm whitespace-nowrap border border-[#faebd7] hover:bg-[#ffe5a0] transition-colors cursor-pointer"
              >
                {isRTL ? "إضافة حالة" : "Report New Case"}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Information */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Personal Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-xs"
            >
              <div className="p-4 border-b border-primary-100">
                <h3 className="text-tertiary font-bold text-start">
                  {isRTL ? "التفاصيل الشخصية" : "Personal details"}
                </h3>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-white p-2 rounded-md shadow-xs border border-primary-200">
                        <Mail className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="text-start min-w-0">
                        <p className="text-xs text-slate-500 font-medium mb-0.5">
                          {isRTL ? "البريد الإلكتروني" : "Email Address"}
                        </p>
                        {!editingEmail && (
                          <p className="text-sm font-bold text-tertiary truncate" dir="ltr">
                            {profileData?.email ||
                              (isRTL ? "غير متوفر" : "Not available")}
                          </p>
                        )}
                      </div>
                    </div>
                    {!editingEmail && (
                      <button
                        onClick={() => {
                          setDraftEmail(profileData?.email || "");
                          setEditingEmail(true);
                          setEditingPhone(false);
                        }}
                        className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                        aria-label={isRTL ? "تعديل البريد" : "Edit email"}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {editingEmail && (
                    <div className="flex flex-col gap-3 mt-3">
                      <input
                        type="email"
                        value={draftEmail}
                        onChange={(e) => setDraftEmail(e.target.value)}
                        className="w-full rounded-lg px-4 py-2.5 text-sm text-tertiary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                        dir="ltr"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingEmail(false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          {isRTL ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveInlineEmail}
                          disabled={savingEmail}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary/90 disabled:opacity-50 cursor-pointer"
                        >
                          {savingEmail ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                          {isRTL ? "حفظ" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-white p-2 rounded-md shadow-xs border border-primary-200">
                        <Phone className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="text-start min-w-0">
                        <p className="text-xs text-slate-500 font-medium mb-0.5">
                          {isRTL ? "رقم الهاتف" : "Phone Number"}
                        </p>
                        {!editingPhone && (
                          <p className="text-sm font-bold text-tertiary" dir="ltr">
                            {profileData?.phoneNumber ||
                              (isRTL ? "لم يتم التحديد" : "Not specified")}
                          </p>
                        )}
                      </div>
                    </div>
                    {!editingPhone && (
                      <button
                        onClick={() => {
                          setDraftPhone(profileData?.phoneNumber || "");
                          setEditingPhone(true);
                          setEditingEmail(false);
                        }}
                        className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                        aria-label={isRTL ? "تعديل الهاتف" : "Edit phone"}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {editingPhone && (
                    <div className="flex flex-col gap-3 mt-3">
                      <input
                        type="tel"
                        value={draftPhone}
                        onChange={(e) => setDraftPhone(e.target.value)}
                        className="w-full rounded-lg px-4 py-2.5 text-sm text-tertiary focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                        dir="ltr"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingPhone(false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          {isRTL ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveInlinePhone}
                          disabled={savingPhone}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary/90 disabled:opacity-50 cursor-pointer"
                        >
                          {savingPhone ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                          {isRTL ? "حفظ" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="mt-0.5 bg-white p-2 rounded-md shadow-xs border border-primary-200">
                      <Calendar className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="text-start min-w-0">
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        {isRTL ? "تاريخ الميلاد" : "Birth Date"}
                      </p>
                      <p className="text-sm font-bold text-tertiary">
                        {(() => {
                          const birthDate = formatBirthDate(
                            profileData?.birthDate,
                          );
                          const age = calculateAge(profileData?.birthDate);
                          if (!birthDate) {
                            return isRTL ? "لم يتم التحديد" : "Not specified";
                          }
                          const ageText =
                            age !== null
                              ? `${age} ${isRTL ? "سنة" : "yrs"}`
                              : null;
                          return ageText
                            ? `${birthDate} • ${ageText}`
                            : birthDate;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Verification Status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13 }}
              className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-xs"
            >
              <div className="p-4 border-b border-primary-100">
                <h3 className="text-tertiary font-bold text-start">
                  {isRTL ? "حالة التوثيق" : "Verification status"}
                </h3>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4 p-4 bg-green-50/50 rounded-lg border border-green-100">
                  <div className="mt-0.5 bg-white p-2 rounded-md shadow-xs border border-primary-200">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="text-start">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">
                      {isRTL ? "الهوية الوطنية" : "National ID"}
                    </p>
                    <p className="text-sm font-bold text-tertiary">
                      {profileData?.isVerified
                        ? isRTL
                          ? "موثقة"
                          : "Verified"
                        : isRTL
                          ? "غير موثقة"
                          : "Not verified"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Blocked Users */}
            {hasBlockedUsers && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-xs"
              >
                <div className="p-4 border-b border-primary-100">
                  <h3 className="text-tertiary font-bold text-start">
                    {isRTL ? "المستخدمون المحظورون" : "Blocked users"}
                  </h3>
                </div>
                <div className="p-4">
                  <button
                    onClick={() => setIsBlockedModalOpen(true)}
                    className="flex items-center justify-between p-3 bg-red-50/50 hover:bg-red-50 rounded-lg border border-red-100 transition-colors cursor-pointer w-full text-start"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-md shadow-xs border border-red-200">
                        <UserX className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {isRTL ? "إدارة المحظورين" : "Manage blocked users"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {isRTL
                            ? "عرض الأشخاص الذين قمت بحظرهم"
                            : "See and manage people you blocked"}
                        </p>
                      </div>
                    </div>
                    {isRTL ? (
                      <ChevronLeft className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
            {(sightingsLoading || mySightings.length > 0) && (
              <>
                {/* Sighting Reports */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.17 }}
                  className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-xs flex flex-col max-h-100 mt-4"
                >
                  <div className="p-4 border-b border-primary-100 flex items-center justify-between shrink-0">
                    <h3 className="text-tertiary font-bold text-start">
                      {isRTL ? "بلاغاتي للمشاهدات" : "My Sighting Reports"}
                    </h3>
                  </div>
                  <div className="divide-y divide-primary-100 overflow-y-auto min-h-0 custom-scrollbar">
                    {sightingsLoading ? (
                      <div className="p-8 text-center">
                        <Loader2 className="animate-spin w-6 h-6 mx-auto text-secondary" />
                      </div>
                    ) : (
                      mySightings.slice(0, 8).map((s) => (
                        <div
                          key={s._id}
                          className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() =>
                            setSightingsModal({
                              open: true,
                              postId: s.postId,
                              postName: s.postName,
                              highlightSightingId: s._id,
                            })
                          }
                        >
                          <div className="size-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-primary-200 text-secondary">
                            <Eye className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col items-start text-start min-w-0 flex-1">
                            <p className="text-sm font-bold text-tertiary truncate w-full">
                              {s.postName || (isRTL ? "بدون اسم" : "Unknown")}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {s.description}
                            </p>
                            <span className="text-[10px] mt-1 text-slate-400">
                              {new Date(s.createdAt).toLocaleDateString(
                                isRTL ? "ar-EG" : "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSightingsModal({
                                open: true,
                                postId: s.postId,
                                postName: s.postName,
                                highlightSightingId: s._id,
                              });
                            }}
                            className="ml-auto w-8 h-8 rounded-full bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center text-secondary transition-colors"
                            aria-label={isRTL ? "عرض التفاصيل" : "View details"}
                          >
                            {isRTL ? (
                              <ChevronLeft className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}

            {claims.length > 0 && (
              <>
                {/* Claims History */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-xs flex flex-col max-h-100"
                >
                  <div className="p-4 border-b border-primary-100 flex items-center justify-between shrink-0">
                    <h3 className="text-tertiary font-bold text-start">
                      {isRTL ? "المطالبات الأخيرة" : "Recent Claims"}
                    </h3>
                  </div>
                  <div className="divide-y divide-primary-100 overflow-y-auto min-h-0 custom-scrollbar">
                    {claims.map((claim) => {
                    const postName =
                      typeof claim.postId === "object" && claim.postId !== null
                        ? (claim.postId as BackendPost).name || "Unknown"
                        : "Unknown";
                    const statusText = isRTL
                      ? claim.status === "approved"
                        ? "تمت الموافقة"
                        : claim.status === "rejected"
                          ? "مرفوض"
                          : "قيد المراجعة"
                      : claim.status === "approved"
                        ? "Approved"
                        : claim.status === "rejected"
                          ? "Rejected"
                          : "Pending";

                    const StatusIcon =
                      claim.status === "approved"
                        ? ShieldCheck
                        : claim.status === "rejected"
                          ? XCircle
                          : Clock;

                    return (
                      <div
                        key={claim._id}
                        onClick={() => {
                          if (claim.status === "approved") {
                            handleStartChat(claim);
                          }
                        }}
                        className={`p-4 flex gap-4 transition-colors ${claim.status === "approved" ? "cursor-pointer hover:bg-slate-50" : "cursor-default"}`}
                      >
                        <div
                          className={`size-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-primary-200 ${claim.status === "approved" ? "text-green-500" : claim.status === "rejected" ? "text-red-500" : "text-amber-500"}`}
                        >
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-start text-start min-w-0 flex-1">
                          <p className="text-sm font-bold text-tertiary truncate w-full">
                            {postName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {statusText}
                          </p>
                          <span className="text-[10px] mt-1 text-slate-400">
                            {new Date(claim.createdAt).toLocaleDateString(
                              isRTL ? "ar-EG" : "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        {claim.status === "approved" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartChat(claim);
                            }}
                            className="ml-auto w-8 h-8 rounded-full bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center text-secondary transition-colors"
                            aria-label={isRTL ? "بدء المحادثة" : "Start Chat"}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Right Column: Case Management */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col w-full"
            >
              <div className="flex items-center gap-2 mb-2 text-start">
                <h2 className="text-xl font-bold text-tertiary">
                  {isRTL ? "منشوراتي" : "My Posts"}
                </h2>
                {isRTL ? (
                  <ArrowDownLeft className="h-5 w-5 text-secondary shrink-0" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-secondary shrink-0" />
                )}
              </div>
              <UnderlineTabSelector
                options={[
                  {
                    value: "missing",
                    label:
                      t("search.missingReports") ||
                      (isRTL ? "البلاغات النشطة" : "Missing Reports"),
                  },
                  {
                    value: "found",
                    label:
                      t("search.foundPersons") ||
                      (isRTL ? "الأشخاص المعثور عليهم" : "Found Persons"),
                  },
                ]}
                value={activeTab}
                onChange={(value) => setActiveTab(value as "missing" | "found")}
                indicatorLayoutId="activeTabIndicatorProfile"
              />

              {/* Cards Display */}
              <div className="relative">
                <motion.div
                  ref={cardsRef}
                  onScroll={updateScrollControls}
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex overflow-x-auto gap-4 md:gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((profile, idx) => (
                      <div
                        key={profile.id}
                        className="flex flex-col gap-2 min-w-70 sm:min-w-[320px] lg:min-w-0 lg:w-[calc(48%-1rem)] xl:w-[calc(36.5%-1rem)] flex-none"
                      >
                        {activeTab === "missing" ? (
                          <MissingPersonCard
                            profile={profile}
                            idx={idx}
                            isRTL={isRTL}
                            showImage={true}
                            showDetailsButton={false}
                            cardOpensModal={true}
                            actionLabel={isRTL ? "عرض المشاهدات" : "View Sightings"}
                            actionIcon={<Eye className="h-3.5 w-3.5" />}
                            onActionClick={() =>
                              setSightingsModal({
                                open: true,
                                postId: profile.id,
                                postName: profile.name,
                                highlightSightingId: null,
                              })
                            }
                            className="w-full!"
                          />
                        ) : (
                          <FoundPersonCard
                            profile={profile}
                            idx={idx}
                            isRTL={isRTL}
                            showImage={true}
                            showDetailsButton={false}
                            cardOpensModal={true}
                            actionLabel={isRTL ? "عرض المطالبات" : "View Claims"}
                            actionIcon={<FileText className="h-3.5 w-3.5" />}
                            onActionClick={() =>
                              setClaimsModal({
                                open: true,
                                postId: profile.id,
                                postName: profile.name,
                              })
                            }
                            className="w-full!"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 w-full text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                      <p>{isRTL ? "لا توجد تقارير." : "No reports found."}</p>
                    </div>
                  )}
                </motion.div>

                {filteredPosts.length > 2 && canScrollLeft && (
                  <button
                    onClick={() => {
                      if (cardsRef.current) {
                        cardsRef.current.scrollBy({
                          left: isRTL
                            ? cardsRef.current.clientWidth
                            : -cardsRef.current.clientWidth,
                          behavior: "smooth",
                        });
                      }
                    }}
                    className={`hidden lg:flex absolute ${isRTL ? "-right-5" : "-left-5"} top-[42%] -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white shadow-md rounded-full border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-tertiary`}
                    aria-label="Scroll left"
                  >
                    {isRTL ? (
                      <ChevronRight className="w-6 h-6" />
                    ) : (
                      <ChevronLeft className="w-6 h-6" />
                    )}
                  </button>
                )}

                {filteredPosts.length > 2 && canScrollRight && (
                  <button
                    onClick={() => {
                      if (cardsRef.current) {
                        cardsRef.current.scrollBy({
                          left: isRTL
                            ? -cardsRef.current.clientWidth
                            : cardsRef.current.clientWidth,
                          behavior: "smooth",
                        });
                      }
                    }}
                    className={`hidden lg:flex absolute ${isRTL ? "-left-5" : "-right-5"} top-[42%] -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white shadow-md rounded-full border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-tertiary`}
                    aria-label="Scroll right"
                  >
                    {isRTL ? (
                      <ChevronLeft className="w-6 h-6" />
                    ) : (
                      <ChevronRight className="w-6 h-6" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        profile={profileData}
        onSuccess={(updatedProfile) => setProfileData(updatedProfile)}
        isRTL={isRTL}
      />

      {token && (
        <BlockedUsersModal
          isOpen={isBlockedModalOpen}
          onOpenChange={setIsBlockedModalOpen}
          isRTL={isRTL}
          token={token}
        />
      )}

      {token && sightingsModal.postId && (
        <SightingsListModal
          isOpen={sightingsModal.open}
          onOpenChange={(open) =>
            setSightingsModal((prev) => ({ ...prev, open }))
          }
          postId={sightingsModal.postId}
          postName={sightingsModal.postName}
          isRTL={isRTL}
          token={token}
          highlightSightingId={sightingsModal.highlightSightingId}
        />
      )}

      {token && claimsModal.postId && (
        <ClaimsListModal
          isOpen={claimsModal.open}
          onOpenChange={(open) =>
            setClaimsModal((prev) => ({ ...prev, open }))
          }
          postId={claimsModal.postId}
          postName={claimsModal.postName}
          isRTL={isRTL}
          token={token}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}


