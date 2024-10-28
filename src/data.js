import dayjs from "dayjs";

class License {
  constructor(
    key,
    company,
    activate_date_time,
    expire_date,
    country,
    ai_type,
    hospital_name,
    user_name,
    serial_number,
    email,
    update,
    link
  ) {
    this.key = key;
    this.company = company;
    this.activate_date_time = activate_date_time;
    this.expire_date = expire_date;
    this.country = country;
    this.ai_type = ai_type;
    this.hospital_name = hospital_name;
    this.user_name = user_name;
    this.serial_number = serial_number;
    this.email = email;
    this.update = update;
    this.link = link;
  }
}

class Company {
  constructor(
    key,
    id,
    password,
    email,
    company_name,
    user_name,
    address,
    phone
  ) {
    this.key = key; // 회사코드
    this.id = id;
    this.password = password;
    this.email = email;
    this.company_name = company_name;
    this.user_name = user_name;
    this.address = address;
    this.phone = phone;
  }
}

export const countryCodes = [
  { code: "1", country: "United States" },
  { code: "82", country: "South Korea" },
  { code: "44", country: "United Kingdom" },
  { code: "81", country: "Japan" },
  { code: "49", country: "Germany" },
  { code: "86", country: "China" },
  { code: "33", country: "France" },
  { code: "39", country: "Italy" },
  { code: "91", country: "India" },
  { code: "61", country: "Australia" },
  { code: "55", country: "Brazil" },
  { code: "7", country: "Russia" },
  { code: "34", country: "Spain" },
  { code: "47", country: "Norway" },
  { code: "46", country: "Sweden" },
  { code: "52", country: "Mexico" },
  { code: "31", country: "Netherlands" },
  { code: "41", country: "Switzerland" },
  { code: "351", country: "Portugal" },
  { code: "27", country: "South Africa" },
];

export const dummyLisense = Array.from({ length: 100 }, (_, index) => {
  return new License(
    index,
    `company${index}`,
    dayjs().add(index, "day").format("YYYY-MM-DD HH:mm:ss"),
    dayjs().add(index, "day").format("YYYY-MM-DD HH:mm:ss"),
    countryCodes[Math.floor(Math.random() * countryCodes.length)].country,
    `ai_type${index}`,
    `hospital_name${index}`,
    `user_name${index}`,
    `serial_number${index}`,
    `email${index}@example.com`,
    dayjs().add(index, "day").format("YYYY-MM-DD HH:mm:ss"),
    `link${index}`
  );
});

export const dummyCompany = Array.from({ length: 100 }, (_, index) => {
  return new Company(
    generateRandomCode(),
    `id${index}`,
    `password${index}`,
    `email${index}@email.com`,
    `company${index}`,
    `user_name${index}`,
    `address${index}`,
    generateRandomPhoneNumber()
  );
});

function generateRandomCode(length = 12) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 사용할 문자 집합
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

function generateRandomPhoneNumber() {
  // 휴대폰 번호 앞자리
  const prefix = "010";

  // 0000 ~ 9999 범위의 랜덤 숫자를 생성하여 중간 네 자리와 마지막 네 자리를 생성
  const middle = String(Math.floor(1000 + Math.random() * 9000)).padStart(
    4,
    "0"
  );
  const last = String(Math.floor(1000 + Math.random() * 9000)).padStart(4, "0");

  // 형식에 맞춰 휴대폰 번호 반환
  return `${prefix}-${middle}-${last}`;
}
