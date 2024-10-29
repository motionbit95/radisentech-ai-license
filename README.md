본 문서는 `MAC OS` 기준으로 서술되었습니다.

# AWS IAM 설정 방법

## 사용자 생성

1. AWS 서비스에서 `IAM` 콘솔에 접속합니다.
2. 액세스 관리 > 사용자 탭을 선택합니다.
3. 사용자를 생성합니다.
4. 아래 권한을 추가합니다.
   > AWSLambda_FullAccess<br/>
   > AWSLambdaBasicExecutionRole<br/>
   > AWSLambdaVPCAccessExecutionRole<br/>
5. 사용자를 생성하면 aws access key와 aws secret key가 생성됩니다. aws secret key는 해당 페이지에서 한번만 노출되니 안전한 곳에 보관해주세요.

## 역할 생성

1. AWS 서비스에서 `IAM` 콘솔에 접속합니다.
2. 액세스 관리 > 역할 탭을 선택합니다.
3. 역할을 생성합니다.
4. 신뢰할 수 있는 엔터티 유형 `AWS 서비스`, 사용 사례 `Lambda`를 선택합니다.
5. 아래 권한을 추가합니다.
   > AWSLambda_FullAccess<br/>
   > AWSLambdaBasicExecutionRole<br/>
   > AWSLambdaVPCAccessExecutionRole<br/>
6. 역할 인스턴스의 ARN을 복사해둡니다.

# AWS Lambda - node.js 연동 방법

## AWS 설정

### AWS 설치

```bash
brew install awscli
aws --version
```

### AWS 구성

```bash
aws configure
```

`AWS Access Key ID`와 `AWS Secret Access Key`를 입력합니다.
`Default region name`을 입력해주세요.

> AWS Access Key ID [****************LYH2]<br/>
> AWS Secret Access Key [****************C21p]<br/>
> Default region name [us-east-1]<br/>

## Lambda 함수 코드 zip 업로드 방법

### zip 생성

```bash
zip -r api .
```

### 함수 생성

```bash
aws lambda create-function \
  --function-name [함수 이름] \
  --runtime nodejs18.x \
  --role [역할 ARN] \
  --handler index.handler \
  --zip-file fileb://[파일 이름].zip
```

### 함수 업데이트

```bash
aws lambda update-function-code \
  --function-name [함수 이름] \
  --zip-file fileb://[파일 이름].zip
```

### 함수 삭제

```bash
aws lambda delete-function --function-name [함수이름]
```

# AWS RDS(MySQL) - node.js 연동 방법

## AWS RDS 생성 방법

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

## VS Code에서 Database Client 사용하기

1. VS Code에 MySQL 확장 프로그램(Weijan Chen)을 설치합니다.
2. Hostname과 옵션에서 설정했던 마스터 사용자 이름과 암호를 입력합니다.
3. Connect 합니다.

## node.js에 MySQL 연동하기

1. MySQL 설치

```bash
npm install mysql2
```

2. env 변수 설정
   .env 파일에 AWS RDS DB 변수를 설정합니다.
