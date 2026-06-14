import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {

  Users,

  FileText,

  ShieldAlert,

  CheckCircle2,

  XCircle,

  AlertCircle,

  UserX,

  UserCheck,

  Loader2,

  Search,

  Inbox,

  ChevronLeft,

  ChevronRight,

  ChevronDown,

  X,

  ShieldCheck,

  Trash2,

  ImageIcon,

  Layers,

  LayoutDashboard,

  ClipboardList,

  Mail,

  MessageSquare,

  Eye,

} from "lucide-react";

import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";

import { useLanguage } from "../context/LanguageContext";

import AdminDrawer, {

  type AdminDrawerItem,

} from "../components/admin/AdminDrawer";

import ContactMessagesPanel from "../components/admin/ContactMessagesPanel";

import {

  adminApi,

  ApiError,

  type AdminUser,

  type BackendChat,

  type BackendChatUser,

  type BackendClaim,

  type BackendMessage,

  type BackendPost,

  type DashboardStats,

  type BackendContactMessage,

  type BackendSighting,

} from "../lib/api";



type Section =

  | "overview"

  | "claims"

  | "verifications"

  | "users"

  | "posts"

  | "contact_messages"

  | "user_reports"

  | "chats"

  | "sighting_reports";

type ClaimStatusFilter = "all" | "pending" | "approved" | "rejected";

type ClaimsTab = "pending" | "processed";



const PAGE_LIMIT = 10;



export default function Admin() {

  const { token } = useAuth();

  const { language } = useLanguage();

  const isRTL = language === "ar";

  const tCopy = useMemo(() => getCopy(isRTL), [isRTL]);



  const [activeSection, setActiveSection] = useState<Section>("overview");

  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);



  // Stats — used both by Overview and to drive the badge counts in the sidebar

  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [statsLoading, setStatsLoading] = useState(true);

  // Users

  const [users, setUsers] = useState<AdminUser[]>([]);

  const [usersLoading, setUsersLoading] = useState(false);

  const [userSearch, setUserSearch] = useState("");

  const [userSearchInput, setUserSearchInput] = useState("");

  const [userPage, setUserPage] = useState(1);

  const [userTotalPages, setUserTotalPages] = useState(1);

  const [banningUserId, setBanningUserId] = useState<string | null>(null);



  // Claims (pending tab)

  const [claims, setClaims] = useState<BackendClaim[]>([]);

  const [claimsLoading, setClaimsLoading] = useState(false);

  const [claimPage, setClaimPage] = useState(1);

  const [claimTotalPages, setClaimTotalPages] = useState(1);

  const [reviewingClaim, setReviewingClaim] = useState<BackendClaim | null>(

    null,

  );

  const [reviewNotes, setReviewNotes] = useState("");

  const [submittingReview, setSubmittingReview] = useState<

    "approved" | "rejected" | null

  >(null);



  // Claims (processed tab)

  const [allClaims, setAllClaims] = useState<BackendClaim[]>([]);

  const [allClaimsLoading, setAllClaimsLoading] = useState(false);

  const [allClaimsPage, setAllClaimsPage] = useState(1);

  const [allClaimsTotalPages, setAllClaimsTotalPages] = useState(1);

  const [allClaimsStatus, setAllClaimsStatus] =

    useState<ClaimStatusFilter>("approved");

  const [claimsTab, setClaimsTab] = useState<ClaimsTab>("pending");



  // Verifications

  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);

  const [pendingUsersLoading, setPendingUsersLoading] = useState(false);

  const [pendingUsersPage, setPendingUsersPage] = useState(1);

  const [pendingUsersTotalPages, setPendingUsersTotalPages] = useState(1);

  const [pendingUserSearch, setPendingUserSearch] = useState("");

  const [pendingUserSearchInput, setPendingUserSearchInput] = useState("");

  const [reviewingVerification, setReviewingVerification] =

    useState<AdminUser | null>(null);

  const [verificationDecision, setVerificationDecision] = useState<

    "approved" | "rejected" | null

  >(null);



  // Posts

  const [posts, setPosts] = useState<BackendPost[]>([]);

  const [postsLoading, setPostsLoading] = useState(false);

  const [postPage, setPostPage] = useState(1);

  const [postTotalPages, setPostTotalPages] = useState(1);

  const [postSearch, setPostSearch] = useState("");

  const [postSearchInput, setPostSearchInput] = useState("");

  const [postTypeFilter, setPostTypeFilter] = useState<

    "all" | "missing" | "found"

  >("all");

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  

  // Chats

  const [adminChatsTargetId, setAdminChatsTargetId] = useState<string>("");



  // Sighting Reports

  const [sightingReports, setSightingReports] = useState<BackendSighting[]>([]);

  const [sightingReportsLoading, setSightingReportsLoading] = useState(false);

  const [sightingReportsPage, setSightingReportsPage] = useState(1);

  const [sightingReportsTotalPages, setSightingReportsTotalPages] = useState(1);



  useEffect(() => {

    if (!token) return;

    void fetchStats();

  }, [token]);



  useEffect(() => {

    if (!token) return;

    if (activeSection === "users") void fetchUsers(userPage, userSearch);

    if (activeSection === "claims" && claimsTab === "pending")

      void fetchPendingClaims(claimPage);

    if (activeSection === "claims" && claimsTab === "processed")

      void fetchAllClaims(allClaimsPage, allClaimsStatus);

    if (activeSection === "verifications")

      void fetchPendingVerifications(pendingUsersPage, pendingUserSearch);

    if (activeSection === "posts")

      void fetchPosts(postPage, postSearch, postTypeFilter);

    if (activeSection === "sighting_reports")

      void fetchSightingReports(sightingReportsPage);

  }, [

    activeSection,

    claimsTab,

    userPage,

    claimPage,

    allClaimsPage,

    allClaimsStatus,

    userSearch,

    pendingUsersPage,

    pendingUserSearch,

    postPage,

    postSearch,

    postTypeFilter,

    sightingReportsPage,

    token,

  ]);



  // ── Fetchers ───────────────────────────────────────────────────────────────

  const fetchStats = async () => {

    if (!token) return;

    try {

      setStatsLoading(true);

      const res = await adminApi.getDashboardStats(token);

      setStats(res.stats);

    } catch (err) {

      console.error("Failed to fetch admin stats", err);

      toast.error(tCopy.errors.stats);

    } finally {

      setStatsLoading(false);

    }

  };



  const fetchUsers = async (page: number, search: string) => {

    if (!token) return;

    try {

      setUsersLoading(true);

      const res = await adminApi.getAllUsers(token, {

        page,

        limit: PAGE_LIMIT,

        name: search || undefined,

      });

      setUsers(res.users);

      setUserTotalPages(res.totalPages || 1);

    } catch (err) {

      console.error("Failed to fetch users", err);

      toast.error(tCopy.errors.users);

    } finally {

      setUsersLoading(false);

    }

  };



  const fetchPendingClaims = async (page: number) => {

    if (!token) return;

    try {

      setClaimsLoading(true);

      const res = await adminApi.getPendingClaims(token, {

        page,

        limit: PAGE_LIMIT,

      });

      setClaims(res.claims);

      setClaimTotalPages(res.totalPages || 1);

    } catch (err) {

      console.error("Failed to fetch pending claims", err);

      toast.error(tCopy.errors.claims);

    } finally {

      setClaimsLoading(false);

    }

  };



  const fetchAllClaims = async (page: number, status: ClaimStatusFilter) => {

    if (!token) return;

    try {

      setAllClaimsLoading(true);

      const res = await adminApi.getAllClaims(token, {

        page,

        limit: PAGE_LIMIT,

        status,

      });

      setAllClaims(res.claims);

      setAllClaimsTotalPages(res.totalPages || 1);

    } catch (err) {

      console.error("Failed to fetch all claims", err);

      toast.error(tCopy.errors.claims);

    } finally {

      setAllClaimsLoading(false);

    }

  };



  const fetchPendingVerifications = async (page: number, search: string) => {

    if (!token) return;

    try {

      setPendingUsersLoading(true);

      const res = await adminApi.getPendingVerifications(token, {

        page,

        limit: PAGE_LIMIT,

        name: search || undefined,

      });

      setPendingUsers(res.users);

      setPendingUsersTotalPages(res.totalPages || 1);

    } catch (err) {

      console.error("Failed to fetch pending verifications", err);

      toast.error(tCopy.errors.verifications);

    } finally {

      setPendingUsersLoading(false);

    }

  };



  const fetchPosts = async (

    page: number,

    search: string,

    postType: "all" | "missing" | "found",

  ) => {

    if (!token) return;

    try {

      setPostsLoading(true);

      const res = await adminApi.getAllPostsAdmin(token, {

        page,

        limit: PAGE_LIMIT,

        name: search || undefined,

        postType: postType === "all" ? undefined : postType,

      });

      setPosts(res.posts);

      setPostTotalPages(res.totalPages || 1);

    } catch (err) {

      console.error("Failed to fetch posts", err);

      toast.error(tCopy.errors.posts);

    } finally {

      setPostsLoading(false);

    }

  };



  const fetchSightingReports = async (page: number) => {

    if (!token) return;

    try {

      setSightingReportsLoading(true);

      const res = await adminApi.getSightings(token, page, PAGE_LIMIT);

      setSightingReports(res.sightings);

      setSightingReportsTotalPages(res.totalPages || 1);

    } catch (err) {

      console.error("Failed to fetch sighting reports", err);

      toast.error(isRTL ? "فشل جلب بلاغات المشاهدة" : "Failed to fetch sighting reports");

    } finally {

      setSightingReportsLoading(false);

    }

  };



  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSearchSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    setUserPage(1);

    setUserSearch(userSearchInput.trim());

  };



  const handleUserSearchInputChange = (value: string) => {

    setUserSearchInput(value);

    if (!value.trim()) {

      setUserPage(1);

      setUserSearch("");

    }

  };



  const handlePendingUsersSearchSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    setPendingUsersPage(1);

    setPendingUserSearch(pendingUserSearchInput.trim());

  };



  const handlePendingUsersSearchInputChange = (value: string) => {

    setPendingUserSearchInput(value);

    if (!value.trim()) {

      setPendingUsersPage(1);

      setPendingUserSearch("");

    }

  };



  const handlePostsSearchSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    setPostPage(1);

    setPostSearch(postSearchInput.trim());

  };



  const handlePostsSearchInputChange = (value: string) => {

    setPostSearchInput(value);

    if (!value.trim()) {

      setPostPage(1);

      setPostSearch("");

    }

  };



  const handleToggleBan = async (user: AdminUser) => {

    if (!token) return;

    if (user.role === "admin") {

      toast.error(tCopy.errors.cantBanAdmin);

      return;

    }

    try {

      setBanningUserId(user._id);

      const res = await adminApi.toggleBanUser(user._id, token);

      setUsers((prev) =>

        prev.map((u) =>

          u._id === user._id ? { ...u, isbanned: res.isbanned } : u,

        ),

      );

      toast.success(res.isbanned ? tCopy.users.banned : tCopy.users.unbanned);

    } catch (err) {

      console.error("Failed to toggle ban", err);

      const e = err as Error;

      toast.error(e.message || tCopy.errors.banFailed);

    } finally {

      setBanningUserId(null);

    }

  };



  const handleReviewClaim = async (

    decision: "approved" | "rejected",

    notes?: string,

  ) => {

    if (!token || !reviewingClaim) return;

    try {

      setSubmittingReview(decision);

      await adminApi.adminReviewClaim(

        reviewingClaim._id,

        decision,

        notes?.trim() || undefined,

        token,

      );

      toast.success(

        decision === "approved" ? tCopy.claims.approved : tCopy.claims.rejected,

      );

      setReviewingClaim(null);

      setReviewNotes("");

      void fetchPendingClaims(claimPage);

      void fetchAllClaims(allClaimsPage, allClaimsStatus);

      void fetchStats();

    } catch (err) {

      console.error("Failed to review claim", err);

      const e = err as Error;

      toast.error(e.message || tCopy.errors.reviewFailed);

    } finally {

      setSubmittingReview(null);

    }

  };



  const handleReviewVerification = async (

    decision: "approved" | "rejected",

    reason?: string,

  ) => {

    if (!token || !reviewingVerification) return;

    try {

      setVerificationDecision(decision);

      if (decision === "approved") {

        await adminApi.verifyUser(reviewingVerification._id, token);

        toast.success(tCopy.verifications.approved);

      } else {

        await adminApi.rejectVerification(

          reviewingVerification._id,

          reason,

          token,

        );

        toast.success(tCopy.verifications.rejected);

      }

      setReviewingVerification(null);

      void fetchPendingVerifications(pendingUsersPage, pendingUserSearch);

      void fetchStats();

    } catch (err) {

      console.error("Failed to review verification", err);

      const e = err as Error;

      toast.error(e.message || tCopy.errors.verifyFailed);

    } finally {

      setVerificationDecision(null);

    }

  };



  const handleDeletePost = async (post: BackendPost) => {

    if (!token) return;

    const ok = window.confirm(

      tCopy.posts.deleteConfirm.replace("{name}", post.name),

    );

    if (!ok) return;

    try {

      setDeletingPostId(post._id);

      await adminApi.deletePostAdmin(post._id, token);

      toast.success(tCopy.posts.deleted);

      setPosts((prev) => prev.filter((p) => p._id !== post._id));

      void fetchStats();

    } catch (err) {

      console.error("Failed to delete post", err);

      const e = err as Error;

      toast.error(e.message || tCopy.errors.deleteFailed);

    } finally {

      setDeletingPostId(null);

    }

  };



  // ── Sidebar config ─────────────────────────────────────────────────────────

  const sidebarItems: AdminDrawerItem[] = [

    {

      id: "overview",

      label: tCopy.tabs.overview,

      icon: LayoutDashboard,

      tone: "slate",

    },

    {

      id: "claims",

      label: tCopy.tabs.claims,

      icon: ClipboardList,

      badge: stats?.pendingClaims,

      tone: "red",

    },

    {

      id: "sighting_reports",

      label: tCopy.sectionTitles.sighting_reports,

      icon: Eye,

      badge: stats?.sightingReports,

      tone: "slate",

    },

    {

      id: "verifications",

      label: tCopy.tabs.verifications,

      icon: ShieldCheck,

      badge: stats?.pendingVerifications,

      tone: "amber",

    },

    {

      id: "users",

      label: tCopy.tabs.users,

      icon: Users,

      badge: stats?.totalUsers,

      tone: "slate",

    },

    {

      id: "posts",

      label: tCopy.tabs.posts,

      icon: Layers,

      badge: stats?.totalPosts,

      tone: "slate",

    },

    {

      id: "contact_messages",

      label: tCopy.sectionTitles.contact_messages,

      icon: Mail,

      badge: stats?.pendingContactMessages,

      tone: "amber",

    },

    {

      id: "user_reports",

      label: tCopy.sectionTitles.user_reports,

      icon: ShieldAlert,

      badge: stats?.pendingUserReports,

      tone: "amber",

    },

    {

      id: "chats",

      label: tCopy.sectionTitles.chats,

      icon: MessageSquare,

      tone: "slate",

    },

  ];



  return (

    <div

      className="min-h-screen bg-slate-50  transition-colors duration-300"

      dir={isRTL ? "rtl" : "ltr"}

    >

      <main className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">

        <div className="flex flex-col xl:flex-row gap-8">

          {/* ── Sidebar ─────────────────────────────────────────────── */}

          <aside className="xl:w-72 xl:shrink-0 xl:self-start">

            <div className="flex flex-col gap-6 xl:sticky xl:top-8 xl:max-h-[calc(100vh-4rem)] xl:overflow-y-auto custom-scrollbar">

              {/* Brand header */}

              <div className="px-2">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-tertiary">

                    <ShieldAlert className="h-6 w-6" />

                  </div>

                  <div className="flex flex-col text-start">

                    <p className="text-base font-bold text-tertiary">

                      {tCopy.brand.title}

                    </p>

                    <p className="text-xs text-slate-500">

                      {tCopy.brand.subtitle}

                    </p>

                  </div>

                </div>

              </div>



              {/* Nav list */}

              <nav className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs hidden xl:flex xl:flex-col gap-2">

                {sidebarItems.map((item) => {

                  const Icon = item.icon;

                  const isActive = activeSection === item.id;

                  return (

                    <button

                      key={item.id}

                      onClick={() => {

                        if (item.id === "chats") {

                          setAdminChatsTargetId("");

                        }

                        setActiveSection(item.id as Section);

                      }}

                      className={`relative shrink-0 inline-flex items-center justify-center xl:justify-start gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer w-auto xl:w-full ${

                        isActive

                          ? "bg-primary text-secondary shadow-sm"

                          : "text-slate-600 hover:bg-slate-100"

                      }`}

                    >

                      <Icon className="h-5 w-5 shrink-0" />

                      <span className="flex-1 text-start whitespace-nowrap xl:whitespace-normal">

                        {item.label}

                      </span>

                      {typeof item.badge === "number" && item.badge > 0 && (

                        <span

                          className={`shrink-0 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold ${

                            item.tone === "red"

                              ? "bg-red-500 text-white"

                              : item.tone === "amber"

                                ? "bg-amber-500 text-white"

                                : isActive

                                  ? "bg-secondary text-white"

                                  : "bg-slate-200 text-slate-600"

                          }`}

                        >

                          {item.badge}

                        </span>

                      )}

                    </button>

                  );

                })}

              </nav>

            </div>

          </aside>



          {/* ── Content ─────────────────────────────────────────────── */}

          <div className="flex-1 min-w-0 flex flex-col gap-6">

            <div className="flex items-center justify-between xl:hidden mb-2">

              <button

                type="button"

                onClick={() => setAdminDrawerOpen(true)}

                className="inline-flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors"

              >

                <LayoutDashboard className="h-5 w-5" />

                {tCopy.drawer.action}

              </button>

            </div>

            <header className="flex flex-col items-start gap-2 text-start">

              <h1 className="text-2xl sm:text-3xl font-black text-tertiary ">

                {tCopy.sectionTitles[activeSection]}

              </h1>

              <p className="text-sm text-slate-500 ">

                {tCopy.sectionSubtitles[activeSection]}

              </p>

            </header>



            {activeSection === "overview" && (

              <OverviewPanel

                stats={stats}

                loading={statsLoading}

                t={tCopy}

                isRTL={isRTL}

                onAction={(section) => {

                  if (section === "claims") {

                    setActiveSection("claims");

                    setClaimsTab("pending");

                  } else if (section === "verifications") {

                    setActiveSection("verifications");

                  } else if (section === "activeMissing") {

                    setActiveSection("posts");

                    setPostTypeFilter("missing");

                  }

                }}

              />

            )}



            {activeSection === "contact_messages" && (

              <ContactMessagesPanel

                t={tCopy}

                isRTL={isRTL}

                onReplied={fetchStats}

              />

            )}



            {activeSection === "user_reports" && (

              <UserReportsPanel

                t={tCopy}

                isRTL={isRTL}

                onReplied={fetchStats}

                onViewChat={(chatId) => {

                  setAdminChatsTargetId(chatId);

                  setActiveSection("chats");

                }}

              />

            )}



            {activeSection === "chats" && (

              <AdminChatsPanel

                isRTL={isRTL}

                initialChatId={adminChatsTargetId}

              />

            )}



            {activeSection === "claims" && (

              <ClaimsManagementPanel

                tab={claimsTab}

                onTabChange={setClaimsTab}

                pendingCount={stats?.pendingClaims ?? 0}

                pendingClaims={claims}

                pendingLoading={claimsLoading}

                pendingPage={claimPage}

                pendingTotalPages={claimTotalPages}

                onPendingPageChange={setClaimPage}

                processedClaims={allClaims}

                processedLoading={allClaimsLoading}

                processedPage={allClaimsPage}

                processedTotalPages={allClaimsTotalPages}

                onProcessedPageChange={setAllClaimsPage}

                processedStatus={allClaimsStatus}

                onProcessedStatusChange={(s) => {

                  setAllClaimsStatus(s);

                  setAllClaimsPage(1);

                }}

                onReview={(c) => {

                  setReviewingClaim(c);

                  setReviewNotes("");

                }}

                t={tCopy}

                isRTL={isRTL}

              />

            )}



            {activeSection === "verifications" && (

              <VerificationsPanel

                users={pendingUsers}

                loading={pendingUsersLoading}

                searchInput={pendingUserSearchInput}

                onSearchInputChange={handlePendingUsersSearchInputChange}

                onSearchSubmit={handlePendingUsersSearchSubmit}

                page={pendingUsersPage}

                totalPages={pendingUsersTotalPages}

                onPageChange={setPendingUsersPage}

                onReview={setReviewingVerification}

                t={tCopy}

                isRTL={isRTL}

              />

            )}



            {activeSection === "users" && (

              <UsersPanel

                users={users}

                loading={usersLoading}

                searchInput={userSearchInput}

                onSearchInputChange={handleUserSearchInputChange}

                onSearchSubmit={handleSearchSubmit}

                page={userPage}

                totalPages={userTotalPages}

                onPageChange={setUserPage}

                onToggleBan={handleToggleBan}

                banningUserId={banningUserId}

                t={tCopy}

                isRTL={isRTL}

              />

            )}



            {activeSection === "posts" && (

              <PostsPanel

                posts={posts}

                loading={postsLoading}

                searchInput={postSearchInput}

                onSearchInputChange={handlePostsSearchInputChange}

                onSearchSubmit={handlePostsSearchSubmit}

                postTypeFilter={postTypeFilter}

                onPostTypeFilterChange={(f) => {

                  setPostTypeFilter(f);

                  setPostPage(1);

                }}

                page={postPage}

                totalPages={postTotalPages}

                onPageChange={setPostPage}

                onDelete={handleDeletePost}

                deletingPostId={deletingPostId}

                t={tCopy}

                isRTL={isRTL}

              />

            )}



            {activeSection === "sighting_reports" && (

              <SightingReportsPanel

                reports={sightingReports}

                loading={sightingReportsLoading}

                page={sightingReportsPage}

                totalPages={sightingReportsTotalPages}

                onPageChange={setSightingReportsPage}

                isRTL={isRTL}

              />

            )}

          </div>

        </div>

      </main>



      <AnimatePresence>

        {reviewingClaim && (

          <ReviewClaimModal

            claim={reviewingClaim}

            notes={reviewNotes}

            onNotesChange={setReviewNotes}

            onClose={() => setReviewingClaim(null)}

            onSubmit={handleReviewClaim}

            submitting={submittingReview}

            t={tCopy}

            isRTL={isRTL}

          />

        )}

        {reviewingVerification && (

          <ReviewVerificationModal

            user={reviewingVerification}

            onClose={() => setReviewingVerification(null)}

            onSubmit={handleReviewVerification}

            submitting={verificationDecision}

            t={tCopy}

            isRTL={isRTL}

          />

        )}

      </AnimatePresence>



      <AdminDrawer

        isOpen={adminDrawerOpen}

        setIsOpen={setAdminDrawerOpen}

        isRTL={isRTL}

        title={tCopy.drawer.title}

        subtitle={tCopy.drawer.subtitle}

        items={sidebarItems}

        activeId={activeSection}

        onSelect={(id) => {

          if (id === "chats") {

            setAdminChatsTargetId("");

          }

          setActiveSection(id as Section);

        }}

      />

    </div>

  );

}



// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewPanel({

  stats,

  loading,

  t,

  isRTL,

  onAction,

}: {

  stats: DashboardStats | null;

  loading: boolean;

  t: Copy;

  isRTL: boolean;

  onAction: (target: string) => void;

}) {

  if (loading) {

    return (

      <div className="bg-white p-12 rounded-2xl border border-slate-200 flex items-center justify-center">

        <Loader2 className="h-6 w-6 text-secondary animate-spin" />

      </div>

    );

  }

  if (!stats) {

    return (

      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">

        {t.errors.stats}

      </div>

    );

  }



  const summaryItems = [

    {

      label: t.stats.totalUsers,

      value: stats.totalUsers,

      icon: Users,

      trend: "+12%",

      color: "blue",

    },

    {

      label: t.stats.totalPosts,

      value: stats.totalPosts,

      icon: FileText,

      trend: "+5%",

      color: "emerald",

    },

    {

      label: t.stats.foundPosts,

      value: stats.foundPosts,

      icon: CheckCircle2,

      trend: "+2%",

      color: "amber",

    },

    {

      label: t.stats.resolvedPosts,

      value: stats.resolvedPosts,

      icon: ShieldCheck,

      trend: "+8%",

      color: "purple",

    },

  ];



  const priorityItems = [

    {

      label: t.stats.pendingClaims,

      value: stats.pendingClaims,

      icon: Inbox,

      target: "claims",

      description: isRTL ? "مراجعة المطالبات المعلقة" : "Review pending claims",

    },

    {

      label: t.stats.pendingVerifications,

      value: stats.pendingVerifications ?? 0,

      icon: ShieldAlert,

      target: "verifications",

      description: isRTL ? "التحقق من هوايات المستخدمين" : "Verify user identities",

    },

    {

      label: t.stats.activeMissing,

      value: stats.activeMissing,

      icon: AlertCircle,

      target: "activeMissing",

      description: isRTL ? "الحالات النشطة حالياً" : "Currently active cases",

    },

  ].sort((a, b) => b.value - a.value);



  const [currentSlide, setCurrentSlide] = useState(0);



  useEffect(() => {

    const timer = setTimeout(() => {

      setCurrentSlide((prev) => (prev + 1) % summaryItems.length);

    }, 3000);

    return () => clearTimeout(timer);

  }, [currentSlide]);



  const handlePrevSlide = () => {

    setCurrentSlide((prev) => (prev - 1 + summaryItems.length) % summaryItems.length);

  };



  const handleNextSlide = () => {

    setCurrentSlide((prev) => (prev + 1) % summaryItems.length);

  };



  return (

    <div className="space-y-6">

      {/* KPI Cards - Mobile Carousel */}

      <motion.div 

        className="md:hidden w-full"

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}

      >

        <div className="bg-white rounded-xl border border-gray-100 flex items-center justify-between px-3 py-5 shadow-sm">

          {/* Left Arrow */}

          <button

            onClick={handlePrevSlide}

            className="p-2 rounded-full text-secondary hover:bg-slate-100 transition-colors shrink-0"

            aria-label="Previous slide"

          >

             {isRTL ? <ChevronRight className="w-5 h-5" strokeWidth={2.5} /> : <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />}

          </button>



          {/* Carousel Content */}

          <div className="flex-1 overflow-hidden px-3 flex justify-center">

            <AnimatePresence mode="wait">

              <motion.div 

                key={`slide-${currentSlide}`}

                className="flex items-center justify-center gap-3"

                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}

                animate={{ opacity: 1, x: 0 }}

                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}

                transition={{ duration: 0.3 }}

              >

                {(() => {

                  const item = summaryItems[currentSlide];

                  const Icon = item.icon;

                  return (

                    <>

                      <div className="p-2 bg-primary rounded-full text-secondary shrink-0">

                        <Icon className="w-5 h-5" strokeWidth={2} />

                      </div>

                      <div className="whitespace-nowrap flex flex-col justify-center">

                        <p className="text-[10px] md:text-sm font-medium text-gray-500">

                          {item.label}

                        </p>

                        <p className="text-lg md:text-2xl font-bold text-slate-800">

                          {item.value.toLocaleString()}

                        </p>

                      </div>

                    </>

                  );

                })()}

              </motion.div>

            </AnimatePresence>

          </div>



          {/* Right Arrow */}

          <button

            onClick={handleNextSlide}

            className="p-2 rounded-full text-secondary hover:bg-slate-100 transition-colors shrink-0"

            aria-label="Next slide"

          >

            {isRTL ? <ChevronLeft className="w-5 h-5" strokeWidth={2.5} /> : <ChevronRight className="w-5 h-5" strokeWidth={2.5} />}

          </button>

        </div>

      </motion.div>



      {/* KPI Cards - Desktop Grid */}

      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

        {summaryItems.map((item, idx) => {

          const Icon = item.icon;

          return (

            <motion.div

              key={item.label}

              initial={{ opacity: 0, y: 15 }}

              animate={{ opacity: 1, y: 0 }}

              transition={{ delay: idx * 0.05 }}

              className="bg-white p-4 lg:p-5 rounded-xl border border-gray-100 flex items-center justify-start gap-3 lg:gap-4 shadow-sm hover:shadow-md transition-shadow"

            >

              <div className="p-2 lg:p-2.5 bg-primary rounded-full text-secondary shrink-0">

                <Icon className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2} />

              </div>

              <div className="text-start flex flex-col justify-center whitespace-nowrap overflow-hidden text-ellipsis">

                <p className="text-[11px] lg:text-sm font-medium text-gray-500 overflow-hidden text-ellipsis w-full">

                  {item.label}

                </p>

                <p className="text-lg lg:text-2xl font-bold text-slate-800 overflow-hidden text-ellipsis w-full">

                  {item.value.toLocaleString()}

                </p>

              </div>

            </motion.div>

          );

        })}

      </div>



      {/* Priority Queue */}

      <motion.div

        initial={{ opacity: 0, y: 15 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ delay: 0.2 }}

        className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"

      >

        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-lg font-bold text-tertiary flex items-center gap-2">

                <Layers className="h-5 w-5 text-tertiary-light" />

                {isRTL ? "قائمة المهام ذات الأولوية" : "Priority Action Queue"}

              </h3>

              <p className="mt-1 text-sm text-slate-500">

                {isRTL ? "العناصر التي تتطلب انتباهك الفوري" : "Items requiring your immediate attention"}

              </p>

            </div>

            <span className="hidden sm:inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-tertiary bg-tertiary/10 rounded-full">

              {isRTL ? "تحديث مباشر" : "Live Updates"}

            </span>

          </div>

        </div>

        

        <div className="divide-y divide-slate-100">

          {priorityItems.map((item, idx) => {

            const Icon = item.icon;

            

            return (

              <motion.div

                key={item.label}

                initial={{ opacity: 0, x: -10 }}

                animate={{ opacity: 1, x: 0 }}

                transition={{ delay: 0.3 + idx * 0.1 }}

                className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors"

              >

                <div className="flex flex-1 items-start sm:items-center gap-4">

                  <div

                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-secondary group-hover:scale-110 transition-transform duration-300"

                  >

                    <Icon className="h-6 w-6" />

                  </div>

                  <div className="text-start">

                    <h4 className="text-base font-bold text-tertiary group-hover:text-tertiary-light transition-colors">

                      {item.label}

                    </h4>

                    <p className="mt-0.5 text-sm text-slate-500">

                      {item.description}

                    </p>

                  </div>

                </div>

                

                <div className="mt-4 sm:mt-0 flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end sm:gap-6 sm:ms-auto">

                  <div className="text-start sm:text-end">

                    <div className="text-2xl font-black text-tertiary leading-none">

                      {item.value.toLocaleString()}

                    </div>

                    <div className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">

                      {isRTL ? "عنصر" : "Items"}

                    </div>

                  </div>

                  

                  {item.value > 0 ? (

                    <button 

                      onClick={() => onAction(item.target)}

                      className="flex h-10 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-semibold text-white shadow-sm cursor-pointer hover:opacity-90 hover:shadow transition-all group-hover:-translate-y-0.5"

                    >

                      {isRTL ? "مراجعة الآن" : "Review Now"}

                    </button>

                  ) : (

                    <div className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400 cursor-not-allowed">

                       {isRTL ? "مكتمل" : "All Clear"}

                    </div>

                  )}

                </div>

              </motion.div>

            );

          })}

        </div>

      </motion.div>

    </div>

  );

}



