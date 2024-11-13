import { Button, Form, Modal } from "antd";
import React, { useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const Agreement = (props) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 폼 제출 시 실행되는 함수
  const onAddFinish = (values) => {};
  return (
    <>
      {/* 라이선스 추가 버튼 */}
      <a onClick={() => setModalOpen(true)}>agreement</a>

      {/* 모달 (width로 넓이 설정 가능) */}
      <Modal
        title="Agreement"
        centered
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={() => setModalOpen(false)}
          >
            OK
          </Button>,
        ]}
      >
        {/* Agreement (내용 입력 및 스타일 변경 가능) */}
        <div style={{ minHeight: "150px" }}>Example</div>
      </Modal>
    </>
  );
};

export default Agreement;
