package jp.kurologi.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.kurologi.model.Grade;
import jp.kurologi.model.MailboxCenter;
import jp.kurologi.model.Member;
import jp.kurologi.model.UsageStats;

/** 마이페이지 — 나의 정보 · 사서함 주소 · 관리 메뉴. */
@WebServlet("/mypage")
public class MyPageServlet extends BaseServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        Member m = member(req);
        UsageStats usage = app().members.usageStats(m.getId());

        req.setAttribute("usage", usage);
        req.setAttribute("centers", MailboxCenter.ALL);
        req.setAttribute("nextGrade", m.getGrade() == Grade.ROYAL_FAMILY ? null : Grade.ROYAL_FAMILY);
        req.setAttribute("countToNextGrade", Math.max(0, Grade.ROYAL_FAMILY_THRESHOLD - usage.thisMonth()));
        req.setAttribute("referralUrl", baseUrl(req) + "/join?ref=" + m.getReferralCode());
        render(req, res, "mypage/mypage");
    }

    private static String baseUrl(HttpServletRequest req) {
        String port = (req.getServerPort() == 80 || req.getServerPort() == 443) ? "" : ":" + req.getServerPort();
        return req.getScheme() + "://" + req.getServerName() + port + req.getContextPath();
    }
}
