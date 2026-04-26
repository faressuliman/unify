import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  adminApi,
  type AdminUser,
  type BackendClaim,
  type BackendPost,
  type DashboardStats,
} from '../lib/api';
import PageHeader from '../components/ui/PageHeader';

type Tab = 'overview' | 'users' | 'claims' | 'all-claims';
type ClaimStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const PAGE_LIMIT = 10;

export default function Admin() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const tCopy = useMemo(() => getCopy(isRTL), [isRTL]);

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Stats state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

  // Claims state
  const [claims, setClaims] = useState<BackendClaim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimPage, setClaimPage] = useState(1);
  const [claimTotalPages, setClaimTotalPages] = useState(1);
  const [reviewingClaim, setReviewingClaim] = useState<BackendClaim | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState<'approved' | 'rejected' | null>(null);

  // All-claims state
  const [allClaims, setAllClaims] = useState<BackendClaim[]>([]);
  const [allClaimsLoading, setAllClaimsLoading] = useState(false);
  const [allClaimsPage, setAllClaimsPage] = useState(1);
  const [allClaimsTotalPages, setAllClaimsTotalPages] = useState(1);
  const [allClaimsStatus, setAllClaimsStatus] = useState<ClaimStatusFilter>('all');

  useEffect(() => {
    if (!token) return;
    void fetchStats();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (activeTab === 'users') void fetchUsers(userPage, userSearch);
    if (activeTab === 'claims') void fetchPendingClaims(claimPage);
    if (activeTab === 'all-claims') void fetchAllClaims(allClaimsPage, allClaimsStatus);
  }, [activeTab, userPage, claimPage, allClaimsPage, allClaimsStatus, userSearch, token]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      setStatsLoading(true);
      const res = await adminApi.getDashboardStats(token);
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
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
      console.error('Failed to fetch users', err);
      toast.error(tCopy.errors.users);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPendingClaims = async (page: number) => {
    if (!token) return;
    try {
      setClaimsLoading(true);
      const res = await adminApi.getPendingClaims(token, { page, limit: PAGE_LIMIT });
      setClaims(res.claims);
      setClaimTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch pending claims', err);
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
      console.error('Failed to fetch all claims', err);
      toast.error(tCopy.errors.claims);
    } finally {
      setAllClaimsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserPage(1);
    setUserSearch(userSearchInput.trim());
  };

  const handleToggleBan = async (user: AdminUser) => {
    if (!token) return;
    if (user.role === 'admin') {
      toast.error(tCopy.errors.cantBanAdmin);
      return;
    }
    try {
      setBanningUserId(user._id);
      const res = await adminApi.toggleBanUser(user._id, token);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isbanned: res.isbanned } : u))
      );
      toast.success(res.isbanned ? tCopy.users.banned : tCopy.users.unbanned);
    } catch (err) {
      console.error('Failed to toggle ban', err);
      const e = err as Error;
      toast.error(e.message || tCopy.errors.banFailed);
    } finally {
      setBanningUserId(null);
    }
  };

  const handleReviewClaim = async (decision: 'approved' | 'rejected') => {
    if (!token || !reviewingClaim) return;
    try {
      setSubmittingReview(decision);
      await adminApi.adminReviewClaim(reviewingClaim._id, decision, reviewNotes.trim() || undefined, token);
      toast.success(decision === 'approved' ? tCopy.claims.approved : tCopy.claims.rejected);
      setReviewingClaim(null);
      setReviewNotes('');
      // Refetch pending + all claims and stats since totals change
      void fetchPendingClaims(claimPage);
      void fetchAllClaims(allClaimsPage, allClaimsStatus);
      void fetchStats();
    } catch (err) {
      console.error('Failed to review claim', err);
      const e = err as Error;
      toast.error(e.message || tCopy.errors.reviewFailed);
    } finally {
      setSubmittingReview(null);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: tCopy.tabs.overview, icon: ShieldAlert },
    { id: 'users', label: tCopy.tabs.users, icon: Users },
    { id: 'claims', label: tCopy.tabs.claims, icon: FileText },
    { id: 'all-claims', label: tCopy.tabs.allClaims, icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-8 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        navigatedTo={tCopy.nav}
        title={tCopy.title}
        subtitle={tCopy.subtitle}
        showArrow
      />

      <main className="w-full max-w-400 mx-auto px-6 lg:px-12 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-secondary text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <OverviewPanel stats={stats} loading={statsLoading} t={tCopy} />
        )}

        {activeTab === 'users' && (
          <UsersPanel
            users={users}
            loading={usersLoading}
            searchInput={userSearchInput}
            onSearchInputChange={setUserSearchInput}
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

        {activeTab === 'claims' && (
          <ClaimsPanel
            claims={claims}
            loading={claimsLoading}
            page={claimPage}
            totalPages={claimTotalPages}
            onPageChange={setClaimPage}
            onReview={(c) => {
              setReviewingClaim(c);
              setReviewNotes('');
            }}
            t={tCopy}
            isRTL={isRTL}
          />
        )}

        {activeTab === 'all-claims' && (
          <AllClaimsPanel
            claims={allClaims}
            loading={allClaimsLoading}
            page={allClaimsPage}
            totalPages={allClaimsTotalPages}
            onPageChange={setAllClaimsPage}
            statusFilter={allClaimsStatus}
            onStatusFilterChange={(s) => {
              setAllClaimsStatus(s);
              setAllClaimsPage(1);
            }}
            onReview={(c) => {
              setReviewingClaim(c);
              setReviewNotes('');
            }}
            t={tCopy}
            isRTL={isRTL}
          />
        )}
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
      </AnimatePresence>
    </div>
  );
}

