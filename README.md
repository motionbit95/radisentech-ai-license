# Radisentech AI License

> 이 문서는 Radisentech의 AI License 관리 프로그램 개발 용역의 산출물 제공을 목적으로 작성되었습니다.

| 배포 버전 | 작성일     | 작성자 |
| --------- | ---------- | ------ |
| 1.0.0     | 2024.11.21 | 박수정 |
| current   |            |        |

주의 : 일부 가이드는 _`mac OS` 운영체제를 기반으로 작성되었습니다._

## 🚀 스택

<img src="https://img.shields.io/badge/figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white">
<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black">
<img src="https://img.shields.io/badge/create react app-09D3AC?style=for-the-badge&logo=react&logoColor=white">
<img src="https://img.shields.io/badge/ant design-0170FE?style=for-the-badge&logo=ant design&logoColor=white">
<br/>
<img src="https://img.shields.io/badge/google firebase-DD2C00?style=for-the-badge&logo=firebase&logoColor=white">
<img src="https://img.shields.io/badge/node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white">
</br/>
<img src="https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white">
<img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
</br/>
<img src="https://img.shields.io/badge/amazon rds-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white">
<img src="https://img.shields.io/badge/aws lambda-FF9900?style=for-the-badge&logo=awslambda&logoColor=white">
<img src="https://img.shields.io/badge/amazons3-569A31?style=for-the-badge&logo=amazons3&logoColor=white">
<br/>
<img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">
<img src="https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">

## ⛓️ 아키텍쳐

<img src="https://firebasestorage.googleapis.com/v0/b/motionbit-admin.appspot.com/o/%E1%84%8B%E1%85%A1%E1%84%8F%E1%85%B5%E1%84%90%E1%85%A6%E1%86%A8%E1%84%8E%E1%85%A7.png?alt=media&token=5dd46442-296b-465d-a611-ceca14c92f17">

## 📂 소스코드 구조

```bash
📂 radisentech-ai-license/      # 프로젝트 리포지토리 폴더입니다.
  📂 lambda-api/                # Express 기반 서버 소스 코드 폴더입니다.
      📄 .env                   # 환경 변수를 저장합니다.
      📄 index.mjs              # Express 애플리케이션의 진입점 파일입니다.
      📄 package.json           # 프로젝트의 의존성과 스크립트를 정의합니다.
      📂 node_modules/          # 외부 패키지 설치 파일들이 위치합니다.
      📂 routes/                # 라우터 파일들을 저장합니다.
          📄 company-router.js  # 회사 관련 라우터를 정의합니다.
          📄 license-router.js  # 라이선스 관련 라우터를 정의합니다.
          📄 product-router.js  # 제품군 관련 라우터를 정의합니다.
      📂 controller/            # 라우터에서 호출되는 비즈니스 로직(컨트롤러)을 정의합니다.
          📄 common.js          # 공통 로직이 포함된 컨트롤러입니다.
          📄 auth.js            # 사용자 인증 처리 컨트롤러입니다 (JWT 사용).
          📄 mailer.js          # 인증 메일 발송을 위한 컨트롤러입니다 (Nodemailer 사용).
          📄 mysql.js           # MySQL 데이터베이스 연결 컨트롤러입니다.
  📂 node_modules/              # 외부 패키지 설치 파일들이 위치합니다.
  📂 src/
      📂 component/             # 재사용 가능한 UI 컴포넌트를 저장합니다.
      📂 modal/                 # 모달 컴포넌트들을 저장합니다.
      📂 page/                  # 페이지 컴포넌트들을 저장합니다.
      📄 App.js                 # 메인 App 컴포넌트 파일입니다.
      📄 api.js                 # REST API 호출 함수가 정의되어 있습니다.
      📄 index.js               # 애플리케이션의 엔트리 포인트 파일입니다.
      📄 index.css              # 애플리케이션의 전역 스타일 파일입니다.
  📂 public/                    # 정적 파일들을 저장합니다.
      📄 index.html             # 메인 HTML 파일입니다.
      📄 favicon.ico            # 웹사이트의 파비콘 파일입니다.
      📄 manifest.json          # PWA 설정 파일입니다.
      📄 robots.txt             # 검색 엔진 크롤러를 위한 설정 파일입니다.
  📄 package.json               # 프로젝트의 의존성과 스크립트를 정의합니다.
  📄 README.md                  # 프로젝트에 대한 설명을 담은 README 파일입니다.
```

