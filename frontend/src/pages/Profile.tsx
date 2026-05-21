import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  userApi,
  claimApi,
  chatApi,
  type UserProfileInfo,
  type BackendPost,
  type BackendClaim,
} from "../lib/api";
import type { ProfileData } from "../components/home/PersonCard";
import { mapPostFields } from "../lib/postFormatters";
import {
  FileText,
  CheckCircle,
  ShieldCheck,
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
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import MissingPersonCard from "../components/search/MissingPersonCard";
import FoundPersonCard from "../components/search/FoundPersonCard";
import UnderlineTabSelector from "../components/ui/UnderlineTabSelector";
import EditProfileModal from "../components/ui/modals/EditProfileModal";
import SightingsListModal from "../components/ui/modals/SightingsListModal";
import BlockedUsersModal from "../components/ui/modals/BlockedUsersModal";

export default function Profile() {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const isRTL = language === "ar";
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"missing" | "found">("missing");
  const cardsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [profileData, setProfileData] = useState<UserProfileInfo | null>(null);
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [claims, setClaims] = useState<BackendClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sightingsModal, setSightingsModal] = useState<{
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

  useEffect(() => {
    setImageError(false);
  }, [profileData?.idImagePath]);

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
        return;
      }
      try {
        const [profileRes, claimsRes] = await Promise.all([
          userApi.getProfile(token),
          claimApi.getMyClaims(token).catch(() => ({ claims: [] })),
        ]);
        setProfileData(profileRes.user);
        setPosts(profileRes.posts || []);
        setClaims(claimsRes.claims || []);
      } catch (error) {
        console.error("Failed to fetch profile info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token]);

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
          image: post.postImages?.[0],
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
      if (typeof claim.postId === "object" && claim.postId?.userId) {
        const uid = claim.postId.userId;
        responderId = typeof uid === "object" ? uid._id : uid;
      } else if (
        typeof claim.claimUserId === "object" &&
        claim.claimUserId?._id
      ) {
        responderId = claim.claimUserId._id;
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
          className="bg-white p-5 md:p-6 rounded-2xl border border-primary-200 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-sm relative overflow-hidden"
        >
          {/* subtle decorative background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-6 z-10 w-full md:w-auto">
            <div className="relative shrink-0">
              <div className="w-24 h-24 bg-[#faebd7] rounded-full flex items-center justify-center p-2 overflow-hidden">
                {profileData?.idImagePath && !imageError ? (
                  <img
                    src={profileData.idImagePath}
                    alt=""
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-secondary/20 text-secondary text-4xl font-bold uppercase">
                    {profileData?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm translate-x-1/4 translate-y-1/4">
                <CheckCircle
                  className={`w-5 h-5 ${profileData?.isVerified ? "text-secondary" : "text-slate-300"}`}
                />
              </div>
            </div>

            <div className="flex-1 text-center md:text-start w-full">
              <h1 className="text-tertiary text-2xl font-bold mb-2 md:mb-3">
                {profileData?.name || (isRTL ? "مستخدم مجهول" : "Unknown User")}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
                {profileData?.createdAt && (
                  <p className="text-slate-500 text-sm flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    <Calendar className="w-4 h-4 text-secondary" />{" "}
                    {new Date(profileData.createdAt).toLocaleDateString(
                      isRTL ? "ar-EG" : "en-US",
                      { month: "short", year: "numeric" },
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-row gap-3 w-full md:w-auto z-10 justify-center md:self-start">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-2.5 bg-slate-100/80 text-[#212a4a] rounded-[10px] font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {isRTL ? "تعديل الملف" : "Edit Profile"}
            </button>
            <button
              onClick={() => navigate("/create-post")}
              className="flex-1 md:flex-none px-6 py-2.5 bg-[#fef5da] text-[#1c190d] font-semibold text-sm rounded-[10px] border border-[#faebd7] hover:bg-[#ffe5a0] transition-all cursor-pointer shadow-xs"
            >
              {isRTL ? "إضافة حالة" : "Report New Case"}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Information */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Account Information (Replaces Map/Activity) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-xs"
            >
              <div className="p-4 border-b border-primary-100">
                <h3 className="text-tertiary font-bold text-start">
                  {isRTL ? "معلومات الحساب" : "Account Information"}
                </h3>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="mt-0.5 bg-white p-2 rounded-md shadow-xs border border-primary-200">
                      <Mail className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="text-start min-w-0 flex-1">
                      <p className="text-xs text-slate-500 font-medium mb-0.5 flex items-center gap-2">
                        {isRTL ? "البريد الإلكتروني" : "Email Address"}
                        {profileData?.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
                            <CheckCircle className="w-3 h-3" />
                            {isRTL ? "موثق" : "Verified"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">
                            <Clock className="w-3 h-3" />
                            {isRTL ? "غير موثق" : "Unverified"}
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-bold text-tertiary truncate">
                        {profileData?.email ||
                          (isRTL ? "غير متوفر" : "Not available")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                    aria-label={isRTL ? "تعديل" : "Edit"}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-start justify-between gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="mt-0.5 bg-white p-2 rounded-md shadow-xs border border-primary-200">
                      <Phone className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="text-start min-w-0">
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        {isRTL ? "رقم الهاتف" : "Phone Number"}
                      </p>
                      <p className="text-sm font-bold text-tertiary">
                        {profileData?.phoneNumber ||
                          (isRTL ? "لم يتم التحديد" : "Not specified")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                    aria-label={isRTL ? "تعديل" : "Edit"}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
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
                <div className="flex items-start gap-4 p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <div className="mt-0.5 bg-white p-2 rounded-md shadow-xs border border-primary-200">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="text-start">
                    <p className="text-xs text-slate-500 font-medium mb-0.5">
                      {isRTL ? "حالة التوثيق" : "Verification Status"}
                    </p>
                    <p className="text-sm font-bold text-tertiary">
                      {profileData?.isVerified
                        ? isRTL
                          ? "الهوية الوطنية موثقة"
                          : "National ID Verified"
                        : isRTL
                          ? "غير موثق"
                          : "Unverified"}
                    </p>
                  </div>
                </div>

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
                        {isRTL ? "المستخدمون المحظورون" : "Blocked Users"}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {isRTL
                          ? "إدارة الأشخاص الذين قمت بحظرهم"
                          : "Manage people you have blocked"}
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
                {claims.length > 0 ? (
                  claims.map((claim) => {
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
                        className="p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
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
                  })
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">
                      {isRTL ? "لا توجد مطالبات حتى الآن" : "No claims found"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
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
                            className="w-full!"
                          />
                        ) : (
                          <FoundPersonCard
                            profile={profile}
                            idx={idx}
                            isRTL={isRTL}
                            showImage={true}
                            className="w-full!"
                          />
                        )}
                        {activeTab === "missing" && (
                          <button
                            onClick={() =>
                              setSightingsModal({
                                open: true,
                                postId: profile.id,
                                postName: profile.name,
                              })
                            }
                            className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-xl bg-white border border-primary-200 text-tertiary text-xs font-bold hover:bg-primary-50 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-secondary" />
                            {isRTL ? "عرض المشاهدات" : "View sightings"}
                          </button>
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
        />
      )}
    </div>
  );
}
