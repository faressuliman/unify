import { postApi } from "./api";

// النقاط المرجعية الرئيسية لتوزيع الحالات عليها مع إضافة عشوائية للإحداثيات
const EGYPT_REGIONS = [
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Alexandria", lat: 31.2001, lng: 29.9187 },
  { name: "Aswan", lat: 24.0889, lng: 32.8998 },
  { name: "Luxor", lat: 25.6872, lng: 32.6396 },
  { name: "Asyut", lat: 27.1783, lng: 31.1859 },
  { name: "Sohag", lat: 26.557, lng: 31.6948 },
  { name: "Ismailia", lat: 30.5965, lng: 32.2715 },
  { name: "Port Said", lat: 31.2565, lng: 32.2841 },
  { name: "Suez", lat: 29.9668, lng: 32.5498 },
  { name: "Mansoura", lat: 31.0409, lng: 31.3785 },
  { name: "Tanta", lat: 30.7865, lng: 31.0004 },
  { name: "Zagazig", lat: 30.5877, lng: 31.5167 },
  { name: "Fayyum", lat: 29.3084, lng: 30.8428 },
  { name: "Minya", lat: 28.1099, lng: 30.7503 },
  { name: "Qena", lat: 26.1642, lng: 32.7267 },
  { name: "Beni Suef", lat: 28.0871, lng: 30.7531 },
  { name: "Hurghada", lat: 27.2579, lng: 33.8116 },
  { name: "Sharm El-Sheikh", lat: 27.9158, lng: 34.3299 },
  { name: "Marsa Matrouh", lat: 31.3525, lng: 27.2373 },
  { name: "Al Kharga", lat: 26.1551, lng: 32.716 },
  { name: "Banha", lat: 30.4667, lng: 31.1833 },
  { name: "Kafr El Sheikh", lat: 31.1107, lng: 30.9388 },
  { name: "Dakhla Oasis", lat: 25.5167, lng: 28.9667 },
  { name: "Siwa Oasis", lat: 29.2, lng: 25.5167 },
  { name: "Al Arish", lat: 31.1316, lng: 33.7984 },
  { name: "Sallum", lat: 31.5167, lng: 25.15 },
  { name: "Halayeb", lat: 22.2155, lng: 36.6385 },
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomCases(count: number) {
  const firstNamesMale = [
    "Omar",
    "Ahmed",
    "Ali",
    "Mahmoud",
    "Youssef",
    "Kareem",
    "Tarek",
    "Mostafa",
    "Ziad",
    "Hassan",
    "Khaled",
    "Amr",
    "Mazen",
    "Yassin",
  ];
  const firstNamesFemale = [
    "Laila",
    "Nour",
    "Fatma",
    "Mariam",
    "Salma",
    "Hana",
    "Aisha",
    "Habiba",
    "Nada",
    "Yasmin",
    "Mona",
    "Dina",
    "Heba",
    "Jana",
  ];
  const lastNames = [
    "Hassan",
    "Ibrahim",
    "Ali",
    "Mahmoud",
    "Mohamed",
    "Fawzy",
    "Kamal",
    "Tarek",
    "Sami",
    "Gaber",
    "Farouk",
    "El-Sayed",
    "Osman",
  ];
  const eyeColors = ["Brown", "Black", "Blue", "Green", "Hazel"];
  const hairColors = ["Black", "Brown", "Blonde", "Grey", "White"];

  const cases = [];
  for (let i = 0; i < count; i++) {
    const isMissing = Math.random() > 0.5;
    const gender = Math.random() > 0.5 ? "male" : "female";
    const firstName =
      gender === "male"
        ? getRandomItem(firstNamesMale)
        : getRandomItem(firstNamesFemale);
    const lastName = getRandomItem(lastNames);
    const region = getRandomItem(EGYPT_REGIONS);

    // إحداثيات عشوائية تماماً داخل النطاق الجغرافي لجمهورية مصر العربية لضمان عدم التكرار أبداً
    const randomLat = 22.1 + Math.random() * (31.2 - 22.1);
    const randomLng = 25.0 + Math.random() * (34.8 - 25.0);

    const caseData: any = {
      postType: isMissing ? "missing" : "found",
      firstName: isMissing ? firstName : "Unknown",
      lastName: isMissing ? lastName : gender === "male" ? "Boy" : "Girl",
      age: getRandomInt(2, 60),
      ageUnit: "years",
      gender: gender,
      hairColour: getRandomItem(hairColors),
      eyeColour: getRandomItem(eyeColors),
      clothesDescription: `Wearing random generated outfit #${getRandomInt(100, 999)}.`,
      city: region.name,
      latitude: randomLat,
      longitude: randomLng,
    };

    if (isMissing) {
      caseData.lastSeenLocation = `Near ${region.name} Area`;
      const date = new Date();
      date.setDate(date.getDate() - getRandomInt(1, 60));
      caseData.lastSeenDate = date.toISOString().split("T")[0];
    } else {
      caseData.foundLocation = `Found somewhere around ${region.name}`;
      caseData.affiliation = "none";
      caseData.reporterPhone =
        "01" + Math.floor(100000000 + Math.random() * 900000000).toString();
    }
    cases.push(caseData);
  }
  return cases;
}

// Helper function to download random avatar avatars and convert them to valid File objects
async function getDummyImageFile(name: string): Promise<File> {
  try {
    const response = await fetch(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random&font-size=0.33`,
    );
    const blob = await response.blob();
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch (error) {
    console.error("Failed to fetch dummy image, using empty file", error);
    return new File([""], "empty.jpg", { type: "image/jpeg" });
  }
}

export const seedDummyData = async (
  token: string,
  onProgress?: (msg: string) => void,
) => {
  let count = 0;
  const generatedCases = generateRandomCases(10); // إنشاء 10 حالات عشوائية في كل ضغطة
  for (const caseData of generatedCases) {
    try {
      if (onProgress)
        onProgress(`Generating dummy image for ${caseData.firstName}...`);
      const photo = await getDummyImageFile(caseData.firstName);

      if (onProgress) onProgress(`Creating post for ${caseData.firstName}...`);
      await postApi.createPost(
        {
          ...caseData,
          photos: [photo],
        },
        token,
      );
      count++;
    } catch (error) {
      console.error(
        `Failed to create dummy post for ${caseData.firstName}`,
        error,
      );
      if (onProgress)
        onProgress(`Failed to create post for ${caseData.firstName}.`);
    }
  }
  if (onProgress) onProgress(`Successfully created ${count} dummy posts!`);
};
