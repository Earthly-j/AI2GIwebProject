package jp.kurologi.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import jp.kurologi.model.MemberDTO;
import util.DBmanager;

/** KURO_MEMBER 테이블 전용 DAO (회원가입 · 로그인 · 아이디 중복확인) */
public class MemberDAO {

	/**
	 * ★★★ DB 연결을 얻는 곳은 이 메서드 한 군데뿐이다 (MemberFindDAO 도 이걸 쓴다) ★★★
	 * 기존 MemberDAO 에서 Connection 을 얻던 코드와 똑같이 맞춰 주세요.
	 * (예: DBmanager.getInstance() 또는 DBmanager.getConnection())
	 */
	static Connection conn() throws Exception {
		return DBmanager.getInstance();
	}

	// SELECT 할 컬럼 목록 (날짜는 to_char 로 문자열 변환)
	private static final String COLUMNS =
			"ID, LOGIN_ID, PASSWORD_HASH, NAME, ENGLISH_NAME, MAILBOX_NO, MEMBER_NO, PHONE, EMAIL, "
			+ "SMS_REFUSE, MEMBER_TYPE, GRADE, POINTS, REFERRAL_POINTS_PENDING, REFERRAL_CODE, "
			+ "DEPOSIT, COUPONS, TO_CHAR(LAST_LOGIN_AT, 'YYYY-MM-DD HH24:MI:SS') AS LAST_LOGIN_AT, WITHDRAWN";

	/** 아이디 중복 여부. true = 이미 있는 아이디(중복) */
	public boolean idCheck(String loginId) {

		String sql = "SELECT ID FROM KURO_MEMBER WHERE LOGIN_ID = ?";
		boolean isDuplicate = false;

		try (Connection conn = conn();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {
			pstmt.setString(1, loginId);
			try (ResultSet rs = pstmt.executeQuery()) {
				isDuplicate = rs.next();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return isDuplicate;
	}

	/** 다음 회원 번호(MEMBER_SEQ). 실패하면 -1 */
	public long nextId() {

		String sql = "SELECT MEMBER_SEQ.NEXTVAL FROM DUAL";

		try (Connection conn = conn();
				PreparedStatement pstmt = conn.prepareStatement(sql);
				ResultSet rs = pstmt.executeQuery()) {
			if (rs.next()) {
				return rs.getLong(1);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return -1;
	}

	/**
	 * 회원 등록. 성공하면 1, 실패하면 0.
	 * MEMBER_TYPE, GRADE, POINTS, DEPOSIT, COUPONS, WITHDRAWN 등은 테이블 DEFAULT 값에 맡긴다.
	 * (수정) 비밀번호 퀴즈 답(PW_QUIZ_ANSWER)을 함께 저장한다 -> 먼저 sql/add_pw_quiz.sql 을 실행해야 한다
	 */
	public int memberInsert(MemberDTO dto) {

		String sql = "INSERT INTO KURO_MEMBER "
				+ "(ID, LOGIN_ID, PASSWORD_HASH, NAME, ENGLISH_NAME, MAILBOX_NO, MEMBER_NO, PHONE, EMAIL, SMS_REFUSE, PW_QUIZ_ANSWER) "
				+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		try (Connection conn = conn();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {

			pstmt.setLong(1, dto.getId());
			pstmt.setString(2, dto.getLoginId());
			pstmt.setString(3, dto.getPasswordHash());
			pstmt.setString(4, dto.getName());
			pstmt.setString(5, dto.getEnglishName());
			pstmt.setString(6, dto.getMailboxNo());
			pstmt.setString(7, dto.getMemberNo());
			pstmt.setString(8, dto.getPhone());
			pstmt.setString(9, dto.getEmail());
			pstmt.setString(10, dto.isSmsRefuse() ? "Y" : "N");
			pstmt.setString(11, dto.getPwQuizAnswerHash());

			return pstmt.executeUpdate();

		} catch (Exception e) {
			e.printStackTrace();
		}
		return 0;
	}

	/** 로그인용 조회. 아이디로 한 명을 찾아 DTO 로 돌려준다(없으면 null) */
	public MemberDTO login(String loginId) {

		String sql = "SELECT " + COLUMNS + " FROM KURO_MEMBER WHERE LOGIN_ID = ?";
		MemberDTO dto = null;

		try (Connection conn = conn();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {

			pstmt.setString(1, loginId);

			try (ResultSet rs = pstmt.executeQuery()) {
				if (rs.next()) {
					dto = new MemberDTO();
					dto.setId(rs.getLong("ID"));
					dto.setLoginId(rs.getString("LOGIN_ID"));
					dto.setPasswordHash(rs.getString("PASSWORD_HASH"));
					dto.setName(rs.getString("NAME"));
					dto.setEnglishName(rs.getString("ENGLISH_NAME"));
					dto.setMailboxNo(rs.getString("MAILBOX_NO"));
					dto.setMemberNo(rs.getString("MEMBER_NO"));
					dto.setPhone(rs.getString("PHONE"));
					dto.setEmail(rs.getString("EMAIL"));
					dto.setSmsRefuse("Y".equals(rs.getString("SMS_REFUSE")));
					dto.setMemberType(rs.getString("MEMBER_TYPE"));
					dto.setGrade(rs.getString("GRADE"));
					dto.setPoints(rs.getLong("POINTS"));
					dto.setReferralPointsPending(rs.getLong("REFERRAL_POINTS_PENDING"));
					dto.setReferralCode(rs.getString("REFERRAL_CODE"));
					dto.setDeposit(rs.getLong("DEPOSIT"));
					dto.setCoupons(rs.getInt("COUPONS"));
					dto.setLastLoginAt(rs.getString("LAST_LOGIN_AT"));
					dto.setWithdrawn("Y".equals(rs.getString("WITHDRAWN")));
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return dto;
	}

	/** 로그인 성공 시 마지막 로그인 시각 갱신 */
	public void updateLastLogin(long id) {

		String sql = "UPDATE KURO_MEMBER SET LAST_LOGIN_AT = SYSTIMESTAMP WHERE ID = ?";

		try (Connection conn = conn();
				PreparedStatement pstmt = conn.prepareStatement(sql)) {
			pstmt.setLong(1, id);
			pstmt.executeUpdate();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
