import { type AxiosError } from "axios";
import { axiosInstance } from "@/lib/axiosInstance";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = {
  method?: HttpMethod;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  token?: string | null;
};

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body = null, headers = {}, token = null } = options;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const hasBody = body !== null && body !== undefined;

  try {
    const response = await axiosInstance.request<T>({
      url: path,
      method,
      data: body,
      headers: {
        ...(hasBody && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: token } : {}),
        ...headers,
      },
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data;
    const message =
      (data && typeof data === "object" && "message" in data && data.message) ||
      axiosError.message ||
      "Request failed";

    throw new ApiError(message, status, data);
  }
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
  profilePicture?: string | null;
}

interface AuthResponse {
  message: string;
  token?: string;
  user?: AuthUser;
}

type RegisterInput = {
  name: string;
  email: string;
  city: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  birthDate?: string;
  idPicture?: File | null;
  selfiePicture?: File | null;
};

export interface BackendPost {
  _id: string;
  userId?: string | { _id: string; name: string; email?: string };
  postType: "missing" | "found";
  name: string;
  status: "active" | "resolved" | "closed";
  age?: number;
  ageUnit?: "years" | "months" | "days";
  gender?: "male" | "female" | "unknown";
  hairColour?: string;
  eyeColour?: string;
  clothesDescription?: string;
  city?: string;
  lastSeenLocation?: string;
  lastSeenDate?: string;
  foundLocation?: string;
  affiliation?: string;
  organizationName?: string;
  reporterPhone?: string;
  postImage?: string;
  createdAt?: string;
}

export interface BackendMapMarker {
  id: string;
  type: "missing" | "found";
  name: string;
  lat: number;
  lng: number;
  age?: number | string;
  details?: string;
  clothesDescription?: string;
  hairColour?: string;
  eyeColour?: string;
  postedBy?: string;
  city?: string;
  location?: string;
  address?: string;
  imagePath?: string;
  createdAt?: string;
  lastSeenDate?: string;
  timeAgo?: string;
  status?: string;
}

interface GetPostsResponse {
  data: BackendPost[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

type CreatePostPayload = {
  postType: "missing" | "found";
  firstName: string;
  lastName: string;
  age: number;
  ageUnit: "years" | "months" | "days";
  gender: "male" | "female" | "unknown";
  hairColour: string;
  eyeColour: string;
  clothesDescription: string;
  city: string;
  lastSeenLocation?: string;
  lastSeenDate?: string;
  foundLocation?: string;
  affiliation?: string;
  organizationName?: string;
  reporterPhone?: string;
  latitude?: number;
  longitude?: number;
  photo?: File;
  pendingEncoding?: number[] | null;
};

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload: { email: string }) =>
    apiRequest<{ message: string }>("auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyOTP: (payload: { email: string; otp: string }) =>
    apiRequest<{ message: string }>("auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: {
    email: string;
    otp: string;
    password: string;
    confirmPassword: string;
  }) =>
    apiRequest<{ message: string }>("auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: ({ idPicture, selfiePicture, ...payload }: RegisterInput) => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("email", payload.email);
    formData.append("city", payload.city);
    formData.append("password", payload.password);
    formData.append("confirmPassword", payload.confirmPassword);
    formData.append("phoneNumber", payload.phoneNumber);

    if (payload.birthDate) {
      formData.append("birthDate", payload.birthDate);
    }

    if (idPicture) {
      formData.append("idPicture", idPicture);
    }

    if (selfiePicture) {
      formData.append("selfiePicture", selfiePicture);
    }

    return apiRequest<{ message: string; user: AuthUser }>("auth/register", {
      method: "POST",
      body: formData,
    });
  },
};

