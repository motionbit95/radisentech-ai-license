import React, { useState } from "react";
import { Button, Modal, Table } from "antd";
const LicenseHistoryModal = (props) => {
  const { title, history } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <a onClick={showModal}>{title}</a>
      <Modal
        title="License History"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        width={800}
      >
        <Table
          dataSource={history}
          columns={[]}
          pagination={{
            defaultCurrent: 1,
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Modal>
    </>
  );
};
export default LicenseHistoryModal;