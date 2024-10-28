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
