package jp.kurologi.web;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.kurologi.model.Member;
import jp.kurologi.model.Payment;
import jp.kurologi.service.PaymentService.PayRequest;
import jp.kurologi.service.ValidationException;

/** 결제방법 — ?tab=pending(비용결제) | history(결제내역), POST 결제하기. */
@WebServlet("/mypage/payment")
public class PaymentServlet extends BaseServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        Member m = member(req);
        boolean history = "history".equals(req.getParameter("tab"));
        req.setAttribute("tab", history ? "history" : "pending");
        if (history) {
            req.setAttribute("payments", app().payments.history(m.getId()));
        } else {
            req.setAttribute("charges", app().payments.pendingCharges(m.getId()));
        }
        render(req, res, "mypage/payment");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        String[] raw = req.getParameterValues("chargeId");
        List<Long> ids = raw == null ? List.of()
                : Arrays.stream(raw).map(s -> parseLong(s, -1)).filter(id -> id > 0).toList();
        PayRequest pay = new PayRequest(
                ids,
                "CARD".equals(req.getParameter("method")) ? Payment.Method.CARD : Payment.Method.BANK,
                parseLong(req.getParameter("depositToUse"), 0),
                req.getParameter("depositorName"));
        try {
            Payment p = app().payments.pay(member(req).getId(), pay);
            Session.flash(req, "info", switch (p.getStatus()) {
                case PAID -> "예치금으로 결제가 완료되었습니다.";
                case AWAITING_DEPOSIT -> String.format("결제 신청이 접수되었습니다. ₩%,d 을(를) 입금자명 '%s'(으)로 입금해 주세요.",
                        p.getPayAmount(), p.getDepositorName());
                // TODO 토스페이먼츠 결제창 연동: 여기서 결제창으로 보내고, 승인 콜백에서 payments.markPaid(id)
                case AWAITING_CARD -> "신용카드(토스) 결제는 PG 연동 후 사용할 수 있습니다. 결제 신청은 결제내역에 저장되었습니다.";
                default -> "결제 신청이 접수되었습니다.";
            });
            redirect(req, res, "/mypage/payment?tab=history");
        } catch (ValidationException e) {
            Session.flash(req, "error", e.getMessage());
            redirect(req, res, "/mypage/payment");
        }
    }
}
