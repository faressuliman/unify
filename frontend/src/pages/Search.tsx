import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  Info,
  Search as SearchIcon,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import MissingPersonCard from "../components/search/MissingPersonCard";
import PageHeader from "../components/ui/PageHeader";
import FoundPersonCard from "../components/search/FoundPersonCard";
import { motion } from "framer-motion";
import { isAxiosError } from "axios";
import SearchFiltersPanel, {
  type SearchFilters,
} from "../components/search/SearchFiltersPanel";
import UnderlineTabSelector from "../components/ui/UnderlineTabSelector";
import InfoBanner from "../components/ui/InfoBanner";
import ImageUpload from "../components/ui/ImageUpload";
import { ApiError, type BackendPost, postApi, userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ProfileData } from "@/components/home/PersonCard";
import { mapPostFields } from "@/lib/postFormatters";
import { axiosInstance } from "@/lib/axiosInstance";

type SearchProfile = ProfileData & {
  dateMissing?: string;
  rawClothing?: string;
  rawLocation?: string;
};

const defaultSearchFilters: SearchFilters = {
  firstName: "",
  lastName: "",
  ageMin: "",
  ageMax: "",
  hairColor: "",
  eyeColor: "",
  gender: "",
  location: "",
  clothing: "",
  dateMissing: "",
  city: "",
};

const mapBackendPostToCard = (
  post: BackendPost,
  isRTL: boolean,
): SearchProfile => {
  const fields = mapPostFields(post, isRTL);
  return {
    id: post._id,
    type: post.postType,
    name: fields.name,
    status: post.status,
    location: fields.location,
    timeAgo: fields.timeAgo,
    details: fields.details,
    image: post.postImages?.[0],
    city: fields.city,
    age: fields.age,
    physicalDescription: fields.physicalDescription,
    clothingDescription: fields.clothingDescription,
    lastSeenLocationDetails: fields.lastSeenLocationDetails,
    foundLocationDetails: fields.foundLocationDetails,
    reportDate: fields.reportDate,
    rawClothing: post.clothesDescription?.toLowerCase(),
    rawLocation: (post.postType === "missing"
      ? post.lastSeenLocation
      : post.foundLocation
    )?.toLowerCase(),
    dateMissing: post.lastSeenDate,
    postedBy: fields.postedBy,
    postUserId: fields.postUserId,
  };
};

const applyLocalFilters = (
  posts: SearchProfile[],
  filters: SearchFilters,
): SearchProfile[] => {
  const normalize = (value?: string | null) =>
    (value || "").trim().toLowerCase();

  return posts.filter((post) => {
    const location = normalize(post.location);
    const citySource = normalize(post.city);

    if (filters.city) {
      const cityNeedle = normalize(filters.city);
      const matchesCity =
        location.includes(cityNeedle) || citySource.includes(cityNeedle);
      if (!matchesCity) return false;
    }

    if (
      filters.location &&
      !normalize(post.rawLocation).includes(normalize(filters.location))
    ) {
      return false;
    }

    if (
      filters.clothing &&
      !normalize(post.rawClothing).includes(normalize(filters.clothing))
    ) {
      return false;
    }

    return true;
  });
};

