import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

export function IniFileDownload(props) {
  const handleDownload = (code) => {
    // 1. INI 파일 내용 생성
    const data = {
      Config: {
        UniqueCode: code,
      },
    };

    // 2. INI 형식으로 변환
    const iniContent = Object.entries(data)
      .map(([section, pairs]) => {
        const sectionHeader = `[${section}]`;
        const keyValues = Object.entries(pairs)
          .map(([key, value]) => `${key}=${value}`)
          .join("\n");
        return `${sectionHeader}\n${keyValues}`;
      })
      .join("\n\n");

    // 3. Blob 생성 및 다운로드 링크 설정
    const blob = new Blob([iniContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // 4. 다운로드 링크 생성 및 클릭
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.ini";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    // 5. 다운로드 링크 제거
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      size="small"
      icon={<DownloadOutlined />}
      onClick={() => handleDownload(props.code)}
    />
  );
}

export default IniFileDownload;
