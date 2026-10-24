package jp.kurologi.service;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/** 로그아웃 : 세션을 통째로 지우고 홈으로 이동 */
public class LogoutCommand implements Command {

	@Override
	public boolean doCommand(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		HttpSession session = request.getSession(false);   // 없으면 새로 만들지 않는다
		if (session != null) {
			session.invalidate();   // loginMember 포함 세션 안의 모든 값 제거
		}

		response.sendRedirect(request.getContextPath() + "/");
		return false;
	}
}