// ─── Claims Management (combined Pending / Processed) ────────────────────────

function ClaimsManagementPanel({

  tab,

  onTabChange,

  pendingCount,

  pendingClaims,

  pendingLoading,

  pendingPage,

  pendingTotalPages,

  onPendingPageChange,

  processedClaims,

  processedLoading,

  processedPage,

  processedTotalPages,

  onProcessedPageChange,

  processedStatus,

  onProcessedStatusChange,

  onReview,

  t,

  isRTL,

}: {

  tab: ClaimsTab;

  onTabChange: (t: ClaimsTab) => void;

  pendingCount: number;

  pendingClaims: BackendClaim[];

  pendingLoading: boolean;

  pendingPage: number;

  pendingTotalPages: number;

  onPendingPageChange: (p: number) => void;

  processedClaims: BackendClaim[];

  processedLoading: boolean;

  processedPage: number;

  processedTotalPages: number;

  onProcessedPageChange: (p: number) => void;

  processedStatus: ClaimStatusFilter;

  onProcessedStatusChange: (s: ClaimStatusFilter) => void;

  onReview: (c: BackendClaim) => void;

  t: Copy;

  isRTL: boolean;

}) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">

      {/* Pending / Processed tabs */}

      <div className="px-4 sm:px-5 pt-4 sm:pt-5 border-b border-slate-100 flex items-center gap-2">

        {(["pending", "processed"] as ClaimsTab[]).map((tabId) => {

          const isActive = tab === tabId;

          return (

            <button

              key={tabId}

              onClick={() => onTabChange(tabId)}

              className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition-colors cursor-pointer ${

                isActive

                  ? "bg-secondary text-white shadow-sm"

                  : "text-slate-500 hover:text-slate-700"

              }`}

            >

              {tabId === "pending"

                ? `${t.claims.tabPending} (${pendingCount})`

                : `${t.claims.tabProcessed} (${processedClaims.length})`}

            </button>

          );

        })}

      </div>



      {tab === "pending" ? (

        <>

          {pendingLoading ? (

            <div className="p-12 flex items-center justify-center">

              <Loader2 className="h-6 w-6 text-secondary animate-spin" />

            </div>

          ) : pendingClaims.length === 0 ? (

            <div className="p-12 text-center text-slate-500">

              <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />

              {t.claims.empty}

            </div>

          ) : (

            <ul className="divide-y divide-slate-100">

              {pendingClaims.map((claim) => (

                <ClaimRow

                  key={claim._id}

                  claim={claim}

                  onReview={onReview}

                  t={t}

                  isRTL={isRTL}

                />

              ))}

            </ul>

          )}

          <Pagination

            page={pendingPage}

            totalPages={pendingTotalPages}

            onChange={onPendingPageChange}

            isRTL={isRTL}

          />

        </>

      ) : (

        <>

          <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex flex-wrap gap-1.5">

            {(["all", "approved", "rejected"] as ClaimStatusFilter[]).map(

              (status) => {

              const isActive = processedStatus === status;

              return (

                <button

                  key={status}

                  onClick={() => onProcessedStatusChange(status)}

                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${

                    isActive

                      ? "bg-secondary text-white shadow-sm"

                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"

                  }`}

                >

                  {t.claims.filters[status]}

                </button>

              );

            })}

          </div>



          {processedLoading ? (

            <div className="p-12 flex items-center justify-center">

              <Loader2 className="h-6 w-6 text-secondary animate-spin" />

            </div>

          ) : processedClaims.length === 0 ? (

            <div className="p-12 text-center text-slate-500">

              <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />

              {t.claims.processedEmpty}

            </div>

          ) : (

            <ul className="divide-y divide-slate-100">

              {processedClaims.map((claim) => (

                <ClaimRow

                  key={claim._id}

                  claim={claim}

                  onReview={onReview}

                  showStatus

                  t={t}

                  isRTL={isRTL}

                />

              ))}

            </ul>

          )}

          <Pagination

            page={processedPage}

            totalPages={processedTotalPages}

            onChange={onProcessedPageChange}

            isRTL={isRTL}

          />

        </>

      )}

    </div>

  );

}