export const postApi = {
  getPosts: async (params: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });

    const res = await apiRequest<any>(`posts?${searchParams.toString()}`);

    // Normalize possible response shapes from backend (prod may return array directly)
    if (Array.isArray(res)) {
      return {
        data: res,
        page: 1,
        limit: res.length,
        totalCount: res.length,
        totalPages: 1,
      } as GetPostsResponse;
    }

    if (res && typeof res === "object" && "data" in res) {
      return res as GetPostsResponse;
    }

    // Fallback safe shape
    return {
      data: [],
      page: 1,
      limit: 0,
      totalCount: 0,
      totalPages: 0,
    } as GetPostsResponse;
  },

  getMapMarkers: (params?: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.set(key, String(value));
        }
      });
    }
    return apiRequest<{ markers: BackendMapMarker[] }>(
      `posts/map-markers?${searchParams.toString()}`,
    );
  },

  getPublicStats: () =>
    apiRequest<{ success: boolean; activeMissing: number; foundCases: number }>(
      "posts/public-stats",
    ),

  createPost: (payload: CreatePostPayload, token: string) => {
    const formData = new FormData();

    formData.append("postType", payload.postType);
    formData.append("firstName", payload.firstName);
    formData.append("lastName", payload.lastName);
    formData.append("age", String(payload.age));
    formData.append("ageUnit", payload.ageUnit);
    formData.append("gender", payload.gender);
    formData.append("hairColour", payload.hairColour);
    formData.append("eyeColour", payload.eyeColour);
    formData.append("clothesDescription", payload.clothesDescription);
    formData.append("city", payload.city);

    if (payload.lastSeenLocation)
      formData.append("lastSeenLocation", payload.lastSeenLocation);
    if (payload.lastSeenDate)
      formData.append("lastSeenDate", payload.lastSeenDate);
    if (payload.foundLocation)
      formData.append("foundLocation", payload.foundLocation);
    if (payload.affiliation)
      formData.append("affiliation", payload.affiliation);
    if (payload.organizationName)
      formData.append("organizationName", payload.organizationName);
    if (payload.reporterPhone)
      formData.append("reporterPhone", payload.reporterPhone);

    if (payload.photo) {
      formData.append("photo", payload.photo);
    }
    if (payload.pendingEncoding && payload.pendingEncoding.length > 0) {
      formData.append("pendingEncoding", JSON.stringify(payload.pendingEncoding));
    }

    // Required by backend joi schema which validates merged request body/query/params.
    formData.append("authorization", token);

    return apiRequest<{ message: string; post: BackendPost }>("posts", {
      method: "POST",
      body: formData,
      token,
    });
  },
};

