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

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body = null, headers = {}, token = null } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  try {
    const response = await axiosInstance.request<T>({
      url: path,
      method,
      data: body,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
}

interface AuthResponse {
  message: string;
  token?: string;
  user?: AuthUser;
}

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  birthDate?: string;
  idPicture?: File | null;
};

export interface BackendPost {
  _id: string;
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
  postImages?: string[];
  createdAt?: string;
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
  photos?: File[];
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

  resetPassword: (payload: { email: string; otp: string; password: string; confirmPassword: string }) =>
    apiRequest<{ message: string }>("auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: ({ idPicture, ...payload }: RegisterInput) => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    formData.append("confirmPassword", payload.confirmPassword);
    formData.append("phoneNumber", payload.phoneNumber);

    if (payload.birthDate) {
      formData.append("birthDate", payload.birthDate);
    }

    if (idPicture) {
      formData.append("idPicture", idPicture);
    }

    return apiRequest<{ message: string; user: AuthUser }>("auth/register", {
      method: "POST",
      body: formData,
    });
  },
};

export const postApi = {
  getPosts: (params: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });

    return apiRequest<GetPostsResponse>(`posts?${searchParams.toString()}`);
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
    return apiRequest<{ markers: any[] }>(`posts/map-markers?${searchParams.toString()}`);
  },

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

    if (payload.lastSeenLocation) formData.append("lastSeenLocation", payload.lastSeenLocation);
    if (payload.lastSeenDate) formData.append("lastSeenDate", payload.lastSeenDate);
    if (payload.foundLocation) formData.append("foundLocation", payload.foundLocation);
    if (payload.affiliation) formData.append("affiliation", payload.affiliation);
    if (payload.organizationName) formData.append("organizationName", payload.organizationName);
    if (payload.reporterPhone) formData.append("reporterPhone", payload.reporterPhone);

    payload.photos?.forEach((photo) => {
      formData.append("photos", photo);
    });

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
  phoneNumber?: string;
  birthDate?: string;
  role: "user" | "admin";
  isVerified: boolean;
  idImagePath?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface GetProfileResponse {
  user: UserProfileInfo;
  posts: BackendPost[];
}

export const userApi = {
  getProfile: (token: string) => 
    apiRequest<GetProfileResponse>("users/profile", {
      method: "GET",
      token,
    }),
};