function OverviewPanel({
  stats,
  loading,
  t,
}: {
  stats: DashboardStats | null;
  loading: boolean;
  t: Copy;
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

  const items = [
    { label: t.stats.totalUsers, value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: t.stats.totalPosts, value: stats.totalPosts, icon: FileText, color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: t.stats.activeMissing, value: stats.activeMissing, icon: AlertCircle, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: t.stats.foundPosts, value: stats.foundPosts, icon: CheckCircle2, color: 'bg-green-50 text-green-600 border-green-100' },
    { label: t.stats.resolvedPosts, value: stats.resolvedPosts, icon: ShieldAlert, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: t.stats.pendingClaims, value: stats.pendingClaims, icon: Inbox, color: 'bg-orange-50 text-orange-600 border-orange-100' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-xs"
          >
            <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${item.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex flex-col text-start">
              <span className="text-xs text-slate-500 font-medium">{item.label}</span>
              <span className="text-2xl font-bold text-tertiary">{item.value.toLocaleString()}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

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
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-tertiary font-bold text-start">{t.users.title}</h2>
        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className={`h-4 w-4 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-slate-400 pointer-events-none`} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              placeholder={t.users.searchPlaceholder}
              className={`w-64 max-w-full rounded-xl border border-slate-200 bg-slate-50 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-sm focus:bg-white focus:border-secondary outline-none`}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors cursor-pointer"
          >
            {t.users.search}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-secondary animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-slate-500">{t.users.empty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-start font-semibold">{t.users.name}</th>
                <th className="px-5 py-3 text-start font-semibold">{t.users.email}</th>
                <th className="px-5 py-3 text-start font-semibold">{t.users.role}</th>
                <th className="px-5 py-3 text-start font-semibold">{t.users.status}</th>
                <th className="px-5 py-3 text-start font-semibold">{t.users.joined}</th>
                <th className="px-5 py-3 text-end font-semibold">{t.users.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-semibold text-tertiary">{user.name}</td>
                  <td className="px-5 py-3 text-slate-600 truncate max-w-xs">{user.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        user.isbanned
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                    >
                      {user.isbanned ? t.users.banned : t.users.active}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3 text-end">
                    <button
                      onClick={() => onToggleBan(user)}
                      disabled={user.role === 'admin' || banningUserId === user._id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.isbanned
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
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

function ClaimsPanel({
  claims,
  loading,
  page,
  totalPages,
  onPageChange,
  onReview,
  t,
  isRTL,
}: {
  claims: BackendClaim[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onReview: (c: BackendClaim) => void;
  t: Copy;
  isRTL: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-tertiary font-bold text-start">{t.claims.title}</h2>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-secondary animate-spin" />
        </div>
      ) : claims.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          {t.claims.empty}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {claims.map((claim) => {
            const post = typeof claim.postId === 'object' ? (claim.postId as BackendPost) : null;
            const claimant = typeof claim.claimUserId === 'object' ? claim.claimUserId : null;
            return (
              <li key={claim._id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-tertiary truncate">
                      {post?.name || t.claims.unknownPost}
                    </span>
                    {post?.postType && (
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        post.postType === 'missing'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {post.postType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 truncate">
                    <span className="text-slate-400">{t.claims.by} </span>
                    {claimant?.name || t.claims.unknownClaimant} · {claimant?.email || ''}
                  </p>
                  {claim.additionalInfo && (
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                      {claim.additionalInfo}
                    </p>
                  )}
                  <span className="text-[11px] text-slate-400 mt-1">
                    {new Date(claim.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {claim.documentPath && (
                    <a
                      href={claim.documentPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {t.claims.viewDocument}
                    </a>
                  )}
                  <button
                    onClick={() => onReview(claim)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary text-white hover:bg-secondary/90 transition-colors cursor-pointer"
                  >
                    {t.claims.review}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} isRTL={isRTL} />
    </div>
  );
}

function AllClaimsPanel({
  claims,
  loading,
  page,
  totalPages,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  onReview,
  t,
  isRTL,
}: {
  claims: BackendClaim[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  statusFilter: ClaimStatusFilter;
  onStatusFilterChange: (s: ClaimStatusFilter) => void;
  onReview: (c: BackendClaim) => void;
  t: Copy;
  isRTL: boolean;
}) {
  const filterChips: { id: ClaimStatusFilter; label: string }[] = [
    { id: 'all', label: t.allClaims.filterAll },
    { id: 'pending', label: t.allClaims.filterPending },
    { id: 'approved', label: t.allClaims.filterApproved },
    { id: 'rejected', label: t.allClaims.filterRejected },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-tertiary font-bold text-start">{t.allClaims.title}</h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {filterChips.map((chip) => {
            const isActive = chip.id === statusFilter;
            return (
              <button
                key={chip.id}
                onClick={() => onStatusFilterChange(chip.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-secondary animate-spin" />
        </div>
      ) : claims.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          {t.allClaims.empty}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {claims.map((claim) => {
            const post = typeof claim.postId === 'object' ? (claim.postId as BackendPost) : null;
            const claimant = typeof claim.claimUserId === 'object' ? claim.claimUserId : null;
            const statusTone =
              claim.status === 'approved'
                ? 'bg-green-50 text-green-700 border-green-200'
                : claim.status === 'rejected'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';
            const statusLabel =
              claim.status === 'approved'
                ? t.allClaims.statusApproved
                : claim.status === 'rejected'
                  ? t.allClaims.statusRejected
                  : t.allClaims.statusPending;
            return (
              <li
                key={claim._id}
                className="p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-tertiary truncate">
                      {post?.name || t.claims.unknownPost}
                    </span>
                    {post?.postType && (
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        post.postType === 'missing'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {post.postType}
                      </span>
                    )}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusTone}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">
                    <span className="text-slate-400">{t.claims.by} </span>
                    {claimant?.name || t.claims.unknownClaimant}
                    {claimant?.email ? ` · ${claimant.email}` : ''}
                  </p>
                  {claim.additionalInfo && (
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                      {claim.additionalInfo}
                    </p>
                  )}
                  <span className="text-[11px] text-slate-400 mt-1">
                    {new Date(claim.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {claim.documentPath && (
                    <a
                      href={claim.documentPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {t.claims.viewDocument}
                    </a>
                  )}
                  {claim.status === 'pending' && (
                    <button
                      onClick={() => onReview(claim)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary text-white hover:bg-secondary/90 transition-colors cursor-pointer"
                    >
                      {t.claims.review}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} isRTL={isRTL} />
    </div>
  );
}

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
  onSubmit: (decision: 'approved' | 'rejected') => void;
  submitting: 'approved' | 'rejected' | null;
  t: Copy;
  isRTL: boolean;
}) {
  const post = typeof claim.postId === 'object' ? (claim.postId as BackendPost) : null;
  const claimant = typeof claim.claimUserId === 'object' ? claim.claimUserId : null;

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
        dir={isRTL ? 'rtl' : 'ltr'}
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-tertiary">{t.claims.reviewTitle}</h3>
            <p className="text-sm text-slate-500 mt-1">{post?.name || t.claims.unknownPost}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-200/60 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-3">
              <p className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                {t.claims.claimant}
              </p>
              <p className="font-bold text-tertiary">{claimant?.name || '—'}</p>
              <p className="text-xs text-slate-500">{claimant?.email || ''}</p>
              {claimant?.phoneNumber && (
                <p className="text-xs text-slate-500">{claimant.phoneNumber}</p>
              )}
            </div>
            <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-3">
              <p className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                {t.claims.post}
              </p>
              <p className="font-bold text-tertiary">{post?.name || '—'}</p>
              <p className="text-xs text-slate-500 capitalize">{post?.postType || ''}</p>
            </div>
          </div>

          {claim.additionalInfo && (
            <div className="bg-amber-50/50 rounded-xl border border-amber-100 p-3 text-sm">
              <p className="text-[11px] uppercase font-semibold text-amber-700 mb-1">
                {t.claims.relationship}
              </p>
              <p className="text-slate-700 whitespace-pre-wrap">{claim.additionalInfo}</p>
            </div>
          )}

          {claim.documentPath && (
            <a
              href={claim.documentPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              {t.claims.viewDocument}
            </a>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
              {t.claims.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={t.claims.notesPlaceholder}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-secondary outline-none resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={submitting !== null}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {t.claims.cancel}
          </button>
          <button
            onClick={() => onSubmit('rejected')}
            disabled={submitting !== null}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting === 'rejected' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {t.claims.reject}
          </button>
          <button
            onClick={() => onSubmit('approved')}
            disabled={submitting !== null}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting === 'approved' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {t.claims.approve}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
        {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        {isRTL ? 'السابق' : 'Prev'}
      </button>
      <span className="text-xs text-slate-500">
        {isRTL ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {isRTL ? 'التالي' : 'Next'}
        {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

interface Copy {
  nav: string;
  title: string;
  subtitle: string;
  tabs: { overview: string; users: string; claims: string; allClaims: string };
  allClaims: {
    title: string;
    empty: string;
    filterAll: string;
    filterPending: string;
    filterApproved: string;
    filterRejected: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
  };
  stats: {
    totalUsers: string;
    totalPosts: string;
    activeMissing: string;
    foundPosts: string;
    resolvedPosts: string;
    pendingClaims: string;
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
    title: string;
    by: string;
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
  };
  errors: {
    stats: string;
    users: string;
    claims: string;
    cantBanAdmin: string;
    banFailed: string;
    reviewFailed: string;
  };
}

function getCopy(isRTL: boolean): Copy {
  if (isRTL) {
    return {
      nav: 'لوحة الإدارة',
      title: 'لوحة الإدارة',
      subtitle: 'إدارة المستخدمين، المطالبات، والإحصائيات.',
      tabs: {
        overview: 'نظرة عامة',
        users: 'المستخدمون',
        claims: 'المطالبات قيد المراجعة',
        allClaims: 'كل المطالبات',
      },
      allClaims: {
        title: 'جميع المطالبات',
        empty: 'لا توجد مطالبات تطابق هذا الفلتر.',
        filterAll: 'الكل',
        filterPending: 'قيد المراجعة',
        filterApproved: 'تمت الموافقة',
        filterRejected: 'مرفوض',
        statusPending: 'قيد المراجعة',
        statusApproved: 'تمت الموافقة',
        statusRejected: 'مرفوض',
      },
      stats: {
        totalUsers: 'إجمالي المستخدمين',
        totalPosts: 'إجمالي المنشورات',
        activeMissing: 'المفقودون نشطًا',
        foundPosts: 'تم العثور عليهم',
        resolvedPosts: 'الحالات المحلولة',
        pendingClaims: 'مطالبات معلقة',
      },
      users: {
        title: 'المستخدمون',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        role: 'الدور',
        status: 'الحالة',
        joined: 'تاريخ الانضمام',
        actions: 'الإجراءات',
        active: 'نشط',
        banned: 'محظور',
        unbanned: 'تم إلغاء الحظر',
        ban: 'حظر',
        unban: 'إلغاء الحظر',
        search: 'بحث',
        searchPlaceholder: 'ابحث بالاسم...',
        empty: 'لا يوجد مستخدمون.',
      },
      claims: {
        title: 'المطالبات قيد المراجعة',
        by: 'بواسطة',
        review: 'مراجعة',
        reviewTitle: 'مراجعة المطالبة',
        approve: 'موافقة',
        reject: 'رفض',
        approved: 'تمت الموافقة على المطالبة',
        rejected: 'تم رفض المطالبة',
        cancel: 'إلغاء',
        notes: 'الملاحظات',
        notesPlaceholder: 'أدخل ملاحظاتك (اختياري)...',
        relationship: 'صلة القرابة / المعلومات',
        claimant: 'مقدم الطلب',
        post: 'المنشور',
        viewDocument: 'عرض المستند',
        unknownClaimant: 'مستخدم غير معروف',
        unknownPost: 'منشور غير معروف',
        empty: 'لا توجد مطالبات معلقة.',
      },
      errors: {
        stats: 'فشل تحميل الإحصائيات.',
        users: 'فشل تحميل المستخدمين.',
        claims: 'فشل تحميل المطالبات.',
        cantBanAdmin: 'لا يمكن حظر مسؤول.',
        banFailed: 'فشل تحديث حالة الحظر.',
        reviewFailed: 'فشل إرسال المراجعة.',
      },
    };
  }
  return {
    nav: 'Admin Dashboard',
    title: 'Admin Dashboard',
    subtitle: 'Manage users, claims, and overall platform stats.',
    tabs: {
      overview: 'Overview',
      users: 'Users',
      claims: 'Pending Claims',
      allClaims: 'All Claims',
    },
    allClaims: {
      title: 'All Claims',
      empty: 'No claims match this filter.',
      filterAll: 'All',
      filterPending: 'Pending',
      filterApproved: 'Approved',
      filterRejected: 'Rejected',
      statusPending: 'Pending',
      statusApproved: 'Approved',
      statusRejected: 'Rejected',
    },
    stats: {
      totalUsers: 'Total users',
      totalPosts: 'Total posts',
      activeMissing: 'Active missing',
      foundPosts: 'Found posts',
      resolvedPosts: 'Resolved cases',
      pendingClaims: 'Pending claims',
    },
    users: {
      title: 'Users',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      joined: 'Joined',
      actions: 'Actions',
      active: 'Active',
      banned: 'Banned',
      unbanned: 'User unbanned',
      ban: 'Ban',
      unban: 'Unban',
      search: 'Search',
      searchPlaceholder: 'Search by name...',
      empty: 'No users found.',
    },
    claims: {
      title: 'Pending Claims',
      by: 'by',
      review: 'Review',
      reviewTitle: 'Review claim',
      approve: 'Approve',
      reject: 'Reject',
      approved: 'Claim approved',
      rejected: 'Claim rejected',
      cancel: 'Cancel',
      notes: 'Notes',
      notesPlaceholder: 'Optional notes for this decision...',
      relationship: 'Relationship / details',
      claimant: 'Claimant',
      post: 'Post',
      viewDocument: 'View document',
      unknownClaimant: 'Unknown user',
      unknownPost: 'Unknown post',
      empty: 'There are no pending claims right now.',
    },
    errors: {
      stats: 'Failed to load stats.',
      users: 'Failed to load users.',
      claims: 'Failed to load claims.',
      cantBanAdmin: 'You cannot ban another admin.',
      banFailed: 'Failed to update ban status.',
      reviewFailed: 'Failed to submit review.',
    },
  };
}