export interface UserProfileInfo {
  id: string;
  name: string;
  email: string;
  city?: string;
  phoneNumber?: string;
  birthDate?: string;
  role: "user" | "admin";
  isVerified: boolean;
  idImagePath?: string;
  profilePicture?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface GetProfileResponse {
  user: UserProfileInfo;
  posts: BackendPost[];
}

export interface BlockedUser {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string | null;
}

export const userApi = {
  getProfile: (token: string) =>
    apiRequest<GetProfileResponse>("users/profile", {
      method: "GET",
      token,
    }),
  updateProfile: (data: FormData, token: string) => {
    // Append authorization to FormData for joi validation in backend
    data.append("authorization", token);
    return apiRequest<{ message: string; user: UserProfileInfo }>(
      "users/profile",
      {
        method: "PUT",
        body: data,
        token,
      },
    );
  },
  blockUser: (userId: string, token: string) =>
    apiRequest<{ message: string }>(`users/${userId}/block`, {
      method: "POST",
      token,
    }),
  getBlockedUsers: (token: string) =>
    apiRequest<{ blockedUsers: BlockedUser[] }>("users/blocked", {
      method: "GET",
      token,
    }),
  unblockUser: (userId: string, token: string) =>
    apiRequest<{ message: string }>(`users/${userId}/unblock`, {
      method: "POST",
      token,
    }),
};

export interface SightingPayload {
  missingPersonId: string;
  confidence: "not_sure" | "possibly" | "pretty_sure" | "very_sure" | string;
  seenAt: string;
  address: string;
  description: string;
  additionalDetails?: string;
  reporterName: string;
  reporterPhone: string;
}

export interface BackendSightingLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface BackendSightingPost {
  _id: string;
  name?: string;
  userId?: string | { _id: string };
}

export interface BackendSighting {
  _id: string;
  missingPersonId: string | BackendSightingPost;
  confidence: "not_sure" | "possibly" | "pretty_sure" | "very_sure";
  seenAt: string;
  location: BackendSightingLocation;
  description: string;
  additionalDetails?: string;
  reporterName: string;
  reporterPhone: string;
  reporterId?: string | { _id: string };
  createdAt?: string;
}

export const sightingApi = {
  createSighting: (payload: SightingPayload, token?: string) =>
    apiRequest<{ message: string; report: BackendSighting }>("sightings", {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),

  getMySightings: (token: string) =>
    apiRequest<{ message: string; reports: any[] }>("sightings/user/my-sightings", {
      method: "GET",
      token,
    }),

  getSightings: (postId: string, token: string) =>
    apiRequest<{ message: string; reports: BackendSighting[] }>(
      `sightings/${postId}`,
      {
        method: "GET",
        token,
      },
    ),
};

export interface CreateClaimPayload {
  postId: string;
  additionalInfo?: string;
}

export interface BackendClaim {
  _id: string;
  postId: BackendPost | string; // Can be populated
  claimantId?: string;
  claimUserId?:
    | { _id: string; name?: string; email?: string; phoneNumber?: string }
    | string;
  claimType?: string;
  status: "pending" | "approved" | "rejected";
  documentPath?: string;
  additionalInfo?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export const claimApi = {
  createClaim: async (data: FormData, token: string) => {
    return apiRequest<{ message: string; claim: BackendClaim }>("claims", {
      method: "POST",
      body: data,
      token,
    });
  },
  getMyClaims: async (token: string) => {
    return apiRequest<{ message: string; claims: BackendClaim[] }>(
      "claims/my",
      {
        method: "GET",
        token,
      },
    );
  },
  getClaimsByPost: async (postId: string, token: string) => {
    return apiRequest<{ message: string; claims: BackendClaim[] }>(
      `claims/post/${postId}`,
      {
        method: "GET",
        token,
      },
    );
  },
};

export interface BackendNotificationPost {
  _id: string;
  name: string;
  postType: "missing" | "found";
  userId?: string | { _id: string; name?: string };
}

export interface BackendNotification {
  _id: string;
  userId: string;
  postId?: BackendNotificationPost | string;
  referenceId?: string;
  type: "new_sighting" | "new_claim" | "claim_approved" | "claim_approved_owner" | "claim_rejected";
  message?: string;
  isRead: boolean;
  deliveredVia: "email" | "push" | "in-app";
  createdAt: string;
}

export const notificationApi = {
  getMyNotifications: async (token: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{
      notifications: BackendNotification[];
      unreadCount: number;
    }>(`notifications${queryString}`, {
      method: "GET",
      token,
    });
  },
  markAllRead: async (token: string) => {
    return apiRequest<{ message: string }>("notifications/read-all", {
      method: "PATCH",
      token,
    });
  },
  markOneRead: async (id: string, token: string) => {
    return apiRequest<{ message: string; notification: BackendNotification }>(
      `notifications/${id}/read`,
      {
        method: "PATCH",
        token,
      },
    );
  },
};

export interface BackendChatUser {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string | null;
}

export interface BackendChat {
  _id: string;
  initiatorUserId: BackendChatUser | string;
  responderUserId: BackendChatUser | string;
  isActive: boolean;
  createdAt: string;
}

export interface BackendMessage {
  _id: string;
  chatId: string;
  senderUserId: BackendChatUser | string;
  content?: string;
  attachmentPath?: string;
  createdAt: string;
}

export const chatApi = {
  startChat: async (responderId: string, token: string) => {
    return apiRequest<{ chat: BackendChat }>("chats", {
      method: "POST",
      body: JSON.stringify({ responderId }),
      token,
    });
  },
  getMyChats: async (token: string) => {
    return apiRequest<{ chats: BackendChat[] }>("chats", {
      method: "GET",
      token,
    });
  },
  sendMessage: async (
    chatId: string,
    content: string | undefined,
    attachment: File | null,
    token: string,
  ) => {
    const formData = new FormData();
    if (content) formData.append("content", content);
    if (attachment) formData.append("attachment", attachment);

    // If neither content nor attachment is provided, body could be null,
    // but we can send formData as empty body in case it's strictly needed.
    const hasData = Boolean(content || attachment);
    return apiRequest<{ message: BackendMessage }>(`chats/${chatId}/messages`, {
      method: "POST",
      body: hasData ? formData : null,
      token,
    });
  },
  getChatMessages: async (
    chatId: string,
    page: number,
    limit: number,
    token: string,
  ) => {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ messages: BackendMessage[] }>(
      `chats/${chatId}/messages${queryString}`,
      {
        method: "GET",
        token,
      },
    );
  },
  deleteChat: async (chatId: string, token: string) => {
    return apiRequest<{ message: string }>(`chats/${chatId}`, {
      method: "DELETE",
      token,
    });
  },
};

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactApi = {
  sendMessage: (payload: ContactMessagePayload) =>
    apiRequest<{ message: string; data: any }>("contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  activeMissing: number;
  foundPosts: number;
  resolvedPosts: number;
  pendingClaims: number;
  pendingVerifications?: number;
  pendingContactMessages?: number;
  pendingUserReports?: number;
  sightingReports?: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  isbanned: boolean;
  isVerified?: boolean;
  idImagePath?: string;
  createdAt: string;
}

export interface AdminPostsResponse {
  posts: BackendPost[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedResponse {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminUsersResponse extends PaginatedResponse {
  users: AdminUser[];
}

export interface AdminPendingClaimsResponse extends PaginatedResponse {
  claims: BackendClaim[];
}

export interface BackendContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isReplied?: boolean;
  createdAt: string;
}

export interface AdminContactMessagesResponse extends PaginatedResponse {
  messages: BackendContactMessage[];
}

export interface AdminChatsResponse extends PaginatedResponse {
  chats: BackendChat[];
}

export const adminApi = {
  getDashboardStats: async (token: string) => {
    return apiRequest<{ stats: DashboardStats }>("admin/stats", {
      method: "GET",
      token,
    });
  },
  getAllUsers: async (
    token: string,
    params?: { page?: number; limit?: number; name?: string; email?: string },
  ) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.name) search.set("name", params.name);
    if (params?.email) search.set("email", params.email);
    const qs = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<AdminUsersResponse>(`admin/users${qs}`, {
      method: "GET",
      token,
    });
  },
  toggleBanUser: async (userId: string, token: string) => {
    return apiRequest<{ message: string; isbanned: boolean }>(
      `admin/users/${userId}/ban`,
      {
        method: "PATCH",
        token,
      },
    );
  },
  getPendingClaims: async (
    token: string,
    params?: { page?: number; limit?: number },
  ) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    const qs = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<AdminPendingClaimsResponse>(`admin/claims/pending${qs}`, {
      method: "GET",
      token,
    });
  },
  getAllClaims: async (
    token: string,
    params?: {
      page?: number;
      limit?: number;
      status?: "pending" | "approved" | "rejected" | "all";
    },
  ) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.status && params.status !== "all")
      search.set("status", params.status);
    const qs = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<AdminPendingClaimsResponse>(`admin/claims${qs}`, {
      method: "GET",
      token,
    });
  },
  adminReviewClaim: async (
    claimId: string,
    result: "approved" | "rejected",
    notes: string | undefined,
    token: string,
  ) => {
    return apiRequest<{ message: string; claim: BackendClaim }>(
      `claims/${claimId}/admin-review`,
      {
        method: "POST",
        body: JSON.stringify({ result, notes, authorization: token }),
        token,
      },
    );
  },
  // Identity verification queue ────────────────────────────────────────────
  getPendingVerifications: async (
    token: string,
    params?: { page?: number; limit?: number; name?: string; email?: string },
  ) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.name) search.set("name", params.name);
    if (params?.email) search.set("email", params.email);
    const qs = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<AdminUsersResponse>(`admin/verifications/pending${qs}`, {
      method: "GET",
      token,
    });
  },
  verifyUser: async (userId: string, token: string) => {
    return apiRequest<{ message: string; user: AdminUser }>(
      `admin/users/${userId}/verify`,
      { method: "POST", token },
    );
  },
  rejectVerification: async (
    userId: string,
    reason: string | undefined,
    token: string,
  ) => {
    return apiRequest<{ message: string }>(
      `admin/users/${userId}/reject-verification`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
        token,
      },
    );
  },
  // Posts moderation ─────────────────────────────────────────────────────────
  getAllPostsAdmin: async (
    token: string,
    params?: {
      page?: number;
      limit?: number;
      postType?: "missing" | "found";
      status?: "active" | "resolved" | "closed";
      name?: string;
    },
  ) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.postType) search.set("postType", params.postType);
    if (params?.status) search.set("status", params.status);
    if (params?.name) search.set("name", params.name);
    const qs = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<AdminPostsResponse>(`admin/posts${qs}`, {
      method: "GET",
      token,
    });
  },
  deletePostAdmin: async (postId: string, token: string) => {
    return apiRequest<{ message: string }>(`posts/${postId}`, {
      method: "DELETE",
      token,
    });
  },
  aiReviewClaim: async (
    claimId: string,
    aiDecision: "approved" | "rejected" | "uncertain",
    aiConfidenceScore: number,
    notes: string | undefined,
    verificationType: string | undefined,
    token: string,
  ) => {
    return apiRequest<{ message: string; claim: BackendClaim }>(
      `claims/${claimId}/ai-review`,
      {
        method: "POST",
        body: JSON.stringify({
          aiDecision,
          aiConfidenceScore,
          notes,
          verificationType,
          authorization: token,
        }),
        token,
      },
    );
  },
  getContactMessages: async (
    token: string,
    params?: { page?: number; limit?: number; type?: "contact" | "report" },
  ) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.type) search.set("type", params.type);
    const qs = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<AdminContactMessagesResponse>(
      `admin/contact-messages${qs}`,
      {
        method: "GET",
        token,
      },
    );
  },
  getSightings: (token: string, page: number = 1, limit: number = 20) =>
    apiRequest<{
      sightings: BackendSighting[];
      page: number;
      totalPages: number;
      totalCount: number;
    }>(`admin/sightings?page=${page}&limit=${limit}`, {
      method: "GET",
      token,
    }),
  replyToContactMessage: async (
    id: string,
    replyMessage: string,
    token: string,
  ) => {
    return apiRequest<{ message: string }>(
      `admin/contact-messages/${id}/reply`,
      {
        method: "POST",
        body: JSON.stringify({ replyMessage }),
        token,
      },
    );
  },
  getAdminChats: async (
    token: string,
    params?: { page?: number; limit?: number; status?: "active" | "inactive" },
  ) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.status) search.set("status", params.status);
    const qs = search.toString() ? `?${search.toString()}` : "";
    return apiRequest<AdminChatsResponse>(`admin/chats${qs}`, {
      method: "GET",
      token,
    });
  },
  getChatDetails: async (id: string, token: string) => {
    return apiRequest<{ chat: BackendChat }>(`admin/chats/${id}`, {
      method: "GET",
      token,
    });
  },
  getChatMessages: async (
    id: string,
    token: string,
    params?: { page?: number; limit?: number },
  ) => {
    const qs = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [k, v]) => {
        if (v !== undefined) acc[k] = String(v);
        return acc;
      }, {} as Record<string, string>),
    ).toString();
    const query = qs ? `?${qs}` : "";
    return apiRequest<{
      messages: BackendMessage[];
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    }>(`admin/chats/${id}/messages${query}`, {
      method: "GET",
      token,
    });
  },
};