function ClaimRow({

  claim,

  onReview,

  showStatus,

  t,

  isRTL,

}: {

  claim: BackendClaim;

  onReview: (c: BackendClaim) => void;

  showStatus?: boolean;

  t: Copy;

  isRTL: boolean;

}) {

  const post =

    typeof claim.postId === "object" ? (claim.postId as BackendPost) : null;

  const claimant =

    typeof claim.claimUserId === "object" ? claim.claimUserId : null;

  const statusTone =

    claim.status === "approved"

      ? "bg-green-50 text-green-700 border-green-200"

      : claim.status === "rejected"

        ? "bg-red-50 text-red-700 border-red-200"

        : "bg-amber-50 text-amber-700 border-amber-200";

  const statusLabel = t.claims.filters[claim.status as ClaimStatusFilter];



  return (

    <li className="p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">

      <div className="flex-1 flex flex-col items-start text-start gap-1.5 min-w-0">

        <div className="flex items-center justify-between gap-3 w-full">

          <div className="flex flex-wrap items-center gap-2 min-w-0">

            <span className="font-bold text-base sm:text-sm text-tertiary truncate">

              {t.claims.claimFor.replace(

                "{name}",

                post?.name || t.claims.unknownPost,

              )}

            </span>

            {showStatus && (

              <span

                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusTone}`}

              >

                {statusLabel}

              </span>

            )}

            {!showStatus && (

              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">

                {t.claims.filters.pending}

              </span>

            )}

          </div>

          {claim.status === "pending" && (

            <button

              onClick={() => onReview(claim)}

              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-secondary text-white hover:bg-secondary/90 transition-colors cursor-pointer"

            >

              {t.claims.review}

            </button>

          )}

        </div>

        <p className="text-xs sm:text-[11px] text-slate-400 mt-0.5">

          {t.claims.submittedOn}{" "}

          {new Date(claim.createdAt).toLocaleDateString(

            isRTL ? "ar-EG" : "en-US",

          )}

        </p>

        {claimant && (

          <div className="mt-2 w-full">

            <p className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400 mb-0.5">

              {t.claims.claimerInfo}

            </p>

            <p className="font-semibold text-sm sm:text-xs text-tertiary">

              {claimant.name || t.claims.unknownClaimant}

            </p>

            <p

              className="text-xs sm:text-[11px] text-slate-500 mt-0.5"

              style={{ wordBreak: "break-all" }}

            >

              {claimant.email || ""}

            </p>

          </div>

        )}

        {claim.additionalInfo && (

          <div className="mt-2 w-full">

            <p className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400 mb-0.5">

              {t.claims.description}

            </p>

            <p className="text-sm sm:text-xs text-slate-700 line-clamp-2">

              {claim.additionalInfo}

            </p>

          </div>

        )}

      </div>

    </li>

  );

}



// ─── Verifications Panel ─────────────────────────────────────────────────────

function VerificationsPanel({

  users,

  loading,

  searchInput,

  onSearchInputChange,

  onSearchSubmit,

  page,

  totalPages,

  onPageChange,

  onReview,

  t,

  isRTL,

}: {

  users: AdminUser[];

  loading: boolean;

  searchInput: string;

  onSearchInputChange: (v: string) => void;

  onSearchSubmit: (e: React.FormEvent) => void;

  page: number;

  totalPages: number;

  onPageChange: (p: number) => void;

  onReview: (u: AdminUser) => void;

  t: Copy;

  isRTL: boolean;

}) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">

      <SearchHeader

        title={t.verifications.title}

        searchInput={searchInput}

        onSearchInputChange={onSearchInputChange}

        onSearchSubmit={onSearchSubmit}

        placeholder={t.verifications.searchPlaceholder}

        searchLabel={t.users.search}

        isRTL={isRTL}

      />



      {loading ? (

        <div className="p-12 flex items-center justify-center">

          <Loader2 className="h-6 w-6 text-secondary animate-spin" />

        </div>

      ) : users.length === 0 ? (

        <div className="p-12 text-center text-slate-500">

          <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />

          {t.verifications.empty}

        </div>

      ) : (

        <ul className="divide-y divide-slate-100">

          {users.map((user) => (

            <li

              key={user._id}

              className="p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors"

            >

              <div className="flex items-start gap-4 flex-1 min-w-0">

                {/* ID thumbnail */}

                <div className="shrink-0 h-16 w-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400">

                  {user.idImagePath ? (

                    <img

                      src={user.idImagePath}

                      alt="ID"

                      className="w-full h-full object-cover"

                    />

                  ) : (

                    <ImageIcon className="h-6 w-6" />

                  )}

                </div>

                <div className="flex-1 min-w-0 flex flex-col items-start text-start mt-0.5">

                  <p className="font-bold text-base sm:text-sm text-tertiary truncate w-full">

                    {user.name}

                  </p>

                  <p className="text-sm sm:text-xs text-slate-500 truncate w-full mt-0.5">

                    {user.email}

                  </p>

                  {user.phoneNumber && (

                    <p className="text-sm sm:text-xs text-slate-400 truncate w-full mt-1">

                      {user.phoneNumber}

                    </p>

                  )}

                  <p className="text-xs sm:text-[11px] text-slate-400 mt-1">

                    {t.verifications.registered}{" "}

                    {new Date(user.createdAt).toLocaleDateString(

                      isRTL ? "ar-EG" : "en-US",

                    )}

                  </p>

                </div>

              </div>

              <button

                onClick={() => onReview(user)}

                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl text-sm sm:text-xs font-bold bg-secondary text-white hover:bg-secondary/90 transition-colors cursor-pointer shrink-0 mt-2 sm:mt-0"

              >

                {t.verifications.review}

              </button>

            </li>

          ))}

        </ul>

      )}



      <Pagination

        page={page}

        totalPages={totalPages}

        onChange={onPageChange}

        isRTL={isRTL}

      />

    </div>

  );

}



// ─── Users Panel (with fixed table alignment) ─────────────────────────────────

function UsersPanel({

  users,

  loading,

  searchInput,

  onSearchInputChange,

  onSearchSubmit,

  page,

  totalPages,

  onPageChange,

  onToggleBan,

  banningUserId,

  t,

  isRTL,

}: {

  users: AdminUser[];

  loading: boolean;

  searchInput: string;

  onSearchInputChange: (v: string) => void;

  onSearchSubmit: (e: React.FormEvent) => void;

  page: number;

  totalPages: number;

  onPageChange: (p: number) => void;

  onToggleBan: (u: AdminUser) => void;

  banningUserId: string | null;

  t: Copy;

  isRTL: boolean;

}) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">

      <SearchHeader

        title={t.users.title}

        searchInput={searchInput}

        onSearchInputChange={onSearchInputChange}

        onSearchSubmit={onSearchSubmit}

        placeholder={t.users.searchPlaceholder}

        searchLabel={t.users.search}

        isRTL={isRTL}

      />



      {loading ? (

        <div className="p-12 flex items-center justify-center">

          <Loader2 className="h-6 w-6 text-secondary animate-spin" />

        </div>

      ) : users.length === 0 ? (

        <div className="p-12 text-center text-slate-500">{t.users.empty}</div>

      ) : (

        <div className="overflow-x-auto">

          {/*

            Explicit colgroup widths + table-fixed prevent the auto-layout

            algorithm from making columns hug their (sometimes wildly varying)

            content, which is what was making the role/status pills appear

            "centred" relative to their headers.

          */}

          <table className="w-full text-sm table-fixed min-w-215">

            <colgroup>

              <col style={{ width: "22%" }} />

              <col style={{ width: "28%" }} />

              <col style={{ width: "11%" }} />

              <col style={{ width: "11%" }} />

              <col style={{ width: "14%" }} />

              <col style={{ width: "14%" }} />

            </colgroup>

            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">

              <tr>

                <th className="px-5 py-3 text-start font-semibold">

                  {t.users.name}

                </th>

                <th className="px-5 py-3 text-start font-semibold">

                  {t.users.email}

                </th>

                <th className="px-5 py-3 text-start font-semibold">

                  {t.users.role}

                </th>

                <th className="px-5 py-3 text-start font-semibold">

                  {t.users.status}

                </th>

                <th className="px-5 py-3 text-start font-semibold">

                  {t.users.joined}

                </th>

                <th className="px-5 py-3 text-end font-semibold">

                  {t.users.actions}

                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {users.map((user) => (

                <tr

                  key={user._id}

                  className="hover:bg-slate-50/60 align-middle"

                >

                  <td

                    className="px-5 py-3 text-start font-semibold text-tertiary truncate"

                    title={user.name}

                  >

                    {user.name}

                  </td>

                  <td

                    className="px-5 py-3 text-start text-slate-600 truncate"

                    title={user.email}

                  >

                    {user.email}

                  </td>

                  <td className="px-5 py-3 text-start">

                    <span

                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${

                        user.role === "admin"

                          ? "bg-purple-50 text-purple-700 border border-purple-200"

                          : "bg-slate-100 text-slate-700"

                      }`}

                    >

                      {user.role}

                    </span>

                  </td>

                  <td className="px-5 py-3 text-start">

                    <span

                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${

                        user.isbanned

                          ? "bg-red-50 text-red-700 border border-red-200"

                          : "bg-green-50 text-green-700 border border-green-200"

                      }`}

                    >

                      {user.isbanned ? t.users.banned : t.users.active}

                    </span>

                  </td>

                  <td className="px-5 py-3 text-start text-slate-500 whitespace-nowrap">

                    {new Date(user.createdAt).toLocaleDateString(

                      isRTL ? "ar-EG" : "en-US",

                      {

                        year: "numeric",

                        month: "short",

                        day: "numeric",

                      },

                    )}

                  </td>

                  <td className="px-5 py-3 text-end">

                    <button

                      onClick={() => onToggleBan(user)}

                      disabled={

                        user.role === "admin" || banningUserId === user._id

                      }

                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${

                        user.isbanned

                          ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"

                          : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"

                      }`}

                    >

                      {banningUserId === user._id ? (

                        <Loader2 className="h-3.5 w-3.5 animate-spin" />

                      ) : user.isbanned ? (

                        <UserCheck className="h-3.5 w-3.5" />

                      ) : (

                        <UserX className="h-3.5 w-3.5" />

                      )}

                      {user.isbanned ? t.users.unban : t.users.ban}

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}



      <Pagination

        page={page}

        totalPages={totalPages}

        onChange={onPageChange}

        isRTL={isRTL}

      />

    </div>

  );

}



// ─── Posts Management ────────────────────────────────────────────────────────

