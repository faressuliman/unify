export interface MissingPerson {
  id: string;
  name: string;
  type: 'missing' | 'found';
  status: string;
  location: string;
  timeAgo: string;
  details: string;
  image?: string;
  city?: string;
}

export const mockPosts: MissingPerson[] = [
  {
    id: '8821',
    name: 'Ahmed Mansour',
    type: 'missing',
    status: 'Recently Spotted',
    location: 'Maadi, Cairo',
    timeAgo: '2 days ago',
    details: 'Male, 28 years old',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7n1uWiSEueENl4tMFJmMdBwUopwS2AP_7f7d56aK8v0DzAsHUgPWICRmQm3L29acCvv4wzikHc9Lk5oP_-GXJBiZ4NvMWODkwXQ31f-9yNqEXhAdQf8-IfXkSgW6gke-Xd46P2Bs0tifvwCQr1T194CCuqFKlG9o8PfsiDOZOctjkYewCBp6BmxBxD03pHtMRn-ojndOTzt88jRy5Iqd7mOB3Xj8YAbXA_olluPg58vafLfzxYPbGoEvPzHS_FzQW3_HHOflE7R_4'
  },
  {
    id: '8822',
    name: 'Unknown Person',
    type: 'found',
    status: 'Safe',
    location: 'Alexandria',
    timeAgo: '5 hours ago',
    details: 'Female, ~24 years old',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkRFWq-zWXPf77DHNZEhXhkhl9naa-RWCxmKIePY17BVk-XFFRjV7WnxD2k34LdQKbdcEDVPZyj8ymo_klYeoGJiOJ6_D9Ai6Uy60D4-NRowIX5LmOumM0wq5cs28ZIdwm4t3PdXaci2bWm7ApdULRmDBZ97DXPr7fA2e9MyZ53Bf6NmwUHO2H2Io8neUPjz3AJVUsgL7T5XuXyT-eL_IMM03MIYxoBBrMYABZavZ_FPRKYederogZi63wcfpwsqb_kg34G-xiyjUw'
  },
  {
    id: '8823',
    name: 'Omar Hassan',
    type: 'missing',
    status: 'New Alert',
    location: 'Giza',
    timeAgo: '1 day ago',
    details: 'Male, 8 years old',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnhH0u1eryEHbN8R_jWVqwgToamhmVCEeSs5QXMLgRYUjquGarA1AQIxaqL_m18G4GmxoXEjNDkBLaNh_slI84bwTNXuvLkqTV-STaUATODmZ95N8eZ_2ksBgtzDahqzyzHcZrias9CIqaqEua5QOkQplgn8I9SGTh1deFH-gZpJJlIKrSB3zfzAkw0xRmXmhT8c7nF0WjZYsXlfnc-PyCf__z4QJ0_2Wu2i7O48X2u2SahSANUFtRRefS-Lxl4gCPTGNmcj2zIoI-'
  },
  {
    id: '8824',
    name: 'Unknown Person',
    type: 'found',
    status: 'At Hospital',
    location: 'Mansoura',
    timeAgo: '3 days ago',
    details: 'Female, 16 years old',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMRvtSFBN7-X6hhu8w-12Ygaqpv-gyqC92kTjK7uAtwJamac0x_5PFmOFpcHK7tfCbNWUT2RHWw6fIIK5-R00XWeGhnQictj8Zyuxbckh17PiTWP0YJnwa0wAm3lOgT9qzHO1MujT3_ULi1zBPnUKaOa4GBCdzBc5fLtsggGGCBC4HH1DZUHWe4K_25s5LQA8Oa3LA7Bkn6MrTuffwIcoa04hoXCsr2oZMF-aB94jzTLfEGE3lConDVOajuSzjT3jfhXM00iR1CGS2'
  },
  {
    id: '8825',
    name: 'Mariam Salah',
    type: 'missing',
    status: 'Needs Follow-up',
    location: 'Nasr City, Cairo',
    timeAgo: '6 hours ago',
    details: 'Female, 14 years old',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80'
  }
];