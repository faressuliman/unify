import { postApi } from "./api";

const DUMMY_CASES = [
  {
    postType: "missing" as const,
    firstName: "Omar",
    lastName: "Hassan",
    age: 8,
    ageUnit: "years" as const,
    gender: "male" as const,
    hairColour: "Black",
    eyeColour: "Brown",
    clothesDescription:
      "Wearing a yellow t-shirt with a cartoon logo and blue jeans.",
    city: "Alexandria",
    lastSeenLocation: "San Stefano club entrance",
    lastSeenDate: "2023-10-10",
    latitude: 31.24,
    longitude: 29.96,
  },
  {
    postType: "missing" as const,
    firstName: "Laila",
    lastName: "Mahmoud",
    age: 5,
    ageUnit: "years" as const,
    gender: "female" as const,
    hairColour: "Brown",
    eyeColour: "Green",
    clothesDescription: "Pink dress and white shoes. Carrying a small doll.",
    city: "Cairo",
    lastSeenLocation: "Al Azhar Park, near the fountains",
    lastSeenDate: "2023-11-02",
    latitude: 30.04,
    longitude: 31.26,
  },
  {
    postType: "missing" as const,
    firstName: "Kareem",
    lastName: "Ali",
    age: 12,
    ageUnit: "years" as const,
    gender: "male" as const,
    hairColour: "Black",
    eyeColour: "Brown",
    clothesDescription: "School uniform: light blue shirt and dark blue pants.",
    city: "Giza",
    lastSeenLocation: "Dokki, Street 9",
    lastSeenDate: "2023-11-15",
    latitude: 30.038,
    longitude: 31.21,
  },
  {
    postType: "found" as const,
    firstName: "Unknown",
    lastName: "Child",
    age: 4,
    ageUnit: "years" as const,
    gender: "male" as const,
    hairColour: "Blonde",
    eyeColour: "Blue",
    clothesDescription:
      "Found wearing a red sweater and grey sweatpants. Cannot speak clearly.",
    city: "Mansoura",
    foundLocation: "Gihan Street, next to the central hospital",
    affiliation: "hospital",
    organizationName: "Mansoura Central Hospital",
    reporterPhone: "01001234567",
    latitude: 31.0409,
    longitude: 31.3785,
  },
  {
    postType: "found" as const,
    firstName: "Unknown",
    lastName: "Girl",
    age: 6,
    ageUnit: "years" as const,
    gender: "female" as const,
    hairColour: "Black",
    eyeColour: "Brown",
    clothesDescription:
      "Green jacket, missing one shoe. She says her name is 'Nour'.",
    city: "Aswan",
    foundLocation: "Corniche El Nile",
    affiliation: "shelter",
    organizationName: "Aswan Hope Shelter",
    reporterPhone: "01112223334",
    latitude: 24.0889,
    longitude: 32.8998,
  },
  {
    postType: "missing" as const,
    firstName: "Youssef",
    lastName: "Ibrahim",
    age: 15,
    ageUnit: "years" as const,
    gender: "male" as const,
    hairColour: "Brown",
    eyeColour: "Hazel",
    clothesDescription: "Black hoodie, ripped blue jeans, black cap.",
    city: "Tanta",
    lastSeenLocation: "Tanta Railway Station",
    lastSeenDate: "2023-11-20",
    latitude: 30.7865,
    longitude: 31.0004,
  },
];

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
  for (const caseData of DUMMY_CASES) {
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