function PostsPanel({

  posts,

  loading,

  searchInput,

  onSearchInputChange,

  onSearchSubmit,

  postTypeFilter,

  onPostTypeFilterChange,

  page,

  totalPages,

  onPageChange,

  onDelete,

  deletingPostId,

  t,

  isRTL,

}: {

  posts: BackendPost[];

  loading: boolean;

  searchInput: string;

  onSearchInputChange: (v: string) => void;

  onSearchSubmit: (e: React.FormEvent) => void;

  postTypeFilter: "all" | "missing" | "found";

  onPostTypeFilterChange: (f: "all" | "missing" | "found") => void;

  page: number;

  totalPages: number;

  onPageChange: (p: number) => void;

  onDelete: (p: BackendPost) => void;

  deletingPostId: string | null;

  t: Copy;

  isRTL: boolean;

}) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">

      <SearchHeader

        title={t.posts.title}

        searchInput={searchInput}

        onSearchInputChange={onSearchInputChange}

        onSearchSubmit={onSearchSubmit}

        placeholder={t.posts.searchPlaceholder}

        searchLabel={t.users.search}

        isRTL={isRTL}

      />

      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex flex-wrap gap-1.5">

        {(["all", "missing", "found"] as const).map((type) => {

          const isActive = postTypeFilter === type;

          return (

            <button

              key={type}

              onClick={() => onPostTypeFilterChange(type)}

              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${

                isActive

                  ? "bg-secondary text-white shadow-sm"

                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"

              }`}

            >

              {t.posts.filters[type]}

            </button>

          );

        })}

      </div>



      {loading ? (

        <div className="p-12 flex items-center justify-center">

          <Loader2 className="h-6 w-6 text-secondary animate-spin" />

        </div>

      ) : posts.length === 0 ? (

        <div className="p-12 text-center text-slate-500">

          <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />

          {t.posts.empty}

        </div>

      ) : (

        <ul className="divide-y divide-slate-100">

          {posts.map((post) => {

            const owner =

              typeof post.userId === "object" && post.userId !== null

                ? post.userId

                : null;

            const typeTone =

              post.postType === "missing"

                ? "bg-amber-50 text-amber-700 border-amber-200"

                : "bg-emerald-50 text-emerald-700 border-emerald-200";

            return (

              <li

                key={post._id}

                className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50/50"

              >

                {/* Left side: image + info */}

                <div className="flex items-start gap-4 min-w-0">

                  <div className="shrink-0 h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-400">

                    {post.postImage ? (

                      <img

                        src={post.postImage}

                        alt={post.name}

                        className="w-full h-full object-cover"

                      />

                    ) : (

                      <ImageIcon className="h-5 w-5" />

                    )}

                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-1.5 md:gap-2">

                      <span className="font-bold text-tertiary truncate text-start block">

                        {post.name}

                      </span>

                      <div className="flex flex-wrap items-center justify-start gap-2">

                        <span

                          className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${typeTone}`}

                        >

                          {t.posts.filters[post.postType]}

                        </span>

                        <span

                          className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${

                            post.status === "active"

                              ? "bg-blue-50 text-blue-700 border border-blue-200"

                              : "bg-slate-100 text-slate-600 border border-slate-200"

                          }`}

                        >

                          {post.status}

                        </span>

                      </div>

                    </div>

                    <div className="mt-1 w-full text-start">

                      {owner && (

                        <p className="text-xs text-slate-500 truncate">

                          {t.posts.by} {owner.name} · {owner.email || ""}

                        </p>

                      )}

                      <p className="text-[11px] text-slate-400">

                        {post.createdAt &&

                          new Date(post.createdAt).toLocaleDateString(

                            isRTL ? "ar-EG" : "en-US",

                            {

                              year: "numeric",

                              month: "short",

                              day: "numeric",

                            },

                          )}

                      </p>

                    </div>

                  </div>

                </div>

                {/* Right side: Delete button */}

                <button

                  onClick={() => onDelete(post)}

                  disabled={deletingPostId === post._id}

                  className="w-full md:w-auto shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-100 hover:bg-red-100/80 transition-colors cursor-pointer disabled:opacity-50"

                >

                  {deletingPostId === post._id ? (

                    <Loader2 className="h-3.5 w-3.5 animate-spin" />

                  ) : (

                    <Trash2 className="h-3.5 w-3.5" />

                  )}

                  {t.posts.delete}

                </button>

              </li>

            );

          })}

        </ul>

      )}



      <Pagination

        page={page}

        totalPages={totalPages}

        onChange={onPageChange}

        isRTL={isRTL}

      />

    </div>

  );

}



// ─── Shared search header ───────────────────────────────────────────────────

function SearchHeader({

  title,

  searchInput,

  onSearchInputChange,

  onSearchSubmit,

  placeholder,

  searchLabel,

  isRTL,

}: {

  title: string;

  searchInput: string;

  onSearchInputChange: (v: string) => void;

  onSearchSubmit: (e: React.FormEvent) => void;

  placeholder: string;

  searchLabel: string;

  isRTL: boolean;

}) {

  return (

    <div className="p-4 sm:p-5 border-b border-slate-100  flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

      <h2 className="text-tertiary  font-bold text-start">

        {title}

      </h2>

      <form

        onSubmit={onSearchSubmit}

        className="flex items-center gap-2 w-full sm:w-auto"

      >

        <div className="relative flex-1 sm:w-64 sm:flex-none">

          <Search

            className={`h-4 w-4 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3" : "left-3"} text-slate-400 pointer-events-none`}

          />

          <input

            type="text"

            value={searchInput}

            onChange={(e) => onSearchInputChange(e.target.value)}

            placeholder={placeholder}

            className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"} py-2 text-sm focus:bg-white focus:border-secondary outline-none`}

          />

        </div>

        <button

          type="submit"

          className="shrink-0 px-4 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors cursor-pointer"

        >

          {searchLabel}

        </button>

      </form>

    </div>

  );

}



// ─── Review Claim Modal ─────────────────────────────────────────────────────

function ReviewClaimModal({

  claim,

  notes,

  onNotesChange,

  onClose,

  onSubmit,

  submitting,

  t,

  isRTL,

}: {

  claim: BackendClaim;

  notes: string;

  onNotesChange: (v: string) => void;

  onClose: () => void;

  onSubmit: (decision: "approved" | "rejected", notes?: string) => void;

  submitting: "approved" | "rejected" | null;

  t: Copy;

  isRTL: boolean;

}) {

  const post =

    typeof claim.postId === "object" ? (claim.postId as BackendPost) : null;

  const claimant =

    typeof claim.claimUserId === "object" ? claim.claimUserId : null;

  const documentUrl = claim.documentPath || "";



  return (

    <motion.div

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      exit={{ opacity: 0 }}

      className="fixed inset-0 z-70 bg-slate-950/40 flex items-start justify-center p-4 sm:p-8 overflow-y-auto"

      onClick={onClose}

    >

      <motion.div

        initial={{ scale: 0.95, opacity: 0 }}

        animate={{ scale: 1, opacity: 1 }}

        exit={{ scale: 0.95, opacity: 0 }}

        onClick={(e) => e.stopPropagation()}

        dir={isRTL ? "rtl" : "ltr"}

        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-6"

      >

        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between">

          <div className="flex items-start gap-3 text-start">

            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">

              <ClipboardList className="h-4 w-4" />

            </span>

            <div>

              <h3 className="text-lg font-bold text-tertiary">

                {t.claims.reviewTitle}

              </h3>

              <p className="text-sm text-slate-500 mt-1">

                {post?.name || t.claims.unknownPost}

              </p>

            </div>

          </div>

          <button

            onClick={onClose}

            title={isRTL ? "إغلاق" : "Close"}

            className="h-8 w-8 rounded-full bg-slate-200/60  text-slate-500  hover:bg-slate-200 flex items-center justify-center"

          >

            <X className="h-4 w-4" />

          </button>

        </div>

        <div className="px-6 py-6 space-y-6 overflow-y-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">

            <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm text-start">

              <p className="text-[11px] uppercase font-semibold text-slate-400 mb-1">

                {t.claims.claimant}

              </p>

              <p className="font-bold text-tertiary ">

                {claimant?.name || "—"}

              </p>

              <p className="text-xs text-slate-500 ">

                {claimant?.email || ""}

              </p>

              {claimant?.phoneNumber && (

                <p className="text-xs text-slate-500 ">

                  {claimant.phoneNumber}

                </p>

              )}

            </div>

            <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm text-start">

              <p className="text-[11px] uppercase font-semibold text-slate-400 mb-1">

                {t.claims.post}

              </p>

              <p className="font-bold text-tertiary ">

                {post?.name || "—"}

              </p>

              <p className="text-xs text-slate-500  capitalize">

                {post?.postType || ""}

              </p>

            </div>

          </div>



          {claim.additionalInfo && (

            <div className="bg-amber-50/60 rounded-2xl border border-amber-200/60 p-4 text-sm text-start">

              <p className="text-[11px] uppercase font-semibold text-amber-700 mb-1">

                {t.claims.relationship}

              </p>

              <p className="text-slate-700 whitespace-pre-wrap">

                {claim.additionalInfo}

              </p>

            </div>

          )}



          {documentUrl && (

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-start">

              <p className="text-[11px] uppercase font-semibold text-slate-400 mb-2">

                {t.claims.viewDocument}

              </p>

              <a

                href={documentUrl}

                target="_blank"

                rel="noopener noreferrer"

                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-white transition-colors"

              >

                <FileText className="h-4 w-4 text-secondary" />

                {t.claims.viewDocument}

              </a>

            </div>

          )}



          <div className="text-start">

            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">

              {t.claims.notes}

            </label>

            <textarea

              value={notes}

              onChange={(e) => onNotesChange(e.target.value)}

              placeholder={t.claims.notesPlaceholder}

              rows={3}

              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-secondary outline-none resize-none text-slate-700 "

            />

          </div>

        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-end">

          <button

            onClick={() => onSubmit("rejected", notes.trim() || undefined)}

            disabled={submitting !== null}

            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"

          >

            {submitting === "rejected" ? (

              <Loader2 className="h-4 w-4 animate-spin" />

            ) : (

              <>

                <XCircle className="h-4 w-4" />

                {t.claims.reject}

              </>

            )}

          </button>

          <button

            onClick={() => onSubmit("approved", notes.trim() || undefined)}

            disabled={submitting !== null}

            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"

          >

            {submitting === "approved" ? (

              <Loader2 className="h-4 w-4 animate-spin" />

            ) : (

              <>

                <CheckCircle2 className="h-4 w-4" />

                {t.claims.approve}

              </>

            )}

          </button>

        </div>

      </motion.div>

    </motion.div>

  );

}



// ─── Review Verification Modal ───────────────────────────────────────────────

function ReviewVerificationModal({

  user,

  onClose,

  onSubmit,

  submitting,

  t,

  isRTL,

}: {

  user: AdminUser;

  onClose: () => void;

  onSubmit: (decision: "approved" | "rejected", reason?: string) => void;

  submitting: "approved" | "rejected" | null;

  t: Copy;

  isRTL: boolean;

}) {

  const [reason, setReason] = useState("");



  useEffect(() => {

    document.body.style.overflow = "hidden";

    return () => {

      document.body.style.overflow = "unset";

    };

  }, []);



  return (

    <motion.div

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      exit={{ opacity: 0 }}

      className="fixed inset-0 z-70 bg-slate-950/40 flex items-center justify-center p-4"

      onClick={onClose}

    >

      <motion.div

        initial={{ scale: 0.95, opacity: 0 }}

        animate={{ scale: 1, opacity: 1 }}

        exit={{ scale: 0.95, opacity: 0 }}

        onClick={(e) => e.stopPropagation()}

        dir={isRTL ? "rtl" : "ltr"}

        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"

      >

        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between shrink-0">

          <div>

            <h3 className="text-lg font-bold text-tertiary  text-start">

              {t.verifications.reviewTitle}

            </h3>

            <p className="text-sm text-slate-500  mt-1 text-start">

              {user.name} · {user.email}

            </p>

          </div>

          <button

            onClick={onClose}

            title={isRTL ? "إغلاق" : "Close"}

            className="h-8 w-8 rounded-full bg-slate-200/60  text-slate-500  hover:bg-slate-200 flex items-center justify-center"

          >

            <X className="h-4 w-4" />

          </button>

        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">

          {/* ID image preview */}

          {user.idImagePath ? (

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">

              <a

                href={user.idImagePath}

                target="_blank"

                rel="noopener noreferrer"

              >

                <img

                  src={user.idImagePath}

                  alt="ID"

                  className="w-full max-h-[55vh] object-contain bg-slate-50/50"

                />

              </a>

            </div>

          ) : (

            <div className="rounded-2xl border border-dashed border-slate-300  bg-slate-50 p-8 text-center text-slate-500 ">

              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />

              {t.verifications.noId}

            </div>

          )}



          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

            <InfoRow label={t.verifications.fullName} value={user.name} />

            <InfoRow label={t.verifications.email} value={user.email} />

            {user.phoneNumber && (

              <InfoRow label={t.verifications.phone} value={user.phoneNumber} />

            )}

            {user.birthDate && (

              <InfoRow

                label={t.verifications.birthDate}

                value={new Date(user.birthDate).toLocaleDateString(

                  isRTL ? "ar-EG" : "en-US",

                )}

              />

            )}

            {user.gender && (

              <InfoRow label={t.verifications.gender} value={user.gender} />

            )}

            <InfoRow

              label={t.verifications.registered}

              value={new Date(user.createdAt).toLocaleDateString(

                isRTL ? "ar-EG" : "en-US",

              )}

            />

          </div>



          <div>

            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">

              {t.verifications.rejectionReason}

            </label>

            <textarea

              value={reason}

              onChange={(e) => setReason(e.target.value)}

              placeholder={t.verifications.rejectionReasonPlaceholder}

              rows={2}

              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-secondary outline-none resize-none text-slate-700 "

            />

          </div>

        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-end shrink-0">

          <button

            onClick={() => onSubmit("rejected", reason.trim() || undefined)}

            disabled={submitting !== null}

            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"

          >

            {submitting === "rejected" ? (

              <Loader2 className="h-4 w-4 animate-spin" />

            ) : (

              <>

                <XCircle className="h-4 w-4" />

                {t.verifications.reject}

              </>

            )}

          </button>

          <button

            onClick={() => onSubmit("approved")}

            disabled={submitting !== null}

            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"

          >

            {submitting === "approved" ? (

              <Loader2 className="h-4 w-4 animate-spin" />

            ) : (

              <>

                <CheckCircle2 className="h-4 w-4" />

                {t.verifications.approve}

              </>

            )}

          </button>

        </div>

      </motion.div>

    </motion.div>

  );

}



function InfoRow({ label, value }: { label: string; value: string }) {

  return (

    <div className="bg-slate-50/80 /80 rounded-xl border border-slate-100  p-3">

      <p className="text-[11px] uppercase font-semibold text-slate-400 mb-1">

        {label}

      </p>

      <p className="font-semibold text-tertiary  text-sm break-all">

        {value}

      </p>

    </div>

  );

}



// ─── Pagination ─────────────────────────────────────────────────────────────

function Pagination({

  page,

  totalPages,

  onChange,

  isRTL,

}: {

  page: number;

  totalPages: number;

  onChange: (p: number) => void;

  isRTL: boolean;

}) {

  if (totalPages <= 1) return null;

  return (

    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">

      <button

        onClick={() => onChange(Math.max(1, page - 1))}

        disabled={page <= 1}

        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"

      >

        {isRTL ? (

          <ChevronRight className="h-4 w-4" />

        ) : (

          <ChevronLeft className="h-4 w-4" />

        )}

        {isRTL ? "السابق" : "Prev"}

      </button>

      <span className="text-xs text-slate-500">

        {isRTL

          ? `صفحة ${page} من ${totalPages}`

          : `Page ${page} of ${totalPages}`}

      </span>

      <button

        onClick={() => onChange(Math.min(totalPages, page + 1))}

        disabled={page >= totalPages}

        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"

      >

        {isRTL ? "التالي" : "Next"}

        {isRTL ? (

          <ChevronLeft className="h-4 w-4" />

        ) : (

          <ChevronRight className="h-4 w-4" />

        )}

      </button>

    </div>

  );

}



// ─── Localised copy ─────────────────────────────────────────────────────────

interface Copy {

  brand: { title: string; subtitle: string };

  tabs: {

    overview: string;

    claims: string;

    verifications: string;

    users: string;

    posts: string;

  };

  sectionTitles: Record<Section, string>;

  sectionSubtitles: Record<Section, string>;

  stats: {

    totalUsers: string;

    totalPosts: string;

    activeMissing: string;

    foundPosts: string;

    resolvedPosts: string;

    pendingClaims: string;

    pendingVerifications: string;

  };

  users: {

    title: string;

    name: string;

    email: string;

    role: string;

    status: string;

    joined: string;

    actions: string;

    active: string;

    banned: string;

    unbanned: string;

    ban: string;

    unban: string;

    search: string;

    searchPlaceholder: string;

    empty: string;

  };

  claims: {

    tabPending: string;

    tabProcessed: string;

    review: string;

    reviewTitle: string;

    approve: string;

    reject: string;

    approved: string;

    rejected: string;

    cancel: string;

    notes: string;

    notesPlaceholder: string;

    relationship: string;

    claimant: string;

    post: string;

    viewDocument: string;

    unknownClaimant: string;

    unknownPost: string;

    empty: string;

    processedEmpty: string;

    claimFor: string;

    submittedOn: string;

    claimerInfo: string;

    description: string;

    filters: Record<ClaimStatusFilter, string>;

  };

  verifications: {

    title: string;

    searchPlaceholder: string;

    empty: string;

    review: string;

    reviewTitle: string;

    approve: string;

    reject: string;

    approved: string;

    rejected: string;

    fullName: string;

    email: string;

    phone: string;

    birthDate: string;

    gender: string;

    registered: string;

    noId: string;

    rejectionReason: string;

    rejectionReasonPlaceholder: string;

  };

  posts: {

    title: string;

    searchPlaceholder: string;

    empty: string;

    delete: string;

    deleted: string;

    deleteConfirm: string;

    by: string;

    filters: { all: string; missing: string; found: string };

  };

  drawer: {

    title: string;

    subtitle: string;

    action: string;

  };

  errors: {

    stats: string;

    users: string;

    claims: string;

    verifications: string;

    posts: string;

    cantBanAdmin: string;

    banFailed: string;

    reviewFailed: string;

    verifyFailed: string;

    deleteFailed: string;

  };

}



function getCopy(isRTL: boolean): Copy {

  if (isRTL) {

    return {

      brand: { title: "لوحة الإدارة", subtitle: "إدارة المنصة" },

      tabs: {

        overview: "نظرة عامة",

        claims: "إدارة المطالبات",

        verifications: "توثيق المستخدمين",

        users: "إدارة المستخدمين",

        posts: "إدارة المنشورات",

      },

      sectionTitles: {

        overview: "نظرة عامة",

        claims: "إدارة المطالبات",

        verifications: "توثيق المستخدمين",

        users: "إدارة المستخدمين",

        posts: "إدارة المنشورات",

        contact_messages: "رسائل التواصل",

        user_reports: "بلاغات المستخدمين",

        chats: "المحادثات",

        sighting_reports: "بلاغات المشاهدة",

      },

      sectionSubtitles: {

        overview: "لمحة سريعة عن النشاط على المنصة.",

        claims: "مراجعة طلبات الانضمام للعائلة وإصدار القرارات.",

        verifications: "مراجعة وثائق الهوية واعتماد الحسابات الجديدة.",

        users: "إدارة المستخدمين، الحظر، والصلاحيات.",

        posts: "مراجعة جميع البلاغات وحذف المنشورات غير المناسبة.",

        contact_messages: "قراءة الرسائل والرد عليها عبر البريد الإلكتروني.",

        user_reports: "مراجعة بلاغات المستخدمين واتخاذ الإجراءات اللازمة.",

        chats: "مراجعة وتوثيق المحادثات بين المستخدمين.",

        sighting_reports: "مراجعة جميع بلاغات المشاهدة وتفاصيلها.",

      },

      stats: {

        totalUsers: "إجمالي المستخدمين",

        totalPosts: "إجمالي المنشورات",

        activeMissing: "مفقودون نشطًا",

        foundPosts: "تم العثور عليهم",

        resolvedPosts: "حالات محلولة",

        pendingClaims: "مطالبات معلقة",

        pendingVerifications: "حسابات بانتظار التوثيق",

      },

      users: {

        title: "المستخدمون",

        name: "الاسم",

        email: "البريد الإلكتروني",

        role: "الدور",

        status: "الحالة",

        joined: "تاريخ الانضمام",

        actions: "الإجراءات",

        active: "نشط",

        banned: "محظور",

        unbanned: "تم إلغاء الحظر",

        ban: "حظر",

        unban: "إلغاء الحظر",

        search: "بحث",

        searchPlaceholder: "ابحث بالاسم...",

        empty: "لا يوجد مستخدمون.",

      },

      claims: {

        tabPending: "قيد المراجعة",

        tabProcessed: "تمت المعالجة",

        review: "مراجعة",

        reviewTitle: "مراجعة المطالبة",

        approve: "موافقة",

        reject: "رفض",

        approved: "تمت الموافقة على المطالبة",

        rejected: "تم رفض المطالبة",

        cancel: "إلغاء",

        notes: "الملاحظات",

        notesPlaceholder: "أدخل ملاحظاتك (اختياري)...",

        relationship: "صلة القرابة / المعلومات",

        claimant: "مقدم الطلب",

        post: "المنشور",

        viewDocument: "عرض المستند",

        unknownClaimant: "مستخدم غير معروف",

        unknownPost: "منشور غير معروف",

        empty: "لا توجد مطالبات معلقة.",

        processedEmpty: "لا توجد مطالبات تطابق هذا الفلتر.",

        claimFor: "مطالبة بشأن {name}",

        submittedOn: "قُدّمت في",

        claimerInfo: "بيانات مقدم الطلب",

        description: "وصف المطالبة",

        filters: {

          all: "الكل",

          pending: "قيد المراجعة",

          approved: "تمت الموافقة",

          rejected: "مرفوض",

        },

      },

      verifications: {

        title: "حسابات بانتظار التوثيق",

        searchPlaceholder: "ابحث بالاسم أو البريد...",

        empty: "لا توجد حسابات بانتظار التوثيق حالياً.",

        review: "مراجعة",

        reviewTitle: "مراجعة طلب التوثيق",

        approve: "اعتماد الحساب",

        reject: "رفض",

        approved: "تم اعتماد الحساب وإرسال بريد للمستخدم",

        rejected: "تم رفض الطلب وإرسال بريد للمستخدم",

        fullName: "الاسم الكامل",

        email: "البريد الإلكتروني",

        phone: "الهاتف",

        birthDate: "تاريخ الميلاد",

        gender: "النوع",

        registered: "تاريخ التسجيل",

        noId: "لم يقم المستخدم برفع وثيقة هوية.",

        rejectionReason: "سبب الرفض (اختياري)",

        rejectionReasonPlaceholder:

          "مثال: الصورة غير واضحة، يرجى إعادة التسجيل بصورة أوضح.",

      },

      posts: {

        title: "جميع المنشورات",

        searchPlaceholder: "ابحث بالاسم...",

        empty: "لا توجد منشورات تطابق المعايير.",

        delete: "حذف",

        deleted: "تم حذف المنشور",

        deleteConfirm: 'هل أنت متأكد من حذف منشور "{name}"؟',

        by: "بواسطة",

        filters: { all: "الكل", missing: "مفقودون", found: "تم العثور عليهم" },

      },

      drawer: {

        title: "لوحة الإدارة",

        subtitle: "انتقل بين الأقسام",

        action: "أقسام الإدارة",

      },

      errors: {

        stats: "فشل تحميل الإحصائيات.",

        users: "فشل تحميل المستخدمين.",

        claims: "فشل تحميل المطالبات.",

        verifications: "فشل تحميل قائمة التوثيق.",

        posts: "فشل تحميل المنشورات.",

        cantBanAdmin: "لا يمكن حظر مسؤول.",

        banFailed: "فشل تحديث حالة الحظر.",

        reviewFailed: "فشل إرسال المراجعة.",

        verifyFailed: "فشل تنفيذ المراجعة.",

        deleteFailed: "فشل حذف المنشور.",

      },

    };

  }

  return {

    brand: { title: "Admin Panel", subtitle: "Manage platform" },

    tabs: {

      overview: "Overview",

      claims: "Claims Management",

      verifications: "User Verifications",

      users: "User Management",

      posts: "Posts Management",

    },

    sectionTitles: {

      overview: "Overview",

      claims: "Claims Management",

      verifications: "User Verifications",

      users: "User Management",

      posts: "Posts Management",

      contact_messages: "Contact Messages",

      user_reports: "User Reports",

      chats: "Chats",

      sighting_reports: "Sighting Reports",

    },

    sectionSubtitles: {

      overview: "A quick snapshot of platform activity.",

      claims: "Review and process family reunion claims.",

      verifications: "Review submitted ID documents and approve new accounts.",

      users: "Manage users, bans, and roles.",

      posts: "Review every report and remove inappropriate posts.",

      contact_messages: "Read and reply to support messages via email.",

      user_reports: "Review user reports and take necessary actions.",

      chats: "Review and moderate chat conversations.",

      sighting_reports: "Review all sighting reports and their details.",

    },

    stats: {

      totalUsers: "Total users",

      totalPosts: "Total posts",

      activeMissing: "Active missing",

      foundPosts: "Found posts",

      resolvedPosts: "Resolved cases",

      pendingClaims: "Pending claims",

      pendingVerifications: "Pending verifications",

    },

    users: {

      title: "Users",

      name: "Name",

      email: "Email",

      role: "Role",

      status: "Status",

      joined: "Joined",

      actions: "Actions",

      active: "Active",

      banned: "Banned",

      unbanned: "User unbanned",

      ban: "Ban",

      unban: "Unban",

      search: "Search",

      searchPlaceholder: "Search by name...",

      empty: "No users found.",

    },

    claims: {

      tabPending: "Pending",

      tabProcessed: "Processed",

      review: "Review",

      reviewTitle: "Review claim",

      approve: "Approve",

      reject: "Reject",

      approved: "Claim approved",

      rejected: "Claim rejected",

      cancel: "Cancel",

      notes: "Notes",

      notesPlaceholder: "Optional notes for this decision...",

      relationship: "Relationship / details",

      claimant: "Claimant",

      post: "Post",

      viewDocument: "View document",

      unknownClaimant: "Unknown user",

      unknownPost: "Unknown post",

      empty: "There are no pending claims right now.",

      processedEmpty: "No claims match this filter.",

      claimFor: "Claim for {name}",

      submittedOn: "Submitted on",

      claimerInfo: "Claimer Information",

      description: "Claim Description",

      filters: {

        all: "All",

        pending: "Pending",

        approved: "Approved",

        rejected: "Rejected",

      },

    },

    verifications: {

      title: "Awaiting verification",

      searchPlaceholder: "Search by name or email...",

      empty: "No accounts are waiting for verification right now.",

      review: "Review",

      reviewTitle: "Review verification request",

      approve: "Approve account",

      reject: "Reject",

      approved: "Account verified, confirmation email sent.",

      rejected: "Verification rejected, explanation email sent.",

      fullName: "Full name",

      email: "Email",

      phone: "Phone",

      birthDate: "Birth Date",

      gender: "Gender",

      registered: "Registered",

      noId: "This user didn't upload an ID document.",

      rejectionReason: "Reason for rejection (optional)",

      rejectionReasonPlaceholder:

        "e.g. The ID photo is too blurry, please re-register with a clearer image.",

    },

    posts: {

      title: "All posts",

      searchPlaceholder: "Search by name...",

      empty: "No posts match these filters.",

      delete: "Delete",

      deleted: "Post deleted",

      deleteConfirm: 'Are you sure you want to delete the post for "{name}"?',

      by: "by",

      filters: { all: "All", missing: "Missing", found: "Found" },

    },

    drawer: {

      title: "Admin Panel",

      subtitle: "Jump between sections",

      action: "Admin Sections",

    },

    errors: {

      stats: "Failed to load stats.",

      users: "Failed to load users.",

      claims: "Failed to load claims.",

      verifications: "Failed to load verification queue.",

      posts: "Failed to load posts.",

      cantBanAdmin: "You cannot ban another admin.",

      banFailed: "Failed to update ban status.",

      reviewFailed: "Failed to submit review.",

      verifyFailed: "Failed to submit verification decision.",

      deleteFailed: "Failed to delete post.",

    },

  };

}



function parseReportMessage(message: string) {

  const lines = message.split("\n").map((l) => l.trim()).filter(Boolean);

  const fields: Record<string, string> = {};

  for (const line of lines) {

    const idx = line.indexOf(":");

    if (idx > 0) {

      fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();

    }

  }

  return fields;

}



// ─── Admin Chats Panel ────────────────────────────────────────────────────────

function AdminChatsPanel({

  isRTL,

  initialChatId,

}: {

  isRTL: boolean;

  initialChatId?: string;

}) {

  const { token } = useAuth();

  const [chatIdInput, setChatIdInput] = useState(initialChatId || "");

  const [chatDetails, setChatDetails] = useState<BackendChat | null>(null);

  const [messages, setMessages] = useState<BackendMessage[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [activeChats, setActiveChats] = useState<BackendChat[]>([]);

  const [activeChatsLoading, setActiveChatsLoading] = useState(false);

  const [activeChatsError, setActiveChatsError] = useState<string | null>(null);

  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);

  const [expandedChatMessages, setExpandedChatMessages] =

    useState<BackendMessage[]>([]);

  const [expandedChatLoading, setExpandedChatLoading] = useState(false);

  const [expandedChatError, setExpandedChatError] = useState<string | null>(null);



  const normalizeChatId = (value: string) => {

    const cleaned = value.trim().replace(/^chat:/i, "");

    const match = cleaned.match(/[a-f0-9]{24}/i);

    return match ? match[0] : cleaned;

  };



  const normalizeChatUser = (

    value: BackendChat["initiatorUserId"],

  ): BackendChatUser | null => {

    if (!value) return null;

    return typeof value === "object" ? value : { _id: value, name: "" };

  };



  const getChatUserId = (value: BackendChat["initiatorUserId"]) => {

    if (!value) return null;

    return typeof value === "object" ? value._id : value;

  };



  const getChatUserLabel = (

    user: BackendChatUser | null,

    fallback: string,

  ) => {

    if (user?.name) return user.name;

    if (user?._id) return `${fallback} ${user._id.slice(-6)}`;

    return fallback;

  };



  const getChatErrorMessage = (err: unknown) => {

    if (err instanceof ApiError) {

      if (err.status === 404) {

        return isRTL

          ? "لم يتم العثور على المحادثة. تأكد من معرف المحادثة الصحيح."

          : "Chat not found. Make sure the Chat ID is correct.";

      }

      if (err.status === 400) {

        return isRTL

          ? "معرف المحادثة غير صالح."

          : "Invalid Chat ID.";

      }

      if (err.status === 403) {

        return isRTL

          ? "لا تملك صلاحية عرض هذه المحادثة."

          : "You don't have access to this chat.";

      }

      return err.message;

    }

    if (err instanceof Error) return err.message;

    return isRTL ? "تعذر تحميل المحادثة." : "Failed to load chat.";

  };



  const fetchChat = async (id: string) => {

    const normalizedId = normalizeChatId(id);

    if (!normalizedId || !token) return;

    setLoading(true);

    setError(null);

    try {

      setChatIdInput(normalizedId);

      const chatRes = await adminApi.getChatDetails(normalizedId, token);

      setChatDetails(chatRes.chat);

      const messagesRes = await adminApi.getChatMessages(normalizedId, token, {

        limit: 50,

      });

      setMessages(messagesRes.messages);

    } catch (err: any) {

      setError(getChatErrorMessage(err));

      setChatDetails(null);

      setMessages([]);

    } finally {

      setLoading(false);

    }

  };



  const fetchActiveChats = async () => {

    if (!token) return;

    setActiveChatsLoading(true);

    setActiveChatsError(null);

    try {

      const res = await adminApi.getAdminChats(token, {

        status: "active",

        limit: 20,

      });

      setActiveChats(res.chats);

    } catch (err) {

      setActiveChatsError(getChatErrorMessage(err));

      setActiveChats([]);

    } finally {

      setActiveChatsLoading(false);

    }

  };



  const toggleChat = async (id: string) => {

    if (!token) return;

    if (expandedChatId === id) {

      setExpandedChatId(null);

      setExpandedChatMessages([]);

      setExpandedChatError(null);

      return;

    }

    setExpandedChatId(id);

    setExpandedChatMessages([]);

    setExpandedChatLoading(true);

    setExpandedChatError(null);

    try {

      const messagesRes = await adminApi.getChatMessages(id, token, {

        limit: 50,

      });

      setExpandedChatMessages(messagesRes.messages);

    } catch (err) {

      setExpandedChatError(getChatErrorMessage(err));

      setExpandedChatMessages([]);

    } finally {

      setExpandedChatLoading(false);

    }

  };



  useEffect(() => {

    if (initialChatId) {

      const normalizedId = normalizeChatId(initialChatId);

      setChatIdInput(normalizedId);

      fetchChat(normalizedId);

    }

  }, [initialChatId]);



  useEffect(() => {

    if (!token) return;

    void fetchActiveChats();

  }, [token]);



  return (

    <div className="space-y-6">

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

        <h2 className="text-xl font-bold text-tertiary mb-4 text-start">

          {isRTL ? "مراجعة المحادثات" : "Chat Moderation Viewer"}

        </h2>

        <div className="flex gap-4">

          <input

            type="text"

            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-secondary outline-none"

            placeholder={isRTL ? "أدخل Chat ID..." : "Enter Chat ID..."}

            value={chatIdInput}

            onChange={(e) => setChatIdInput(e.target.value)}

            onKeyDown={(e) => e.key === "Enter" && fetchChat(chatIdInput)}

          />

          <button

            onClick={() => fetchChat(chatIdInput)}

            disabled={loading || !chatIdInput.trim()}

            className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

          >

            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isRTL ? "بحث" : "Load"}

          </button>

        </div>

        {error && <p className="text-red-500 text-sm mt-3 text-start">{error}</p>}

      </div>



      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">

          <div className="flex items-center justify-between">

            <h3 className="text-base font-bold text-tertiary text-start">

              {isRTL ? "المحادثات النشطة" : "Active chats"}

            </h3>

            <button

              type="button"

              onClick={() => void fetchActiveChats()}

              disabled={activeChatsLoading}

              className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

            >

              {isRTL ? "تحديث" : "Refresh"}

            </button>

          </div>

          <p className="mt-1 text-xs text-slate-500 text-start">

            {isRTL

              ? "انقر على السهم لعرض الرسائل وإخفائها."

              : "Click the arrow to expand a chat and view messages."}

          </p>

        </div>



        {activeChatsLoading ? (

          <div className="p-8 flex items-center justify-center">

            <Loader2 className="h-6 w-6 text-secondary animate-spin" />

          </div>

        ) : activeChatsError ? (

          <div className="p-6 text-sm text-red-500 text-start">

            {activeChatsError}

          </div>

        ) : activeChats.length === 0 ? (

          <div className="p-8 text-center text-slate-500">

            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-2" />

            {isRTL

              ? "لا توجد محادثات نشطة حالياً."

              : "No active chats right now."}

          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {activeChats.map((chat) => {

              const initiator = normalizeChatUser(chat.initiatorUserId);

              const responder = normalizeChatUser(chat.responderUserId);

              const initiatorId = getChatUserId(chat.initiatorUserId) || "";

              const isExpanded = expandedChatId === chat._id;

              const ArrowIcon = isExpanded

                ? ChevronDown

                : isRTL

                  ? ChevronLeft

                  : ChevronRight;



              return (

                <div key={chat._id} className="p-4 sm:p-5">

                  <div className="flex flex-col gap-4">

                    <div className="flex items-start gap-3">

                      <button

                        type="button"

                        onClick={() => void toggleChat(chat._id)}

                        aria-expanded={isExpanded}

                        aria-controls={`chat-${chat._id}`}

                        className="mt-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer"

                      >

                        <ArrowIcon className="h-4 w-4 sm:h-5 sm:w-5" />

                      </button>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 text-start">

                        <div>

                          <div className="flex items-center justify-between sm:block">

                            <span className="text-[11px] uppercase font-bold text-slate-400">

                              {isRTL ? "المبادر" : "Initiator"}

                            </span>

                            <span

                              className="inline-flex sm:hidden items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold font-mono border border-slate-200"

                              title={chat._id}

                            >

                              {chat._id.slice(-6)}

                            </span>

                          </div>

                          <p className="text-sm font-bold text-tertiary">

                            {getChatUserLabel(initiator, isRTL ? "مستخدم" : "User")}

                          </p>

                          <p className="text-xs text-slate-500">

                            {initiator?.email || ""}

                          </p>

                        </div>

                        <div>

                          <span className="text-[11px] uppercase font-bold text-slate-400">

                            {isRTL ? "المستجيب" : "Responder"}

                          </span>

                          <p className="text-sm font-bold text-tertiary">

                            {getChatUserLabel(responder, isRTL ? "مستخدم" : "User")}

                          </p>

                          <p className="text-xs text-slate-500">

                            {responder?.email || ""}

                          </p>

                        </div>

                        <div className="hidden sm:block sm:text-end">

                          <span className="text-[11px] uppercase font-bold text-slate-400">

                            {isRTL ? "المعرف" : "ID"}

                          </span>

                          <div className="mt-1">

                            <span

                              className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold font-mono"

                              title={chat._id}

                            >

                              {chat._id.slice(-6)}

                            </span>

                          </div>

                        </div>

                      </div>

                    </div>



                    {isExpanded && (

                      <div

                        id={`chat-${chat._id}`}

                        className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden"

                      >

                        {expandedChatLoading ? (

                          <div className="p-6 flex items-center justify-center">

                            <Loader2 className="h-6 w-6 text-secondary animate-spin" />

                          </div>

                        ) : expandedChatError ? (

                          <div className="p-6 text-sm text-red-500 text-start">

                            {expandedChatError}

                          </div>

                        ) : (

                          <div className="max-h-105 overflow-y-auto p-4 space-y-4">

                            {expandedChatMessages.length === 0 ? (

                              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">

                                <MessageSquare className="h-10 w-10 mb-2 opacity-20" />

                                <p>{isRTL ? "لا توجد رسائل" : "No messages found"}</p>

                              </div>

                            ) : (

                              expandedChatMessages.map((m) => {

                                const senderId =

                                  typeof m.senderUserId === "object"

                                    ? m.senderUserId._id

                                    : m.senderUserId;

                                const senderName =

                                  typeof m.senderUserId === "object"

                                    ? m.senderUserId.name

                                    : "Unknown";

                                const isInitiator = senderId === initiatorId;

                                return (

                                  <div

                                    key={m._id}

                                    className={`flex flex-col ${

                                      isInitiator ? "items-end" : "items-start"

                                    }`}

                                  >

                                    <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">

                                      {senderName}

                                    </span>

                                    <div

                                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${

                                        isInitiator

                                          ? "bg-secondary text-white rounded-tr-sm"

                                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"

                                      }`}

                                    >

                                      {m.content && (

                                        <p className="text-sm wrap-break-word whitespace-pre-wrap">

                                          {m.content}

                                        </p>

                                      )}

                                      {m.attachmentPath && (

                                        <img

                                          src={m.attachmentPath}

                                          alt="attachment"

                                          className="max-w-full rounded-lg mt-2 max-h-48 object-cover"

                                        />

                                      )}

                                    </div>

                                    <span className="text-[10px] text-slate-400 mt-1 px-1">

                                      {new Date(m.createdAt).toLocaleTimeString()}

                                    </span>

                                  </div>

                                );

                              })

                            )}

                          </div>

                        )}

                      </div>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>



      {chatDetails &&

        (() => {

          const initiator = normalizeChatUser(chatDetails.initiatorUserId);

          const responder = normalizeChatUser(chatDetails.responderUserId);

          const initiatorId = getChatUserId(chatDetails.initiatorUserId) || "";



          return (

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-150 overflow-hidden">

              <div className="px-6 py-4 border-b border-slate-100 bg-white">

                <div className="flex flex-col gap-4">

                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">

                      {isRTL ? "المحادثة المحمّلة" : "Loaded chat"}

                    </span>

                    <div className="flex items-center gap-3">

                      <button

                        type="button"

                        onClick={() => {

                          setChatDetails(null);

                          setMessages([]);

                          setError(null);

                        }}

                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"

                        aria-label={isRTL ? "إخفاء المحادثة المحمّلة" : "Hide loaded chat"}

                      >

                        {isRTL ? "إخفاء" : "Hide"}

                        <X className="h-3.5 w-3.5" />

                      </button>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-start">

                    <div>

                      <span className="text-[11px] uppercase font-bold text-slate-400">

                        {isRTL ? "المبادر" : "Initiator"}

                      </span>

                      <p className="text-sm font-bold text-tertiary">

                        {getChatUserLabel(initiator, isRTL ? "مستخدم" : "User")}

                      </p>

                      <p className="text-xs text-slate-500">

                        {initiator?.email || ""}

                      </p>

                    </div>

                    <div>

                      <span className="text-[11px] uppercase font-bold text-slate-400">

                        {isRTL ? "المستجيب" : "Responder"}

                      </span>

                      <p className="text-sm font-bold text-tertiary">

                        {getChatUserLabel(responder, isRTL ? "مستخدم" : "User")}

                      </p>

                      <p className="text-xs text-slate-500">

                        {responder?.email || ""}

                      </p>

                    </div>

                    <div className="sm:text-end">

                      <span className="text-[11px] uppercase font-bold text-slate-400">

                        {isRTL ? "المعرف" : "ID"}

                      </span>

                      <div className="mt-1">

                        <span

                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold font-mono"

                          title={chatDetails._id}

                        >

                          {chatDetails._id.slice(-6)}

                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">

                {messages.length === 0 ? (

                  <div className="h-full flex flex-col items-center justify-center text-slate-400">

                    <MessageSquare className="h-12 w-12 mb-3 opacity-20" />

                    <p>{isRTL ? "لا توجد رسائل" : "No messages found"}</p>

                  </div>

                ) : (

                  messages.map((m) => {

                    const senderId =

                      typeof m.senderUserId === "object"

                        ? m.senderUserId._id

                        : m.senderUserId;

                    const senderName =

                      typeof m.senderUserId === "object"

                        ? m.senderUserId.name

                        : "Unknown";

                    const isInitiator = senderId === initiatorId;

                    return (

                      <div

                        key={m._id}

                        className={`flex flex-col ${

                          isInitiator ? "items-end" : "items-start"

                        }`}

                      >

                        <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">

                          {senderName}

                        </span>

                        <div

                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${

                            isInitiator

                              ? "bg-secondary text-white rounded-tr-sm"

                              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"

                          }`}

                        >

                          {m.content && (

                            <p className="text-sm wrap-break-word whitespace-pre-wrap">

                              {m.content}

                            </p>

                          )}

                          {m.attachmentPath && (

                            <img

                              src={m.attachmentPath}

                              alt="attachment"

                              className="max-w-full rounded-lg mt-2 max-h-48 object-cover"

                            />

                          )}

                        </div>

                        <span className="text-[10px] text-slate-400 mt-1 px-1">

                          {new Date(m.createdAt).toLocaleTimeString()}

                        </span>

                      </div>

                    );

                  })

                )}

              </div>

            </div>

          );

        })()}

    </div>

  );

}



// ─── User Reports Panel ───────────────────────────────────────────────────────

function UserReportsPanel({

  t,

  isRTL,

  onReplied,

  onViewChat,

}: {

  t: Copy;

  isRTL: boolean;

  onReplied?: () => void;

  onViewChat: (chatId: string) => void;

}) {

  const { token } = useAuth();

  const [messages, setMessages] = useState<BackendContactMessage[]>([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [replyingTo, setReplyingTo] = useState<BackendContactMessage | null>(

    null,

  );

  const [replyMessage, setReplyMessage] = useState("");

  const [replyLoading, setReplyLoading] = useState(false);



  const fetchReports = async (p: number) => {

    if (!token) return;

    try {

      setLoading(true);

      const res = await adminApi.getContactMessages(token, {

        page: p,

        limit: 10,

        type: "report",

      });

      setMessages(res.messages);

      setTotalPages(res.totalPages || 1);

    } catch (err) {

      console.error("Failed to fetch reports", err);

      toast.error(isRTL ? "فشل جلب البلاغات" : "Failed to load reports");

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    void fetchReports(page);

  }, [token, page]);



  const handleReply = async () => {

    if (!token || !replyingTo || !replyMessage.trim()) return;

    try {

      setReplyLoading(true);

      await adminApi.replyToContactMessage(replyingTo._id, replyMessage, token);

      toast.success(isRTL ? "تم إرسال الرد بنجاح" : "Reply sent successfully");

      setReplyingTo(null);

      setReplyMessage("");

      void fetchReports(page);

      if (onReplied) onReplied();

    } catch (err) {

      console.error("Failed to send reply", err);

      toast.error(isRTL ? "فشل إرسال الرد" : "Failed to send reply");

    } finally {

      setReplyLoading(false);

    }

  };



  return (

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">

      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

        <h2 className="text-tertiary font-bold text-start">

          {t.sectionTitles.user_reports}

        </h2>

      </div>



      {loading ? (

        <div className="p-12 flex items-center justify-center">

          <Loader2 className="h-6 w-6 text-secondary animate-spin" />

        </div>

      ) : messages.length === 0 ? (

        <div className="p-12 text-center text-slate-500">

          <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-3" />

          {isRTL ? "لا توجد بلاغات حالياً." : "No reports found."}

        </div>

      ) : (

        <ul className="divide-y divide-slate-100">

          {messages.map((msg) => (

            <li

              key={msg._id}

              className="p-4 sm:px-5 sm:py-4 hover:bg-slate-50/50 transition-colors"

            >

              <div className="flex flex-col gap-2 w-full text-start">

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <div className="flex items-center gap-2 flex-wrap mb-1">

                      <p className="font-bold text-tertiary truncate">

                        {msg.subject}

                      </p>

                      {msg.isReplied && (

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold whitespace-nowrap">

                          <CheckCircle2 className="w-3 h-3" />

                          {isRTL ? "تم الرد" : "Replied"}

                        </span>

                      )}

                    </div>

                    <p className="text-sm text-slate-500 truncate">

                      {msg.name} ({msg.email})

                    </p>

                    <p className="text-[11px] text-slate-400 mt-1">

                      {new Date(msg.createdAt).toLocaleDateString(

                        isRTL ? "ar-EG" : "en-US",

                        {

                          year: "numeric",

                          month: "short",

                          day: "numeric",

                          hour: "2-digit",

                          minute: "2-digit",

                        },

                      )}

                    </p>

                  </div>

                  {(() => {

                    const parsed = parseReportMessage(msg.message);

                    return (

                      <div className="flex items-center gap-2 shrink-0">

                        {parsed["Chat ID"] && (

                          <button

                            onClick={() => {

                              const rawId = String(parsed["Chat ID"]);

                              const match = rawId.match(/[a-f0-9]{24}/i);

                              if (match) {

                                onViewChat(match[0]);

                              } else {

                                toast.error(

                                  isRTL

                                    ? "معرف المحادثة غير صالح"

                                    : "Invalid chat id",

                                );

                              }

                            }}

                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"

                          >

                            <MessageSquare className="h-3.5 w-3.5" />

                            {isRTL ? "عرض المحادثة" : "View Chat"}

                          </button>

                        )}

                        <button

                          onClick={() => {

                            setReplyingTo(msg);

                            setReplyMessage("");

                          }}

                          disabled={msg.isReplied}

                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${

                            msg.isReplied

                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"

                              : "bg-secondary text-white hover:bg-secondary/90"

                          }`}

                        >

                          <Mail className="h-3.5 w-3.5" />

                          {isRTL ? "رد" : "Reply"}

                        </button>

                      </div>

                    );

                  })()}

                </div>

                <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-700 space-y-2">

                  {(() => {

                    const parsed = parseReportMessage(msg.message);

                    const rows = [

                      ["Reported User", parsed["Reported User"]],

                      ["Reported By", parsed["Reported By"]],

                      ["Reason", parsed["Reason"]],

                      ["Sub-reasons", parsed["Sub-reasons"]],

                      ["Chat ID", parsed["Chat ID"]],

                    ].filter(([, v]) => v);

                    if (rows.length === 0) {

                      return (

                        <p className="whitespace-pre-wrap">{msg.message}</p>

                      );

                    }

                    return rows.map(([label, value]) => (

                      <div key={label} className="flex flex-col sm:flex-row sm:gap-2">

                        <span className="font-bold text-slate-500 shrink-0 min-w-28">

                          {label}:

                        </span>

                        <span className="text-slate-800 break-all">{value}</span>

                      </div>

                    ));

                  })()}

                </div>

              </div>

            </li>

          ))}

        </ul>

      )}



      <Pagination

        page={page}

        totalPages={totalPages}

        onChange={setPage}

        isRTL={isRTL}

      />



      <AnimatePresence>

        {replyingTo && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            className="fixed inset-0 z-70 bg-slate-950/40 flex items-center justify-center p-4"

            onClick={() => setReplyingTo(null)}

          >

            <motion.div

              initial={{ scale: 0.95, opacity: 0 }}

              animate={{ scale: 1, opacity: 1 }}

              exit={{ scale: 0.95, opacity: 0 }}

              onClick={(e) => e.stopPropagation()}

              dir={isRTL ? "rtl" : "ltr"}

              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden text-start"

            >

              <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">

                <div>

                  <h3 className="text-lg font-bold text-tertiary">

                    {isRTL ? "الرد على البلاغ" : "Reply to Report"}

                  </h3>

                  <p className="text-sm text-slate-500 mt-1">

                    {isRTL ? "إلى:" : "To:"} {replyingTo.name} (

                    {replyingTo.email})

                  </p>

                </div>

                <button

                  onClick={() => setReplyingTo(null)}

                  className="h-8 w-8 rounded-full bg-slate-200/60 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"

                >

                  <X className="h-4 w-4" />

                </button>

              </div>

              <div className="px-6 py-5 space-y-4">

                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">

                  <p className="text-[11px] uppercase font-semibold text-slate-400 mb-1">

                    {isRTL ? "البلاغ الأصلي" : "Original Report"}

                  </p>

                  <p className="text-sm text-slate-700 whitespace-pre-wrap">

                    {replyingTo.message}

                  </p>

                </div>

                <div>

                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">

                    {isRTL ? "نص الرد" : "Reply Text"}

                  </label>

                  <textarea

                    value={replyMessage}

                    onChange={(e) => setReplyMessage(e.target.value)}

                    placeholder={

                      isRTL

                        ? "اكتب ردك هنا (سيتم إرساله كبريد إلكتروني)..."

                        : "Write your reply here (will be sent as email)..."

                    }

                    rows={5}

                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-secondary outline-none resize-none text-slate-700"

                  />

                </div>

              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-end">

                <button

                  onClick={() => setReplyingTo(null)}

                  disabled={replyLoading}

                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"

                >

                  {isRTL ? "إلغاء" : "Cancel"}

                </button>

                <button

                  onClick={handleReply}

                  disabled={replyLoading || !replyMessage.trim()}

                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-secondary/90 transition-colors cursor-pointer disabled:opacity-50"

                >

                  {replyLoading ? (

                    <Loader2 className="h-4 w-4 animate-spin" />

                  ) : (

                    <Mail className="h-4 w-4" />

                  )}

                  {isRTL ? "إرسال" : "Send Reply"}

                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

}



// ─── Sighting Reports Panel ───────────────────────────────────────────────────

function SightingReportsPanel({

  reports,

  loading,

  page,

  totalPages,

  onPageChange,

  isRTL,

}: {

  reports: BackendSighting[];

  loading: boolean;

  page: number;

  totalPages: number;

  onPageChange: (p: number) => void;

  isRTL: boolean;

}) {

  if (loading) {

    return (

      <div className="bg-white p-12 rounded-2xl border border-slate-200 flex items-center justify-center">

        <Loader2 className="h-6 w-6 text-secondary animate-spin" />

      </div>

    );

  }



  if (!reports.length) {

    return (

      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">

        {isRTL ? "لا توجد بلاغات مشاهدة" : "No sighting reports found"}

      </div>

    );

  }



  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">

      <div className="overflow-x-auto">

        <table className="w-full text-sm text-left">

          <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">

            <tr>

              <th className={`px-4 py-3 font-semibold ${isRTL ? "text-right" : "text-left"}`}>

                {isRTL ? "الشخص المفقود" : "Missing Person"}

              </th>

              <th className={`px-4 py-3 font-semibold ${isRTL ? "text-right" : "text-left"}`}>

                {isRTL ? "المُبلّغ" : "Reporter"}

              </th>

              <th className={`px-4 py-3 font-semibold ${isRTL ? "text-right" : "text-left"}`}>

                {isRTL ? "الثقة" : "Confidence"}

              </th>

              <th className={`px-4 py-3 font-semibold ${isRTL ? "text-right" : "text-left"}`}>

                {isRTL ? "تاريخ الرؤية" : "Seen At"}

              </th>

              <th className={`px-4 py-3 font-semibold ${isRTL ? "text-right" : "text-left"}`}>

                {isRTL ? "التفاصيل" : "Details"}

              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {reports.map((report) => (

              <tr key={report._id} className="hover:bg-slate-50 transition-colors">

                <td className="px-4 py-3 align-top max-w-[200px]">

                  <p className="font-bold text-slate-800 truncate">

                    {typeof report.missingPersonId === 'object' && report.missingPersonId?.name 

                      ? report.missingPersonId.name 

                      : (isRTL ? "غير معروف" : "Unknown")}

                  </p>

                </td>

                <td className="px-4 py-3 align-top">

                  <div className="flex items-center gap-2">

                    <div className="flex-1 min-w-0">

                      <p className="font-bold text-slate-800 truncate">

                        {report.reporterName || (isRTL ? "مجهول" : "Anonymous")}

                      </p>

                      <p className="text-xs text-slate-500 truncate">{report.reporterPhone}</p>

                    </div>

                  </div>

                </td>

                <td className="px-4 py-3 align-top">

                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">

                    {report.confidence.replace("_", " ").toUpperCase()}

                  </span>

                </td>

                <td className="px-4 py-3 align-top text-slate-600 text-xs">

                  {report.seenAt}

                </td>

                <td className="px-4 py-3 align-top max-w-[300px]">

                  <p className="text-xs text-slate-700 line-clamp-2">

                    {report.description}

                  </p>

                  {report.location?.address && (

                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">

                      {report.location.address}

                    </p>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>



      {totalPages > 1 && (

        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 mt-auto">

          <button

            onClick={() => onPageChange(page - 1)}

            disabled={page === 1}

            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-transparent"

          >

            {isRTL ? "السابق" : "Prev"}

          </button>

          <span className="text-sm font-medium text-slate-500">

            {page} / {totalPages}

          </span>

          <button

            onClick={() => onPageChange(page + 1)}

            disabled={page === totalPages}

            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-transparent"

          >

            {isRTL ? "التالي" : "Next"}

          </button>

        </div>

      )}

    </div>

  );

}

