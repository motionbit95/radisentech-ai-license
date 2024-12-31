import dotenv from "dotenv"; // dotenv 모듈 가져오기
import express from "express"; // express 모듈 가져오기
import cors from "cors"; // cors 모듈 가져오기
import serverless from "serverless-http"; // serverless-http 모듈 가져오기
import mysql from "mysql2/promise"; // mysql2 모듈 가져오기
import swaggerJsDoc from "swagger-jsdoc"; // swagger-jsdoc 모듈 가져오기
import swaggerUi from "swagger-ui-express"; // swagger-ui-express 모듈 가져오기

dotenv.config(); // 환경 변수 로드

const app = express();

// Swagger 설정
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Radisen AI License API",
      version: "1.1.0",
      description: `
### 테스트용 JWT 토큰
아래의 JWT 토큰을 사용하여 테스트할 수 있습니다:

- **토큰**: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0VXNlcl8xMjM0NTYiLCJpYXQiOjE2MDQ3NTI0NzQsImV4cCI6MzMwMjM3MTYwMH0.abc123def456ghi789jkl0mnopqrstuvwxy\`

- **유효기간**: 10년
- **사용자 ID**: \`Radisen\` (고유한 테스트용 ID)

⚠️ **주의**: 이 토큰은 실제 환경에서는 사용하지 마십시오.
      `,
    },
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
    security: [
      {
        Bearer: [],
      },
    ],
  },
  apis: [
    "./routes/company-router.js",
    "./routes/license-router.js",
    "./routes/product-router.js",
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI 초기화 시 requestInterceptor 설정 추가
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
      docExpansion: "none", // 기본적으로 모든 API를 축소
      filter: true,
      requestInterceptor: (req) => {
        if (
          req.headers.Authorization &&
          !req.headers.Authorization.startsWith("Bearer ")
        ) {
          req.headers.Authorization = `Bearer ${req.headers.Authorization}`;
        }
        return req;
      },
    },
  })
);

const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors());

// 라우터 설정
import companyRouter from "./routes/company-router.js";
app.use("/company", companyRouter);

import licenseRouter from "./routes/license-router.js";
app.use("/license", licenseRouter);

import productRouter from "./routes/product-router.js";
app.use("/product", productRouter);

// 로컬에서 실행될 때를 위한 서버 설정 (Lambda 배포 시에는 불필요)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Lambda 핸들러로 Express 앱을 래핑
export const handler = serverless(app);
