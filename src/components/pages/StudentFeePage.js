import React, { useState, useEffect } from "react";
import {
  Container,
  ProgressBar,
  Row,
  Col,
  Modal,
  Button,
  ButtonGroup,
  Spinner
} from "react-bootstrap";
import { Header, Footer, CustomModal } from "../organisms";
import { withRouter } from "react-router-dom";
import { BoardHeader } from "../molecules";

import * as paymentAPI from "../../lib/api/payment";
import * as cancelRequestAPI from "../../lib/api/cancelRequest";
import "./StudentFeePage.scss";

import { useTranslation } from "react-i18next";

const StudentFeePage = () => {
  const [payments, setPayments] = useState([]);
  const [cancelPayment, setCancelPayment] = useState();
  const [loading, setLoading] = useState(true);

  const handleCancel = () => setCancelPayment(true);
  const handleNotCancel = () => setCancelPayment(false);

  const [show, setShow] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  const { t } = useTranslation(["StudentFeePage", "Label"]);

  const paymentDeadline = new Date() < new Date(2020, 9, 19);
  const handleModalCloseAndRefresh = () => {
    handleModalOpen("");
    window.location.reload(false);
  };
  const handleModalOpen = current => {
    setShow(current === "pay");
    setShowSuccessModal(current === "success");
    setShowFailModal(current === "fail");
  };

  // const handleClose = () => setShow(false);
  const handleShow = () => {
    if (!paymentDeadline) {
      alert(t("납부 기간이 지났습니다."));
      return;
    }
    setShow(true);
  };

  useEffect(() => {
    paymentAPI.list().then(res => {
      const payments = res.data.payments;
      payments.sort((a, b) => {
        if (a.year === b.year) return a.semester !== "fall" ? 1 : -1;
        return b.year - a.year;
      });
      setPayments(payments);
      setLoading(false);
    });
    cancelRequestAPI.getOne().then(res => {
      const cancelRequest = res.data;
      if (cancelRequest.length > 0) setCancelPayment(true);
      else setCancelPayment(false);
    });
  }, []);

  const handleSubmit = () => {
    if (cancelPayment) {
      cancelRequestAPI
        .write({ year: 2020, semester: "fall" })
        .then(res => {
          handleModalOpen("success");
        })
        .catch(err => {
          handleModalOpen("fail");
        });
    } else {
      cancelRequestAPI
        .remove({ year: 2020, semester: "fall" })
        .then(res => {
          handleModalOpen("success");
        })
        .catch(err => {
          handleModalOpen("fail");
        });
    }
  };

  return (
    <div style={{ minHeight: "100vh" }} className="d-flex flex-column">
      <CustomModal
        title={t(`저장되었습니다.`)}
        show={showSuccessModal}
        handleConfirm={handleModalCloseAndRefresh}
        handleClose={handleModalCloseAndRefresh}
        confirmMessage={t("확인")}
      />
      <CustomModal
        title={t(`⚠️저장 중 오류가 발생했습니다.`)}
        show={showFailModal}
        handleConfirm={handleModalCloseAndRefresh}
        handleClose={handleModalCloseAndRefresh}
        confirmMessage={t("확인")}
      />
      <Modal show={show} onHide={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t("2020년도 가을학기 학생회비 납부")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
              <div>{t("학생회비를 납부하시겠습니까?")}</div>
            </div>
            <ButtonGroup className="align-center">
              <Button
                variant={cancelPayment ? "outline-primary" : "primary"}
                className="request-button"
                onClick={handleNotCancel}
              >
                {t("납부")}
              </Button>
              <Button
                variant={!cancelPayment ? "outline-primary" : "primary"}
                className="request-button"
                onClick={handleCancel}
              >
                {t("미납부")}
              </Button>
            </ButtonGroup>
          </div>
          <div style={{ color: "#888", fontSize: "10pt", paddingTop: "15px" }}>
            {t("Label:label", {
              kor:
                "납부를 선택하시면 이번 학기 11월 학자금에서 20,200원이 공제됩니다.",
              eng:
                "If you choose Yes, an amount of ₩20,200 will be deducted from this semester's November scholarship."
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleSubmit}
            className="float-right"
            variant="primary"
          >
            {t("저장")}
          </Button>
        </Modal.Footer>
      </Modal>
      <Header />
      <Container className="flex-grow-1 p-3">
        <BoardHeader title={t("학생회비")} />
        <Row>
          <Col sm={5} md={4} lg={3} className="d-flex flex-column">
            <div style={{ fontSize: "14pt" }}>{t("학생회비 납부 횟수")}</div>
          </Col>
          <Col className="d-flex align-items-center">
            <ProgressBar style={{ margin: "5px 0px" }} className="flex-grow-1">
              <ProgressBar
                now={(payments.length / 8) * 100}
                label={`${payments.length}/8${t("회")}`}
                key={1}
              />
              <ProgressBar
                animated
                variant="info"
                now={cancelPayment === false ? 12.5 : 0}
                key={2}
              />
            </ProgressBar>
          </Col>
        </Row>
        <Row className="comment">
          <Col>
            {t(
              "2015년 가을까지 모든 재적학기는 회비를 납부한 것으로 인정되며, 현재 기록에 포함되어 있지 않습니다."
            )}
            <br />
            {t(
              "그 외 기록이 누락 된 경우 kaistua@kaist.ac.kr로 문의해 주십시오."
            )}
          </Col>
        </Row>
        <div className="divider" />
        <Row className="d-flex align-items-center payment-row">
          <Col lg={7}>
            <span style={{ fontSize: "15pt", fontFamily: "NanumSquare Bold" }}>
              {t("2020년 가을학기")}
            </span>
            {paymentDeadline ? (
              <span
                style={{ fontSize: "10pt", color: "#0a0", paddingLeft: "10px" }}
              >
                {t("Label:label", {
                  kor: "10월 18일까지 변경 가능",
                  eng: "Changes accepted until Oct. 18"
                })}
              </span>
            ) : (
              <span
                style={{ fontSize: "10pt", color: "#a00", paddingLeft: "10px" }}
              >
                {t("Label:label", {
                  kor: "변경 기간이 지났습니다.",
                  eng: "The payment decision period has ended."
                })}
              </span>
            )}
          </Col>
          {cancelPayment ? (
            <Col lg={3} className="d-flex" style={{ color: "#888" }}>
              {t("납부 안함")}
            </Col>
          ) : (
            <Col lg={3} className="d-flex">
              {t("Label:label", {
                kor: "11월 10일 납부 예정",
                eng: "Will be charged on Nov. 10"
              })}
            </Col>
          )}
          <Col lg={2} className="d-flex justify-content-end">
            <Button disabled={!paymentDeadline} onClick={handleShow}>
              {t("변경하기")}
            </Button>
          </Col>
        </Row>
        <div className="divider" />
        {loading ? (
          <Container className="payments-loading">
            <Spinner animation="border" />
            <div>Loading...</div>
          </Container>
        ) : (
          payments.map(({ year, semester }) => (
            <>
              <Row className="d-flex align-items-center payment-row">
                <Col lg={7}>
                  <span
                    style={{ fontSize: "15pt", fontFamily: "NanumSquare Bold" }}
                  >
                    {year}
                    {t("년")} {semester === "fall" ? t("가을") : t("봄")}
                    {t("학기")}
                  </span>
                </Col>
                <Col lg={3} className="d-flex" style={{ color: "#888" }}>
                  {t("납부 완료")}
                </Col>
                <Col lg={2} className="d-flex justify-content-end">
                  <Button disabled variant="secondary">
                    {t("변경하기")}
                  </Button>
                </Col>
              </Row>
              <div className="divider" />
            </>
          ))
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default withRouter(StudentFeePage);