## 🎨 UI/UX 스타일 가이드

> 전체적으로 Ant Design의 컴포넌트들을 활용하여 구성하였습니다.<br/>
> 하단 링크에서 컴포넌트 사용에 대한 Document 확인 가능합니다!<br/>[👉 Ant Design 바로가기](https://ant.design/)

## 개발 환경 구성 & 배포 환경 구성

### # Node 설치

AWS Lambda 함수의 런타임이 20.x로 설정되있으므로 v20 설치를 권장합니다.

```bash
$ node -v
v20.18.0
$ npm -v
v10.8.2

# 만약 설치가 안되어있다면 공식 사이트 https://nodejs.org에서 다운로드
# 혹은 homebrew가 설치되어있다면 아래 명령어 실행(mac OS의 경우)
$ brew install node

# 또는 nvm이 설치되어있다면 하단 방법으로도 가능
$ nvm install node       # 최신 버전 설치
$ nvm install 20         # 특정 버전 설치
```

### # CRA 설치(Create React App)

```bash
# CRA를 전역으로 설치
$ npm install -g create-react-app

# 새로운 리액트 애플리케이션을 생성
$ create-react-app my-app

# CRA 기본 폴더 구조
my-app/
├── node_modules/           # 프로젝트 의존성
├── public/                 # 공용 파일 (index.html)
│   └── index.html          # HTML 템플릿 파일
├── src/                    # 소스 파일
│   ├── App.css             # 스타일 파일
│   ├── App.js              # 주요 React 컴포넌트
│   ├── index.css           # 초기 스타일 파일
│   └── index.js            # React 앱의 진입점
├── package.json            # 프로젝트 설정 및 의존성 정보
├── package-lock.json       # 정확한 의존성 버전 고정
└── .gitignore              # Git 무시 파일
```

### # React와 Node.js 서버 실행(dev)

```bash
# git에서 코드를 복제합니다.
$ git clone https://github.com/motionbit95/radisentech-ai-license.git

# 프로젝트 폴더로 이동합니다.
$ cd radisentech-ai-license

# npm을 사용하여 외부 의존성 패키지를 설치합니다.
$ npm install

# 프론트엔드 서버 실행(React 코드)
$ npm start

# 백엔드 서버 실행(Node.js Express 서버)
$ cd lambda-api
$ npm install
$ npm start
```

## AWS Lambda 연동

### # Lambda 함수 권한 설정

AWS 관리자는 Lambda 함수를 생성하는 개발자 계정에 일부 권한을 허용 해야합니다.
(실적용은 이미 역할 및 권한이 설정된 사용자의 계정을 전달받아 진행했습니다.)

### # 사용자 생성

1. AWS 서비스에서 `IAM` 콘솔에 접속합니다.
2. 액세스 관리 > 사용자 탭을 선택합니다.
3. 사용자를 생성합니다.
4. 아래 권한을 추가합니다.<br/>
   `AWSLambda_FullAccess`<br/>
   `AWSLambdaBasicExecutionRole`<br/>
   `AWSLambdaVPCAccessExecutionRole`<br/>
5. 사용자를 생성하면 `aws access key`와 `aws secret key`가 생성됩니다. `aws secret key`는 해당 페이지에서 한번만 노출되니 안전한 곳에 보관해주세요.

### # 역할 생성

1. AWS 서비스에서 `IAM` 콘솔에 접속합니다.
2. 액세스 관리 > 역할 탭을 선택합니다.
3. 역할을 생성합니다.
4. 신뢰할 수 있는 엔터티 유형 `AWS 서비스`, 사용 사례 `Lambda`를 선택합니다.
5. 아래 권한을 추가합니다.<br/>
   `AWSLambda_FullAccess`<br/>
   `AWSLambdaBasicExecutionRole`<br/>
   `AWSLambdaVPCAccessExecutionRole`<br/>
6. 역할 인스턴스의 `ARN`을 복사해둡니다.(AWS CLI를 통해 Lambda 배포를 위함)

### # AWS 설치

```bash
$ brew install awscli
$ aws --version
```

### # AWS 구성

```bash
$ aws configure
# AWS Access Key ID와 AWS Secret Access Key를 입력합니다.
# Default region name을 입력해주세요.
```

> AWS Access Key ID [****************LYH2]<br/>
> AWS Secret Access Key [****************C21p]<br/>
> Default region name [ap-northeast-2]<br/>

### # Lambda 함수 코드 zip 업로드 방법

```bash
# update 할 코드를 압축한 zip 생성
$ zip -r license-node-api .

# 함수 생성 - 이미 생성되어있는 함수(license-cert)를 사용했습니다. 새로 생성하실 때 참고하세요.
$ aws lambda create-function \
  --function-name [함수 이름] \
  --runtime nodejs20.x \
  --role [역할 ARN] \
  --handler index.handler \
  --zip-file fileb://[파일 이름].zip

# ✨ 함수 업데이트(cli에서 업데이트 하는 방법) / 직접 AWS Lambda 콘솔에 접속하셔서 업데이트 하셔도 됩니다.
$ aws lambda update-function-code \
  --function-name license-cert \
  --zip-file fileb://license-node-api.zip

# 함수 삭제
$ aws lambda delete-function --function-name [함수이름]
```

<strong>🎉 [Swagger API 문서](https://mcmv6di62bcfme7upmi2xyk2ha0qdlfn.lambda-url.ap-northeast-2.on.aws/api-docs/)에서 배포된 함수의 REST API를 테스트 해볼 수 있습니다!</strong>

## AWS RDS 연동

### # AWS RDS 생성

1. AWS 서비스에서 RDS를 선택합니다.
2. 데이터베이스 생성을 선택합니다.
3. 아래와 같이 옵션을 선택합니다.
   > 데이터베이스 생성 방식 선택 : 표준 생성<br/>
   > 엔진 옵션 : MySQL<br/>
   > 엔진 버전 : MySQL 8.0.28<br/>
   > 템플릿 : 프리 티어<br/>
   > DB 인스턴스 식별자, 마스터 사용자 이름, 마스터 암호 : 원하는 대로<br/>
   > 인스턴스 구성 : 버스터블 클래스, db.t3.micro<br/>
   > 스토리지 유형 : 범용 SSD(gp2)<br/>
   > 할당된 스토리지 : 20<br/>
   > 최대 스토리지 임계값 : 100<br/>
   > 컴퓨팅 리소스 : EC2 컴퓨팅 리소스에 연결 안 함<br/>
   > 네트워크 유형 : IPv4<br/>
   > 퍼블릭 액세스 : 예 (가능)<br/>
   > VPC 보안 그룹(방화벽) : 위에서 만든 보안그룹 선택<br/>
   > 데이터베이스 인증 옵션 : 암호 인증<br/>
4. 데이터 베이스를 생성합니다.

실제로는 이미 생성되어있는 RDS를 사용하였습니다.

### Express에 MySQL 설치

```bash
$ npm install mysql2
```

### .env 파일에서 MySQL 환경변수 추가

```bash
# 아래 부분을 RDS MySQL 설정값에 맞게 추가해주세요.
DB_HOST=""
DB_USER=""
DB_PASSWORD=""
DB_NAME=""
```

## AWS S3 연동

### # React 애플리케이션 빌드

React 애플리케이션을 AWS S3에 배포하려면 먼저 애플리케이션을 빌드해야 합니다.

```bash
$ npm run build
```

### # S3 버킷에 업로드

주의 : 파일 선택과 폴더 선택이 구분되어있습니다. 폴더 선택 하셔서 `static/` 폴더 꼭 넣어주세요!<br/>
`build/` 폴더 안에 있는 모든 파일을 선택하여 S3 버킷에 드래그 앤 드롭으로 업로드하셔도 됩니다.

### # CloudFront 설정

CloudFront 콘솔에서 해당 도메인의 무효화를 생성해줘야한다고 합니다.<br/>
객체 경로를 전체(/\*)로 설정해주세요.

<strong>🎉 이제 [Radisen AI License](https://license.radisen.com)에서 배포된 리액트 애플리케이션을 확인할 수 있습니다!</strong>