export default function Search() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const resultsRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { token } = useAuth();

  // Extract the payload passed from Hero (if any)
  const initialQuery = location.state?.initialQuery || "";
  const initialImage = location.state?.initialImage || null;

  // The `tab` query string lets other pages (e.g. CreatePost on success)
  // open Search with the right tab pre-selected. Defaults to "missing".
  const initialTab = searchParams.get("tab") === "found" ? "found" : "missing";
  const [activeTab, setActiveTab] = useState<"missing" | "found">(initialTab);

  // Set initial filters using the query passed from Hero
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>({
    ...defaultSearchFilters,
    firstName: initialQuery.split(" ")[0] || "",
    lastName: initialQuery.split(" ").slice(1).join(" ") || "",
  });

  // New state to hold image search results
  const [isImageSearchActive, setIsImageSearchActive] =
    useState<boolean>(!!initialImage);
  const [rawPosts, setRawPosts] = useState<BackendPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());

  const cardsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // After a successful post creation we land here with `?scrollTo=results` —
  // wait for the results section to render, then smoothly scroll to it so
  // the user sees the cards immediately.
  useEffect(() => {
    if (searchParams.get("scrollTo") !== "results") return;
    if (isLoading) return;
    const timer = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [searchParams, isLoading]);

  const handleImageSearch = async (imageFile: File) => {
    setIsLoading(true);
    setError("");
    setIsImageSearchActive(true);

    const formData = new FormData();
    formData.append("searchImage", imageFile);

    try {
      const res = await axiosInstance.post("/posts/search-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // The AI API returns raw BackendPosts attached with `matchDistance`
      const postsFromApi = res.data.posts || [];
      setRawPosts(postsFromApi);
    } catch (err: unknown) {
      setRawPosts([]);
      if (isAxiosError(err)) {
        const errorMessage = (
          err.response?.data as { message?: string } | undefined
        )?.message;
        setError(
          errorMessage ??
            "Failed to search by image. Make sure there is a visible face.",
        );
      } else {
        setError(
          "Failed to search by image. Make sure there is a visible face.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Image Search Effect
  useEffect(() => {
    if (initialImage) {
      handleImageSearch(initialImage);
    }
  }, [initialImage]);

  // Fetch blocked users to hide their posts from the search results
  useEffect(() => {
    if (token) {
      userApi
        .getBlockedUsers(token)
        .then((res) => {
          setBlockedUserIds(new Set(res.blockedUsers.map((u) => u._id)));
        })
        .catch(console.error);
    } else {
      setBlockedUserIds(new Set());
    }
  }, [token]);

  useEffect(() => {
    // If an image search is active, we skip the normal textual fetch!
    if (isImageSearchActive) return;

    const fetchPosts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await postApi.getPosts({
          postType: activeTab,
          status: "active",
          firstName: appliedFilters.firstName || undefined,
          lastName: appliedFilters.lastName || undefined,
          ageMin: appliedFilters.ageMin || undefined,
          ageMax: appliedFilters.ageMax || undefined,
          hairColour: appliedFilters.hairColor || undefined,
          eyeColour: appliedFilters.eyeColor || undefined,
          gender: appliedFilters.gender || undefined,
          city: appliedFilters.city || undefined,
          dateMissing: appliedFilters.dateMissing || undefined,
          page: 1,
          limit: 20,
        });

        setRawPosts(response.data);
      } catch (fetchErr) {
        setError(
          fetchErr instanceof ApiError
            ? fetchErr.message
            : "Failed to load search results.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPosts();
  }, [activeTab, appliedFilters, isImageSearchActive]);

  // Re-map whenever the language flips so card copy (time, details, names,
  // locations) updates without needing a re-fetch.
  const posts = useMemo(
    () =>
      rawPosts
        .map((p) => mapBackendPostToCard(p, isRTL))
        .filter((p) => !blockedUserIds.has(p.postUserId || "")),
    [rawPosts, isRTL, blockedUserIds],
  );

  const filteredPosts = useMemo(() => {
    return applyLocalFilters(posts, appliedFilters);
  }, [posts, appliedFilters]);

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
  }, [activeTab, filteredPosts.length, isImageSearchActive]);

  const handleApplyFilters = (values: SearchFilters, shouldScroll = true) => {
    setAppliedFilters(values);

    if (shouldScroll) {
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col pt-8 pb-16 transition-colors duration-300"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex-1">
        <PageHeader
          navigatedTo={isRTL ? "البحث" : "Search"}
          title={isRTL ? "البلاغات النشطة" : "Active Reports"}
          subtitle={
            isRTL
              ? "ساعدنا في إعادتهم. تصفح حالات الأشخاص المفقودين النشطة."
              : "Help us bring them home. Browse active missing person cases."
          }
          showArrow={true}
        />
        <div className="max-w-400 mx-auto px-6 lg:px-12 w-full">
          <InfoBanner
            icon={<Info className="h-5 w-5" aria-hidden="true" />}
            title={t("search.tipLabel") || "Pro Tip:"}
            message={
              t("search.tipText") ||
              "Providing multiple filters helps narrow down the results effectively."
            }
            className="mt-4 mb-6"
          />

          {/* AI Image Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-8"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                {t("search.uploadImage") || "Upload Image for AI Recognition"}
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xl">
                {t("search.imageSearchDesc") ||
                  "Upload a photo to find potential matches using our facial recognition system."}
              </p>
            </div>

            <div className="max-w-4xl mx-auto w-full">
              <ImageUpload
                onImageChange={(file) => {
                  if (file) handleImageSearch(file);
                }}
                title={t("search.uploadSpaceTitle")}
                dragDropText={t("search.dragDrop")}
                subtitle={t("search.uploadHint")}
                buttonText={t("search.chooseFile") || t("search.browseFiles")}
                changeText={t("search.changePhoto")}
                removeText={t("search.remove")}
              />
            </div>
          </motion.div>

          {/* Divider: OR USE FILTERS */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-slate-200 flex-1 max-w-[100px]"></div>
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
              {t("search.orUseFilters") || "OR USE FILTERS"}
            </span>
            <div className="h-px bg-slate-200 flex-1 max-w-[100px]"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <SearchFiltersPanel onApplyFilters={handleApplyFilters} />
          </motion.div>

          {/* Results Area */}
          <motion.div
            ref={resultsRef}
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {!isImageSearchActive && (
              <UnderlineTabSelector
                options={[
                  {
                    value: "missing",
                    label: t("search.missingReports") || "Missing Reports",
                  },
                  {
                    value: "found",
                    label: t("search.foundPersons") || "Found Persons",
                  },
                ]}
                value={activeTab}
                onChange={(value) => setActiveTab(value as "missing" | "found")}
                indicatorLayoutId="activeTabIndicatorSearch"
              />
            )}

            {isImageSearchActive && (
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  {isRTL
                    ? "مطابقات البحث بالذكاء الاصطناعي"
                    : "AI Facial Search Matches"}
                </h3>
                <button
                  onClick={() => {
                    setIsImageSearchActive(false);
                    // Update location state to remove image so refresh doesn't trigger it
                    window.history.replaceState(
                      {},
                      "",
                      window.location.pathname + window.location.search,
                    );
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-red-500"
                >
                  {isRTL ? "إلغاء البحث بالصور" : "Clear Image Search"}
                </button>
              </div>
            )}

            {/* Cards Slider Display */}
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <p>{isRTL ? "جاري تحميل النتائج..." : "Loading results..."}</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-600 bg-white rounded-xl border border-dashed border-red-300">
                <p>{error}</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="relative">
                <motion.div
                  ref={cardsRef}
                  onScroll={updateScrollControls}
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex overflow-x-auto gap-4 md:gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {filteredPosts.map((profile, idx) =>
                    profile.type === "missing" ? (
                      <MissingPersonCard
                        key={profile.id}
                        profile={profile as unknown as ProfileData}
                        idx={idx}
                        isRTL={isRTL}
                      />
                    ) : (
                      <FoundPersonCard
                        key={profile.id}
                        profile={profile as unknown as ProfileData}
                        idx={idx}
                        isRTL={isRTL}
                      />
                    ),
                  )}
                </motion.div>

                {filteredPosts.length > 4 && canScrollLeft && (
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
                    className={`hidden md:flex absolute ${isRTL ? "-right-5" : "-left-5"} top-[42%] -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white shadow-md rounded-full border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-slate-800`}
                    aria-label="Scroll left"
                  >
                    {isRTL ? (
                      <ChevronRight className="w-6 h-6" />
                    ) : (
                      <ChevronLeft className="w-6 h-6" />
                    )}
                  </button>
                )}

                {filteredPosts.length > 4 && canScrollRight && (
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
                    className={`hidden md:flex absolute ${isRTL ? "-left-5" : "-right-5"} top-[42%] -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white shadow-md rounded-full border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-slate-800`}
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
            ) : (
              <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <SearchIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p>
                  {isRTL
                    ? `لا توجد بلاغات ${activeTab === "missing" ? "فقدان" : "عثور"} بهذه المعايير.`
                    : `No ${activeTab} reports found matching these criteria.`}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
